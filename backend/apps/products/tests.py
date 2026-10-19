from decimal import Decimal
from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from apps.products.models import Category, Subcategory, Product, ProductImage, Review

User = get_user_model()


class CategoryAndProductModelTests(TestCase):
    """Unit tests for Category, Product, and calculated properties."""

    def setUp(self):
        self.category = Category.objects.create(name='Handground Spices')
        self.product = Product.objects.create(
            title='Kashmiri Red Chilli Powder',
            sku='IB-TEST-001',
            category=self.category,
            price=Decimal('400.00'),
            discount_price=Decimal('300.00'),
            stock_quantity=50
        )

    def test_category_slug_auto_generation(self):
        self.assertEqual(self.category.slug, 'handground-spices')

    def test_product_effective_price_and_discount(self):
        self.assertEqual(self.product.effective_price, Decimal('300.00'))
        self.assertEqual(self.product.discount_percentage, 25)
        self.assertTrue(self.product.is_in_stock)

    def test_product_in_stock_property(self):
        self.product.stock_quantity = 0
        self.product.save()
        self.assertFalse(self.product.is_in_stock)


class ProductStorefrontAPITests(TestCase):
    """Integration tests for catalog listing, filtering, search, and details."""

    def setUp(self):
        self.client = APIClient()
        self.cat_ethnic = Category.objects.create(name='Ethnic Wear', slug='ethnic-wear')
        self.cat_spices = Category.objects.create(name='Spices', slug='spices')

        self.p1 = Product.objects.create(
            title='Banarasi Silk Saree',
            sku='SKU-001',
            category=self.cat_ethnic,
            price=Decimal('5000.00'),
            stock_quantity=10,
            origin_region='Varanasi',
            is_active=True
        )
        self.p2 = Product.objects.create(
            title='Tellicherry Black Pepper',
            sku='SKU-002',
            category=self.cat_spices,
            price=Decimal('500.00'),
            stock_quantity=0,
            origin_region='Kerala',
            is_active=True
        )

    def test_list_categories(self):
        response = self.client.get('/api/products/categories/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.json()), 2)

    def test_list_active_products_paginated(self):
        response = self.client.get('/api/products/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json()['count'], 2)

    def test_filter_products_by_category(self):
        response = self.client.get('/api/products/?category=ethnic-wear')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json()['count'], 1)
        self.assertEqual(response.json()['results'][0]['title'], 'Banarasi Silk Saree')

    def test_filter_products_by_price_range(self):
        response = self.client.get('/api/products/?min_price=1000&max_price=6000')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json()['count'], 1)
        self.assertEqual(response.json()['results'][0]['sku'], 'SKU-001')

    def test_filter_products_in_stock_only(self):
        response = self.client.get('/api/products/?in_stock=true')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json()['count'], 1)
        self.assertEqual(response.json()['results'][0]['title'], 'Banarasi Silk Saree')

    def test_search_products_by_keyword(self):
        response = self.client.get('/api/products/?search=Pepper')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json()['count'], 1)
        self.assertEqual(response.json()['results'][0]['sku'], 'SKU-002')

    def test_get_product_detail_by_slug(self):
        response = self.client.get(f'/api/products/{self.p1.slug}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json()['sku'], 'SKU-001')
        self.assertIn('images', response.json())
        self.assertIn('reviews', response.json())


class ReviewAPITests(TestCase):
    """Tests for Customer Reviews and ratings."""

    def setUp(self):
        self.client = APIClient()
        self.category = Category.objects.create(name='Dry Fruits')
        self.product = Product.objects.create(
            title='Kashmiri Almonds',
            sku='ALM-001',
            category=self.category,
            price=Decimal('1000.00'),
            stock_quantity=20
        )
        self.customer = User.objects.create_user(
            email='reviewer@test.com',
            password='Password123!',
            first_name='Ananya'
        )

    def test_customer_post_review_success(self):
        self.client.force_authenticate(user=self.customer)
        response = self.client.post(
            f'/api/products/{self.product.slug}/review/',
            {
                'rating': 5,
                'title': 'Exceptional Quality!',
                'comment': 'Crunchy and rich in natural oils. Will definitely reorder.'
            },
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Review.objects.filter(product=self.product).count(), 1)
        self.assertEqual(self.product.average_rating, 5.0)

    def test_unauthenticated_cannot_post_review(self):
        response = self.client.post(
            f'/api/products/{self.product.slug}/review/',
            {'rating': 4, 'title': 'Good', 'comment': 'Nice product.'},
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class AdminProductCRUDTests(TestCase):
    """Tests for Admin Product Management endpoints."""

    def setUp(self):
        self.client = APIClient()
        self.category = Category.objects.create(name='Handicrafts')
        self.admin = User.objects.create_superuser(
            email='adminuser@test.com',
            password='AdminPassword123!',
            first_name='Admin'
        )
        self.customer = User.objects.create_user(
            email='shopper@test.com',
            password='Password123!',
            first_name='Shopper'
        )

    def test_customer_forbidden_from_admin_product_endpoint(self):
        self.client.force_authenticate(user=self.customer)
        response = self.client.get('/api/products/admin/items/')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_admin_can_create_product(self):
        self.client.force_authenticate(user=self.admin)
        payload = {
            'title': 'Royal Brass Ganesha',
            'sku': 'HND-GAN-001',
            'category': self.category.id,
            'description': 'Hand-cast brass idol with intricate engraving.',
            'price': '1250.00',
            'stock_quantity': 15,
            'unit': 'piece',
            'origin_region': 'Moradabad'
        }
        response = self.client.post('/api/products/admin/items/', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Product.objects.filter(sku='HND-GAN-001').count(), 1)
