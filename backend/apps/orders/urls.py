from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CartView,
    WishlistView,
    CheckoutView,
    OrderViewSet,
    AdminOrderViewSet,
    OrderStatusHealthView,
)

router = DefaultRouter()
router.register(r'admin/orders', AdminOrderViewSet, basename='admin-order')
router.register(r'', OrderViewSet, basename='order')

urlpatterns = [
    # Status / Health
    path('status/', OrderStatusHealthView.as_view(), name='order-status'),

    # Cart Endpoints
    path('cart/', CartView.as_view(), name='cart-detail'),
    path('cart/<str:action>/', CartView.as_view(), name='cart-action'),
    path('cart/item/<int:item_id>/', CartView.as_view(), name='cart-item-manage'),

    # Wishlist Endpoints
    path('wishlist/', WishlistView.as_view(), name='wishlist'),

    # Checkout Endpoint
    path('checkout/', CheckoutView.as_view(), name='checkout'),

    # Order History & Tracking
    path('', include(router.urls)),
]
