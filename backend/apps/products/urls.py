from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CategoryViewSet,
    ProductViewSet,
    AdminProductViewSet,
    AdminCategoryViewSet,
    AdminSubcategoryViewSet,
    ProductStatusView,
)

router = DefaultRouter()
router.register(r'status', ProductStatusView, basename='product-status')
router.register(r'categories', CategoryViewSet, basename='category')
router.register(r'admin/categories', AdminCategoryViewSet, basename='admin-category')
router.register(r'admin/subcategories', AdminSubcategoryViewSet, basename='admin-subcategory')
router.register(r'admin/items', AdminProductViewSet, basename='admin-product')
router.register(r'', ProductViewSet, basename='product')

urlpatterns = [
    path('', include(router.urls)),
]
