from django.urls import path
from .views import ProductStatusView

urlpatterns = [
    path('status/', ProductStatusView.as_view(), name='product-status'),
]
