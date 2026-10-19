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
