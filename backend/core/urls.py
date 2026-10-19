"""
URL configuration for Indian Bazar e-commerce application.
"""

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    # Admin Portal
    path('admin/', admin.site.urls),

    # Common / System API (Health check & Meta)
    path('api/', include('apps.common.urls')),

    # Accounts & Authentication API
    path('api/auth/', include('apps.accounts.urls')),

    # Products & Catalog API
    path('api/products/', include('apps.products.urls')),

    # Orders & Cart API
    path('api/orders/', include('apps.orders.urls')),

    # Payments & Razorpay API
    path('api/payments/', include('apps.payments.urls')),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
