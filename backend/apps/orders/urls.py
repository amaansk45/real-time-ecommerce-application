from django.urls import path
from .views import OrderStatusView

urlpatterns = [
    path('status/', OrderStatusView.as_view(), name='order-status'),
]
