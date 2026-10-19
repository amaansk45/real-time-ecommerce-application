from decimal import Decimal
from django.db import transaction
from django.shortcuts import get_object_or_404
from rest_framework import viewsets, status, filters
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.decorators import action
from apps.common.permissions import IsAdminUserRole
from apps.products.models import Product
from apps.accounts.models import Address
from .models import Coupon, Cart, CartItem, Wishlist, Order, OrderItem
from .serializers import (
    CartSerializer,
    CartItemSerializer,
    WishlistSerializer,
    OrderSerializer,
    CheckoutCreateOrderSerializer,
    CouponSerializer,
)


class CartView(APIView):
    """
    Customer shopping cart management API (Get, Add, Update quantity, Remove, Apply coupon).
    """
    permission_classes = (IsAuthenticated,)

    def get_cart(self, user):
        cart, _ = Cart.objects.get_or_create(user=user)
        return cart

    def get(self, request):
        cart = self.get_cart(request.user)
        serializer = CartSerializer(cart)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request, action=None):
        cart = self.get_cart(request.user)

        # 1. Add item to cart
        if action == 'add':
            product_id = request.data.get('product_id')
            quantity = int(request.data.get('quantity', 1))

            if quantity < 1:
                return Response({'detail': 'Quantity must be at least 1.'}, status=status.HTTP_400_BAD_REQUEST)

            product = get_object_or_404(Product, id=product_id, is_active=True)

            if not product.is_in_stock:
                return Response({'detail': f'{product.title} is currently out of stock.'}, status=status.HTTP_400_BAD_REQUEST)

            cart_item, created = CartItem.objects.get_or_create(cart=cart, product=product)
            if not created:
                new_qty = cart_item.quantity + quantity
                if new_qty > product.stock_quantity:
                    return Response(
                        {'detail': f'Cannot add more. Only {product.stock_quantity} available in stock.'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                cart_item.quantity = new_qty
            else:
                if quantity > product.stock_quantity:
                    return Response(
                        {'detail': f'Cannot add {quantity}. Only {product.stock_quantity} available in stock.'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                cart_item.quantity = quantity
            cart_item.save()

            return Response(CartSerializer(cart).data, status=status.HTTP_200_OK)

        # 2. Apply Coupon
        elif action == 'apply-coupon':
            code = request.data.get('code', '').strip().upper()
            if not code:
                return Response({'detail': 'Please enter a coupon code.'}, status=status.HTTP_400_BAD_REQUEST)

            try:
                coupon = Coupon.objects.get(code=code)
            except Coupon.DoesNotExist:
                return Response({'detail': 'Invalid coupon code.'}, status=status.HTTP_400_BAD_REQUEST)

            is_valid, reason = coupon.is_valid(cart.subtotal)
            if not is_valid:
                return Response({'detail': reason}, status=status.HTTP_400_BAD_REQUEST)

            cart.applied_coupon = coupon
            cart.save()
            return Response(
                {
                    'message': f'Coupon {coupon.code} applied successfully!',
                    'cart': CartSerializer(cart).data,
                },
                status=status.HTTP_200_OK
            )

        # 3. Remove Coupon
        elif action == 'remove-coupon':
            cart.applied_coupon = None
            cart.save()
            return Response(
                {
                    'message': 'Coupon removed.',
                    'cart': CartSerializer(cart).data,
                },
                status=status.HTTP_200_OK
            )

        return Response({'detail': 'Invalid action.'}, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request, item_id=None):
        """Update line item quantity."""
        cart = self.get_cart(request.user)
        cart_item = get_object_or_404(CartItem, id=item_id, cart=cart)
        quantity = int(request.data.get('quantity', 1))

        if quantity < 1:
            cart_item.delete()
        else:
            if quantity > cart_item.product.stock_quantity:
                return Response(
                    {'detail': f'Only {cart_item.product.stock_quantity} available in stock.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            cart_item.quantity = quantity
            cart_item.save()

        return Response(CartSerializer(cart).data, status=status.HTTP_200_OK)

    def delete(self, request, item_id=None):
        """Remove single item or clear whole cart."""
        cart = self.get_cart(request.user)
        if item_id:
            cart_item = get_object_or_404(CartItem, id=item_id, cart=cart)
            cart_item.delete()
        else:
            cart.items.all().delete()
            cart.applied_coupon = None
            cart.save()

        return Response(CartSerializer(cart).data, status=status.HTTP_200_OK)


class WishlistView(APIView):
    """
    Customer wishlist API (Get wishlist, Toggle item).
    """
    permission_classes = (IsAuthenticated,)

    def get_wishlist(self, user):
        wishlist, _ = Wishlist.objects.get_or_create(user=user)
        return wishlist

    def get(self, request):
        wishlist = self.get_wishlist(request.user)
        serializer = WishlistSerializer(wishlist)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        product_id = request.data.get('product_id')
        product = get_object_or_404(Product, id=product_id, is_active=True)
        wishlist = self.get_wishlist(request.user)

        if wishlist.products.filter(id=product.id).exists():
            wishlist.products.remove(product)
            in_wishlist = False
            msg = f'{product.title} removed from your Wishlist.'
        else:
            wishlist.products.add(product)
            in_wishlist = True
            msg = f'{product.title} saved to your Wishlist!'

        return Response(
            {
                'message': msg,
                'in_wishlist': in_wishlist,
                'wishlist_count': wishlist.products.count()
            },
            status=status.HTTP_200_OK
        )


class CheckoutView(APIView):
    """
    Processes cart checkout, reserves inventory, creates immutable Order snapshot, and clears cart.
    """
    permission_classes = (IsAuthenticated,)

    @transaction.atomic
    def post(self, request):
        cart, _ = Cart.objects.get_or_create(user=request.user)

        if not cart.items.exists():
            return Response({'detail': 'Your cart is empty. Add items before checkout.'}, status=status.HTTP_400_BAD_REQUEST)

        serializer = CheckoutCreateOrderSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)

        address_id = serializer.validated_data['address_id']
        payment_method = serializer.validated_data['payment_method']
        customer_notes = serializer.validated_data.get('customer_notes', '')

        address = Address.objects.get(id=address_id, user=request.user)

        # 1. Validate Stock Availability & Deduct Inventory
        for item in cart.items.select_related('product'):
            if item.product.stock_quantity < item.quantity:
                return Response(
                    {'detail': f'Insufficient stock for {item.product.title}. Only {item.product.stock_quantity} left.'},
                    status=status.HTTP_400_BAD_REQUEST
                )

        # 2. Compute Financials
        items_subtotal = cart.subtotal
        discount_amount = cart.discount_amount
        shipping_fee = cart.shipping_fee
        total_amount = cart.grand_total
        coupon_code = cart.applied_coupon.code if cart.applied_coupon else ''

        # 3. Create Order
        order = Order.objects.create(
            order_number=Order.generate_order_number(),
            customer=request.user,
            status=Order.OrderStatus.CONFIRMED if payment_method == Order.PaymentMethod.COD else Order.OrderStatus.PENDING,
            payment_method=payment_method,
            payment_status=Order.PaymentStatus.PENDING,
            shipping_full_name=address.full_name,
            shipping_phone=address.phone_number,
            shipping_street_address=address.street_address,
            shipping_apartment_suite=address.apartment_suite,
            shipping_city=address.city,
            shipping_state=address.state,
            shipping_postal_code=address.postal_code,
            shipping_country=address.country,
            items_subtotal=items_subtotal,
            discount_amount=discount_amount,
            coupon_code=coupon_code,
            shipping_fee=shipping_fee,
            total_amount=total_amount,
            customer_notes=customer_notes,
        )

        # 4. Create OrderItems & Decrement Stock
        for item in cart.items.select_related('product'):
            product = item.product
            OrderItem.objects.create(
                order=order,
                product=product,
                product_title=product.title,
                product_sku=product.sku,
                product_image_url=product.primary_image_url or '',
                unit_price=item.unit_price,
                quantity=item.quantity,
                total_price=item.subtotal,
            )
            # Deduct stock
            product.stock_quantity -= item.quantity
            product.save()

        # 5. Increment coupon usage count if used
        if cart.applied_coupon:
            cart.applied_coupon.used_count += 1
            cart.applied_coupon.save()

        # 6. Clear cart
        cart.items.all().delete()
        cart.applied_coupon = None
        cart.save()

        order_data = OrderSerializer(order).data

        return Response(
            {
                'message': 'Order placed successfully!' if payment_method == Order.PaymentMethod.COD else 'Order created. Ready for payment.',
                'order': order_data,
            },
            status=status.HTTP_201_CREATED
        )


class OrderViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Customer Order ViewSet (List order history, view tracking details, cancel order).
    """
    permission_classes = (IsAuthenticated,)
    serializer_class = OrderSerializer
    lookup_field = 'order_number'

    def get_queryset(self):
        return Order.objects.filter(customer=self.request.user).prefetch_related('items')

    @action(detail=True, methods=['post'])
    def cancel(self, request, order_number=None):
        """Cancel order and restore product stock."""
        order = self.get_object()
        if not order.can_cancel():
            return Response(
                {'detail': f'Order cannot be cancelled in its current state ({order.get_status_display()}).'},
                status=status.HTTP_400_BAD_REQUEST
            )

        with transaction.atomic():
            order.status = Order.OrderStatus.CANCELLED
            order.save()

            # Restore product inventory
            for item in order.items.all():
                if item.product:
                    item.product.stock_quantity += item.quantity
                    item.product.save()

        return Response(
            {'message': 'Order cancelled successfully and inventory restored.', 'order': OrderSerializer(order).data},
            status=status.HTTP_200_OK
        )

    @action(detail=True, methods=['post'], url_path='return-request')
    def return_request(self, request, order_number=None):
        """Customer requests return/refund for a delivered order."""
        order = self.get_object()
        if order.status != Order.OrderStatus.DELIVERED:
            return Response(
                {'detail': 'Return can only be requested for delivered orders within 7 days.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        order.status = Order.OrderStatus.RETURN_REQUESTED
        order.save()
        return Response(
            {'message': 'Return request submitted. Our customer care will review and arrange reverse pickup.', 'order': OrderSerializer(order).data},
            status=status.HTTP_200_OK
        )


class AdminOrderViewSet(viewsets.ModelViewSet):
    """
    Admin ViewSet for managing orders, updating tracking details, and changing order status.
    """
    permission_classes = (IsAuthenticated, IsAdminUserRole)
    queryset = Order.objects.all().select_related('customer').prefetch_related('items')
    serializer_class = OrderSerializer
    filter_backends = (filters.SearchFilter, filters.OrderingFilter)
    search_fields = ('order_number', 'customer__email', 'shipping_phone', 'tracking_number')
    ordering = ('-created_at',)


class OrderStatusHealthView(APIView):
    """
    Health check for orders subsystem.
    """
    permission_classes = (AllowAny,)

    def get(self, request):
        return Response(
            {
                "status": "healthy",
                "service": "orders",
                "total_orders": Order.objects.count(),
                "active_coupons": Coupon.objects.filter(is_active=True).count(),
            },
            status=status.HTTP_200_OK
        )
