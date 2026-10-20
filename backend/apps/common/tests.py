from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status


class BackendSetupTests(TestCase):
    """
    Test suite for Step 2 backend initialization and routing.
    """
    def setUp(self):
        self.client = APIClient()

    def test_api_root_health_endpoint(self):
        """Verify that the API root health endpoint returns 200 and operational metadata."""
        response = self.client.get('/api/health/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertEqual(data.get('app'), 'Indian Bazar E-Commerce API')
        self.assertEqual(data.get('status'), 'operational')
        self.assertIn('endpoints', data)

    def test_accounts_status_endpoint(self):
        """Verify accounts app status endpoint."""
        response = self.client.get('/api/auth/status/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json().get('service'), 'accounts')

    def test_products_status_endpoint(self):
        """Verify products app status endpoint."""
        response = self.client.get('/api/products/status/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json().get('service'), 'products')

    def test_orders_status_endpoint(self):
        """Verify orders app status endpoint."""
        response = self.client.get('/api/orders/status/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json().get('service'), 'orders')

    def test_payments_status_endpoint(self):
        """Verify payments app status endpoint."""
        response = self.client.get('/api/payments/status/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json().get('service'), 'payments')


class AdminDashboardManagementTests(TestCase):
    """
    Test suite for Step 7: Admin Dashboard Metrics, Store Management & Role Permissions.
    """
    def setUp(self):
        self.client = APIClient()
        from django.contrib.auth import get_user_model
        from apps.products.models import Category, Product
        from apps.orders.models import Order, OrderItem, Coupon
        from decimal import Decimal

        User = get_user_model()
        self.admin = User.objects.create_superuser(
            email='admin_tester@indianbazar.com',
            password='AdminPassword@123',
            first_name='Admin',
            last_name='Tester'
        )
        self.customer = User.objects.create_user(
            email='customer_tester@indianbazar.com',
            password='CustomerPassword@123',
            first_name='Customer',
            last_name='Tester'
        )

        self.category = Category.objects.create(name='Test Category', slug='test-category')
        self.product = Product.objects.create(
            title='Admin Test Product',
            sku='ADM-TEST-001',
            category=self.category,
            price=Decimal('1000.00'),
            stock_quantity=10,
        )
        self.order = Order.objects.create(
            order_number='TEST-ORD-1001',
            customer=self.customer,
            status=Order.OrderStatus.PENDING,
            payment_method=Order.PaymentMethod.COD,
            shipping_full_name='Customer Tester',
            shipping_phone='9876543210',
            shipping_street_address='123 Test Street',
            shipping_city='Mumbai',
            shipping_state='Maharashtra',
            shipping_postal_code='400001',
            shipping_country='India',
            items_subtotal=Decimal('1000.00'),
            total_amount=Decimal('1000.00'),
        )
        OrderItem.objects.create(
            order=self.order,
            product=self.product,
            product_title=self.product.title,
            product_sku=self.product.sku,
            unit_price=Decimal('1000.00'),
            quantity=2,
            total_price=Decimal('2000.00')
        )

    def test_admin_metrics_permissions(self):
        """Verify that metrics endpoint rejects unauthenticated and non-admin users."""
        # 1. Unauthenticated -> 401
        res1 = self.client.get('/api/common/admin/metrics/')
        self.assertEqual(res1.status_code, status.HTTP_401_UNAUTHORIZED)

        # 2. Customer user -> 403 Forbidden
        self.client.force_authenticate(user=self.customer)
        res2 = self.client.get('/api/common/admin/metrics/')
        self.assertEqual(res2.status_code, status.HTTP_403_FORBIDDEN)

        # 3. Store Admin -> 200 OK
        self.client.force_authenticate(user=self.admin)
        res3 = self.client.get('/api/common/admin/metrics/')
        self.assertEqual(res3.status_code, status.HTTP_200_OK)
        data = res3.json()
        self.assertIn('overview', data)
        self.assertIn('status_distribution', data)
        self.assertIn('recent_orders', data)
        self.assertIn('daily_sales', data)
        self.assertEqual(data['overview']['total_orders'], 1)
        self.assertEqual(data['overview']['total_products'], 1)

    def test_admin_order_status_update(self):
        """Verify that store admin can update order status and fulfillment tracking."""
        self.client.force_authenticate(user=self.admin)
        res = self.client.post(
            f'/api/orders/admin/orders/{self.order.id}/update-status/',
            {'status': 'SHIPPED', 'tracking_number': 'BLUEDART-998877'},
            format='json'
        )
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.order.refresh_from_db()
        self.assertEqual(self.order.status, 'SHIPPED')
        self.assertEqual(self.order.tracking_number, 'BLUEDART-998877')

    def test_admin_category_crud(self):
        """Verify that store admin can create new categories via AdminCategoryViewSet."""
        self.client.force_authenticate(user=self.admin)
        payload = {
            'name': 'Royal Brass Artifacts',
            'description': 'Handcrafted brassware from Moradabad',
            'is_featured': True,
            'order': 1
        }
        res = self.client.post('/api/products/admin/categories/', payload, format='json')
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertEqual(res.json()['name'], 'Royal Brass Artifacts')
        self.assertEqual(res.json()['slug'], 'royal-brass-artifacts')

    def test_admin_coupon_crud(self):
        """Verify that store admin can create and manage coupons."""
        self.client.force_authenticate(user=self.admin)
        payload = {
            'code': 'DIWALI25',
            'discount_type': 'PERCENTAGE',
            'discount_value': '25.00',
            'min_order_amount': '1500.00',
            'is_active': True
        }
        res = self.client.post('/api/orders/admin/coupons/', payload, format='json')
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertEqual(res.json()['code'], 'DIWALI25')

