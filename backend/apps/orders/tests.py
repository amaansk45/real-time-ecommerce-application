from decimal import Decimal
from django.test import TestCase
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta
from rest_framework.test import APIClient
from rest_framework import status
from apps.products.models import Category, Product
from apps.accounts.models import Address
from apps.orders.models import Coupon, Cart, CartItem, Wishlist, Order, OrderItem

User = get_user_model()


class CartAndCouponAPITests(TestCase):
    """Integration tests for Cart line items, stock validation, and coupon calculation."""

    def setUp(self):
        self.client = APIClient()
        self.customer = User.objects.create_user(
            email='cartuser@test.com',
            password='Password123!',
            first_name='Anil'
        )
        self.client.force_authenticate(user=self.customer)

        self.category = Category.objects.create(name='Spices')
        self.product1 = Product.objects.create(
            title='Organic Saffron 5g',
            sku='SAF-001',
            category=self.category,
            price=Decimal('1500.00'),
            stock_quantity=10
        )
        self.product2 = Product.objects.create(
            title='Black Pepper 500g',
            sku='PEP-001',
            category=self.category,
            price=Decimal('400.00'),
            stock_quantity=2
        )

        now = timezone.now()
        self.coupon = Coupon.objects.create(
            code='SAVE20',
            discount_type=Coupon.DiscountType.PERCENTAGE,
            discount_value=Decimal('20.00'),
            min_order_amount=Decimal('1000.00'),
            max_discount_amount=Decimal('500.00'),
            valid_from=now - timedelta(days=1),
            valid_to=now + timedelta(days=30),
            usage_limit=100
        )

    def test_get_cart_initially_empty(self):
        response = self.client.get('/api/orders/cart/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json()['items_count'], 0)
        self.assertEqual(Decimal(str(response.json()['subtotal'])), Decimal('0.00'))

    def test_add_product_to_cart_success(self):
        response = self.client.post(
            '/api/orders/cart/add/',
            {'product_id': self.product1.id, 'quantity': 2},
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json()['items_count'], 2)
        self.assertEqual(Decimal(str(response.json()['subtotal'])), Decimal('3000.00'))
        # Over ₹999 shipping fee is free (0.00)
        self.assertEqual(Decimal(str(response.json()['shipping_fee'])), Decimal('0.00'))

    def test_add_quantity_exceeding_stock_rejected(self):
        response = self.client.post(
            '/api/orders/cart/add/',
            {'product_id': self.product2.id, 'quantity': 5},
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_apply_coupon_percentage_success(self):
        # Add item of ₹1500
        self.client.post('/api/orders/cart/add/', {'product_id': self.product1.id, 'quantity': 1}, format='json')
        # Apply SAVE20 (20% off 1500 = 300)
        response = self.client.post('/api/orders/cart/apply-coupon/', {'code': 'SAVE20'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        cart_data = response.json()['cart']
        self.assertEqual(Decimal(str(cart_data['discount_amount'])), Decimal('300.00'))
        self.assertEqual(Decimal(str(cart_data['grand_total'])), Decimal('1200.00'))


class WishlistAPITests(TestCase):
    """Tests for customer Wishlist toggle."""

    def setUp(self):
        self.client = APIClient()
        self.customer = User.objects.create_user(
            email='wishuser@test.com',
            password='Password123!',
            first_name='Kiran'
        )
        self.client.force_authenticate(user=self.customer)
        self.category = Category.objects.create(name='Clothing')
        self.product = Product.objects.create(
            title='Silk Kurta',
            sku='KUR-001',
            category=self.category,
            price=Decimal('2000.00'),
            stock_quantity=5
        )

    def test_toggle_wishlist_add_and_remove(self):
        # 1. Add to wishlist
        res1 = self.client.post('/api/orders/wishlist/', {'product_id': self.product.id}, format='json')
        self.assertEqual(res1.status_code, status.HTTP_200_OK)
        self.assertTrue(res1.json()['in_wishlist'])
        self.assertEqual(res1.json()['wishlist_count'], 1)

        # 2. Toggle remove
        res2 = self.client.post('/api/orders/wishlist/', {'product_id': self.product.id}, format='json')
        self.assertEqual(res2.status_code, status.HTTP_200_OK)
        self.assertFalse(res2.json()['in_wishlist'])
        self.assertEqual(res2.json()['wishlist_count'], 0)


class CheckoutAndOrderAPITests(TestCase):
    """Tests for Checkout creation, stock deduction, and Order cancellation."""

    def setUp(self):
        self.client = APIClient()
        self.customer = User.objects.create_user(
            email='checkoutuser@test.com',
            password='Password123!',
            first_name='Sunita'
        )
        self.client.force_authenticate(user=self.customer)

        self.address = Address.objects.create(
            user=self.customer,
            full_name='Sunita Rao',
            phone_number='9876543210',
            street_address='Flat 4B, Lotus Enclave',
            city='Hyderabad',
            state='Telangana',
            postal_code='500001'
        )

        self.category = Category.objects.create(name='Handicrafts')
        self.product = Product.objects.create(
            title='Brass Diya',
            sku='DIY-001',
            category=self.category,
            price=Decimal('1000.00'),
            stock_quantity=10
        )

    def test_checkout_creates_order_and_deducts_stock(self):
        # 1. Add 2 items to cart
        self.client.post('/api/orders/cart/add/', {'product_id': self.product.id, 'quantity': 2}, format='json')

        # 2. Checkout with COD
        payload = {
            'address_id': self.address.id,
            'payment_method': 'COD',
            'customer_notes': 'Please call before delivery'
        }
        res = self.client.post('/api/orders/checkout/', payload, format='json')
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        order_data = res.json()['order']
        self.assertEqual(order_data['status'], 'CONFIRMED')
        self.assertEqual(order_data['payment_method'], 'COD')
        self.assertEqual(Decimal(str(order_data['total_amount'])), Decimal('2000.00'))

        # Verify stock decreased by 2
        self.product.refresh_from_db()
        self.assertEqual(self.product.stock_quantity, 8)

        # Verify cart was emptied
        cart_res = self.client.get('/api/orders/cart/')
        self.assertEqual(cart_res.json()['items_count'], 0)

    def test_customer_can_cancel_pending_order_and_restores_stock(self):
        # Create order
        self.client.post('/api/orders/cart/add/', {'product_id': self.product.id, 'quantity': 3}, format='json')
        res = self.client.post('/api/orders/checkout/', {'address_id': self.address.id, 'payment_method': 'COD'}, format='json')
        order_number = res.json()['order']['order_number']

        self.product.refresh_from_db()
        self.assertEqual(self.product.stock_quantity, 7)

        # Cancel order
        cancel_res = self.client.post(f'/api/orders/{order_number}/cancel/')
        self.assertEqual(cancel_res.status_code, status.HTTP_200_OK)
        self.assertEqual(cancel_res.json()['order']['status'], 'CANCELLED')

        # Verify stock restored back to 10
        self.product.refresh_from_db()
        self.assertEqual(self.product.stock_quantity, 10)
