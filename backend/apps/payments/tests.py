from decimal import Decimal
from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from apps.orders.models import Order
from apps.payments.models import PaymentTransaction

User = get_user_model()


class PaymentAPITests(TestCase):
    """Integration tests for Razorpay online order creation, signature verification, and COD confirmation."""

    def setUp(self):
        self.client = APIClient()
        self.customer = User.objects.create_user(
            email='payuser@test.com',
            password='Password123!',
            first_name='Sameer'
        )
        self.client.force_authenticate(user=self.customer)

        self.order = Order.objects.create(
            order_number='IB-TEST-PAY-001',
            customer=self.customer,
            status=Order.OrderStatus.PENDING,
            payment_method=Order.PaymentMethod.RAZORPAY,
            payment_status=Order.PaymentStatus.PENDING,
            shipping_full_name='Sameer Khan',
            shipping_phone='9988776655',
            shipping_street_address='12 MG Road',
            shipping_city='Pune',
            shipping_state='Maharashtra',
            shipping_postal_code='411001',
            items_subtotal=Decimal('1500.00'),
            total_amount=Decimal('1500.00')
        )

    def test_razorpay_create_order_endpoint(self):
        response = self.client.post(
            '/api/payments/razorpay/create-order/',
            {'order_number': self.order.order_number},
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertIn('razorpay_order_id', data)
        self.assertEqual(data['amount'], 150000)  # 1500 * 100 paise
        self.assertEqual(data['currency'], 'INR')
        self.assertEqual(data['order_number'], self.order.order_number)

    def test_razorpay_verify_valid_signature_marks_order_paid(self):
        response = self.client.post(
            '/api/payments/razorpay/verify/',
            {
                'order_number': self.order.order_number,
                'razorpay_order_id': 'order_mock_test12345',
                'razorpay_payment_id': 'pay_mock_test67890',
                'razorpay_signature': 'mock_signature_valid',
            },
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.order.refresh_from_db()
        self.assertEqual(self.order.status, Order.OrderStatus.CONFIRMED)
        self.assertEqual(self.order.payment_status, Order.PaymentStatus.PAID)

        # Check PaymentTransaction was recorded
        transaction = PaymentTransaction.objects.get(order=self.order)
        self.assertEqual(transaction.status, PaymentTransaction.TransactionStatus.CAPTURED)
        self.assertEqual(transaction.razorpay_payment_id, 'pay_mock_test67890')

    def test_confirm_cod_payment_endpoint(self):
        cod_order = Order.objects.create(
            order_number='IB-TEST-COD-001',
            customer=self.customer,
            status=Order.OrderStatus.PENDING,
            payment_method=Order.PaymentMethod.COD,
            shipping_full_name='Sameer Khan',
            shipping_phone='9988776655',
            shipping_street_address='12 MG Road',
            shipping_city='Pune',
            shipping_state='Maharashtra',
            shipping_postal_code='411001',
            items_subtotal=Decimal('800.00'),
            total_amount=Decimal('899.00')
        )
        response = self.client.post(
            '/api/payments/cod/confirm/',
            {'order_number': cod_order.order_number},
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        cod_order.refresh_from_db()
        self.assertEqual(cod_order.status, Order.OrderStatus.CONFIRMED)
        self.assertEqual(cod_order.payment_status, Order.PaymentStatus.PENDING)
