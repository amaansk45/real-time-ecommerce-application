from datetime import timedelta
from django.utils import timezone
from django.db.models import Sum, Count, Q
from django.contrib.auth import get_user_model
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from apps.common.permissions import IsAdminUserRole
from apps.orders.models import Order
from apps.products.models import Product, Category

User = get_user_model()


class ApiRootHealthView(APIView):
    """
    Root health-check and metadata endpoint for Indian Bazar API.
    """
    permission_classes = []

    def get(self, request):
        return Response(
            {
                "app": "Indian Bazar E-Commerce API",
                "version": "1.0.0",
                "status": "operational",
                "timestamp": timezone.now().isoformat(),
                "endpoints": {
                    "health": "/api/health/",
                    "admin": "/admin/",
                    "accounts": "/api/auth/status/",
                    "products": "/api/products/status/",
                    "orders": "/api/orders/status/",
                    "payments": "/api/payments/status/",
                    "admin_metrics": "/api/common/admin/metrics/",
                }
            },
            status=status.HTTP_200_OK
        )


class AdminDashboardMetricsView(APIView):
    """
    Comprehensive Analytics & KPI Metrics endpoint for the Indian Bazar Store Administrator.
    Computes total revenue, orders count, low-stock alerts, customer growth, and 7-day sales charts.
    """
    permission_classes = (IsAuthenticated, IsAdminUserRole)

    def get(self, request):
        now = timezone.now()

        # 1. Financials & Counts
        total_revenue_agg = Order.objects.filter(
            Q(payment_status=Order.PaymentStatus.PAID) | Q(status=Order.OrderStatus.DELIVERED)
        ).aggregate(total=Sum('total_amount'))
        total_revenue = total_revenue_agg['total'] or 0

        total_orders = Order.objects.count()
        pending_orders = Order.objects.filter(status=Order.OrderStatus.PENDING).count()
        confirmed_orders = Order.objects.filter(status=Order.OrderStatus.CONFIRMED).count()
        delivered_orders = Order.objects.filter(status=Order.OrderStatus.DELIVERED).count()
        cancelled_orders = Order.objects.filter(status=Order.OrderStatus.CANCELLED).count()

        total_customers = User.objects.filter(role=User.Role.CUSTOMER).count()
        total_products = Product.objects.count()
        low_stock_count = Product.objects.filter(stock_quantity__lte=5, stock_quantity__gt=0).count()
        out_of_stock_count = Product.objects.filter(stock_quantity=0).count()

        # 2. Status Breakdown
        status_distribution = {
            'pending': pending_orders,
            'confirmed': confirmed_orders,
            'processing': Order.objects.filter(status=Order.OrderStatus.PROCESSING).count(),
            'shipped': Order.objects.filter(status=Order.OrderStatus.SHIPPED).count(),
            'delivered': delivered_orders,
            'cancelled': cancelled_orders,
            'return_requested': Order.objects.filter(status=Order.OrderStatus.RETURN_REQUESTED).count(),
        }

        # 3. Recent Orders (Latest 6)
        recent_orders_qs = Order.objects.select_related('customer').order_by('-created_at')[:6]
        recent_orders = [
            {
                'id': o.id,
                'order_number': o.order_number,
                'customer_name': o.shipping_full_name or o.customer.full_name or o.customer.email,
                'customer_email': o.customer.email,
                'total_amount': float(o.total_amount),
                'status': o.status,
                'payment_method': o.payment_method,
                'payment_status': o.payment_status,
                'items_count': o.items.count(),
                'created_at': o.created_at.isoformat(),
            }
            for o in recent_orders_qs
        ]

        # 4. Low Stock Products Alert List (Up to 6)
        low_stock_products_qs = Product.objects.filter(stock_quantity__lte=5).select_related('category').order_by('stock_quantity')[:6]
        low_stock_products = [
            {
                'id': p.id,
                'title': p.title,
                'sku': p.sku,
                'category_name': p.category.name if p.category else 'General',
                'price': float(p.effective_price),
                'stock_quantity': p.stock_quantity,
                'is_in_stock': p.is_in_stock,
            }
            for p in low_stock_products_qs
        ]

        # 5. Last 7 Days Daily Revenue Chart
        daily_sales = []
        for i in range(6, -1, -1):
            day_start = (now - timedelta(days=i)).replace(hour=0, minute=0, second=0, microsecond=0)
            day_end = day_start + timedelta(days=1)
            day_orders = Order.objects.filter(
                created_at__gte=day_start,
                created_at__lt=day_end
            )
            day_revenue_agg = day_orders.filter(
                Q(payment_status=Order.PaymentStatus.PAID) | Q(status=Order.OrderStatus.DELIVERED)
            ).aggregate(total=Sum('total_amount'))
            
            daily_sales.append({
                'day': day_start.strftime('%a, %d %b'),
                'revenue': float(day_revenue_agg['total'] or 0),
                'orders_count': day_orders.count(),
            })

        return Response(
            {
                'overview': {
                    'total_revenue': float(total_revenue),
                    'total_orders': total_orders,
                    'total_customers': total_customers,
                    'total_products': total_products,
                    'low_stock_count': low_stock_count,
                    'out_of_stock_count': out_of_stock_count,
                },
                'status_distribution': status_distribution,
                'recent_orders': recent_orders,
                'low_stock_products': low_stock_products,
                'daily_sales': daily_sales,
            },
            status=status.HTTP_200_OK
        )

