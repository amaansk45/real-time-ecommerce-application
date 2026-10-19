from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from apps.accounts.models import Address

User = get_user_model()


class CustomUserModelTests(TestCase):
    """Unit tests for Custom User model and CustomUserManager."""

    def test_create_customer_user_successful(self):
        user = User.objects.create_user(
            email='customer@example.com',
            password='Password123!',
            first_name='Rahul',
            last_name='Sharma'
        )
        self.assertEqual(user.email, 'customer@example.com')
        self.assertEqual(user.first_name, 'Rahul')
        self.assertEqual(user.role, User.RoleChoices.CUSTOMER)
        self.assertTrue(user.is_active)
        self.assertFalse(user.is_staff)
        self.assertFalse(user.is_superuser)
        self.assertTrue(user.is_customer)
        self.assertFalse(user.is_admin)

    def test_create_user_without_email_raises_error(self):
        with self.assertRaises(ValueError):
            User.objects.create_user(email='', password='Password123!')

    def test_create_superuser_successful(self):
        admin_user = User.objects.create_superuser(
            email='super@indianbazar.com',
            password='AdminPassword123!',
            first_name='Admin'
        )
        self.assertEqual(admin_user.role, User.RoleChoices.ADMIN)
        self.assertTrue(admin_user.is_staff)
        self.assertTrue(admin_user.is_superuser)
        self.assertTrue(admin_user.is_verified)
        self.assertTrue(admin_user.is_admin)

    def test_user_full_name_property(self):
        user = User.objects.create_user(
            email='priya@example.com',
            password='Password123!',
            first_name='Priya',
            last_name='Verma'
        )
        self.assertEqual(user.full_name, 'Priya Verma')
        self.assertEqual(str(user), 'priya@example.com (CUSTOMER)')


class AddressModelTests(TestCase):
    """Unit tests for Address model and default address switching."""

    def setUp(self):
        self.user = User.objects.create_user(
            email='user@test.com',
            password='Password123!',
            first_name='Aman'
        )

    def test_first_address_automatically_becomes_default(self):
        addr1 = Address.objects.create(
            user=self.user,
            full_name='Aman Shaikh',
            phone_number='9876543210',
            street_address='123 Market Road',
            city='Mumbai',
            state='Maharashtra',
            postal_code='400001'
        )
        self.assertTrue(addr1.is_default)

    def test_adding_second_default_switches_first_address(self):
        addr1 = Address.objects.create(
            user=self.user,
            full_name='Aman Shaikh',
            phone_number='9876543210',
            street_address='123 Market Road',
            city='Mumbai',
            state='Maharashtra',
            postal_code='400001',
            is_default=True
        )
        addr2 = Address.objects.create(
            user=self.user,
            full_name='Aman Shaikh Office',
            phone_number='9876543210',
            street_address='456 Business Park',
            city='Mumbai',
            state='Maharashtra',
            postal_code='400051',
            is_default=True
        )
        addr1.refresh_from_db()
        self.assertFalse(addr1.is_default)
        self.assertTrue(addr2.is_default)


