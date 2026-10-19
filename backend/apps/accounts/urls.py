from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import (
    TokenRefreshView,
    TokenVerifyView,
)
from .views import (
    CustomTokenObtainPairView,
    UserRegistrationView,
    UserProfileView,
    ChangePasswordView,
    AddressViewSet,
    AdminCustomerListView,
    AuthStatusView,
)

router = DefaultRouter()
router.register(r'addresses', AddressViewSet, basename='address')

urlpatterns = [
    # Status / Health
    path('status/', AuthStatusView.as_view(), name='auth-status'),

    # Authentication
    path('register/', UserRegistrationView.as_view(), name='auth-register'),
    path('login/', CustomTokenObtainPairView.as_view(), name='auth-login'),
    path('token/refresh/', TokenRefreshView.as_view(), name='auth-token-refresh'),
    path('token/verify/', TokenVerifyView.as_view(), name='auth-token-verify'),

    # User Profile & Security
    path('profile/', UserProfileView.as_view(), name='auth-profile'),
    path('change-password/', ChangePasswordView.as_view(), name='auth-change-password'),

    # Customer Management (Admin Only)
    path('admin/customers/', AdminCustomerListView.as_view(), name='admin-customers-list'),

    # Address Management (CRUD)
    path('', include(router.urls)),
]