class AuthenticationAPITests(TestCase):
    """Integration tests for registration, login, and JWT token issuance."""

    def setUp(self):
        self.client = APIClient()
        self.register_url = '/api/auth/register/'
        self.login_url = '/api/auth/login/'
        self.refresh_url = '/api/auth/token/refresh/'

    def test_registration_success(self):
        payload = {
            'email': 'newcustomer@test.com',
            'first_name': 'Ankit',
            'last_name': 'Kumar',
            'phone_number': '9812345678',
            'password': 'SecurePassword@123',
            'password_confirm': 'SecurePassword@123',
        }
        response = self.client.post(self.register_url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('tokens', response.json())
        self.assertIn('access', response.json()['tokens'])
        self.assertIn('refresh', response.json()['tokens'])
        self.assertEqual(response.json()['user']['email'], 'newcustomer@test.com')
        self.assertEqual(response.json()['user']['role'], 'CUSTOMER')

    def test_registration_duplicate_email_fails(self):
        User.objects.create_user(
            email='existing@test.com',
            password='Password123!',
            first_name='Existing'
        )
        payload = {
            'email': 'existing@test.com',
            'first_name': 'Another',
            'password': 'SecurePassword@123',
            'password_confirm': 'SecurePassword@123',
        }
        response = self.client.post(self.register_url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('email', response.json())

    def test_registration_password_mismatch_fails(self):
        payload = {
            'email': 'mismatch@test.com',
            'first_name': 'Test',
            'password': 'PasswordOne123!',
            'password_confirm': 'PasswordTwo123!',
        }
        response = self.client.post(self.register_url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('password_confirm', response.json())

    def test_login_successful_and_claims_present(self):
        User.objects.create_user(
            email='loginuser@test.com',
            password='MyPassword123!',
            first_name='Kavita',
            last_name='Nair'
        )
        response = self.client.post(
            self.login_url,
            {'email': 'loginuser@test.com', 'password': 'MyPassword123!'},
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.json())
        self.assertIn('refresh', response.json())
        self.assertEqual(response.json()['user']['email'], 'loginuser@test.com')
        self.assertEqual(response.json()['user']['first_name'], 'Kavita')

    def test_login_invalid_credentials_fails(self):
        response = self.client.post(
            self.login_url,
            {'email': 'nonexistent@test.com', 'password': 'WrongPassword123'},
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class UserProfileAndAddressAPITests(TestCase):
    """Tests for Profile retrieval, update, password change, and address CRUD."""

    def setUp(self):
        self.client = APIClient()
        self.customer = User.objects.create_user(
            email='customer1@test.com',
            password='OldPassword123!',
            first_name='Vikram',
            last_name='Rathod'
        )
        # Authenticate client
        self.client.force_authenticate(user=self.customer)

    def test_get_customer_profile(self):
        response = self.client.get('/api/auth/profile/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json()['email'], 'customer1@test.com')
        self.assertEqual(response.json()['full_name'], 'Vikram Rathod')

    def test_update_customer_profile(self):
        response = self.client.patch('/api/auth/profile/', {'first_name': 'Vikramaditya'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.customer.refresh_from_db()
        self.assertEqual(self.customer.first_name, 'Vikramaditya')

    def test_change_password_success(self):
        response = self.client.post(
            '/api/auth/change-password/',
            {
                'old_password': 'OldPassword123!',
                'new_password': 'NewPassword123!',
                'new_password_confirm': 'NewPassword123!'
            },
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.customer.refresh_from_db()
        self.assertTrue(self.customer.check_password('NewPassword123!'))

    def test_address_crud_workflow(self):
        # 1. Create Address
        create_res = self.client.post(
            '/api/auth/addresses/',
            {
                'full_name': 'Vikram Rathod',
                'phone_number': '9988776655',
                'street_address': 'Flat 302, Green Heights',
                'city': 'Bengaluru',
                'state': 'Karnataka',
                'postal_code': '560001',
                'address_type': 'HOME'
            },
            format='json'
        )
        self.assertEqual(create_res.status_code, status.HTTP_201_CREATED)
        address_id = create_res.json()['id']
        self.assertTrue(create_res.json()['is_default'])

        # 2. List Addresses (paginated by StandardResultsSetPagination)
        list_res = self.client.get('/api/auth/addresses/')
        self.assertEqual(list_res.status_code, status.HTTP_200_OK)
        self.assertEqual(list_res.json()['count'], 1)
        self.assertEqual(len(list_res.json()['results']), 1)
        self.assertEqual(list_res.json()['results'][0]['city'], 'Bengaluru')


        # 3. Delete Address
        del_res = self.client.delete(f'/api/auth/addresses/{address_id}/')
        self.assertEqual(del_res.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Address.objects.filter(id=address_id).count(), 0)


class RoleBasedPermissionTests(TestCase):
    """Tests verifying customer vs admin permission barriers."""

    def setUp(self):
        self.client = APIClient()
        self.customer = User.objects.create_user(
            email='customer@bazar.com',
            password='Password123!',
            first_name='Standard',
            role=User.RoleChoices.CUSTOMER
        )
        self.admin = User.objects.create_superuser(
            email='admin@bazar.com',
            password='AdminPassword123!',
            first_name='Super',
            role=User.RoleChoices.ADMIN
        )

    def test_unauthenticated_cannot_access_admin_customer_list(self):
        response = self.client.get('/api/auth/admin/customers/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_customer_cannot_access_admin_customer_list(self):
        self.client.force_authenticate(user=self.customer)
        response = self.client.get('/api/auth/admin/customers/')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_admin_can_access_admin_customer_list(self):
        self.client.force_authenticate(user=self.admin)
        response = self.client.get('/api/auth/admin/customers/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json()['count'], 1)
        self.assertEqual(response.json()['results'][0]['email'], 'customer@bazar.com')
