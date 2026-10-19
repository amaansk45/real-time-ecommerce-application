from django.urls import path
from .views import (
    RazorpayCreateOrderView,
    RazorpayVerifyPaymentView,
    ConfirmCodPaymentView,
    PaymentStatusHealthView,
)

urlpatterns = [
    path('status/', PaymentStatusHealthView.as_view(), name='payment-status'),
    path('razorpay/create-order/', RazorpayCreateOrderView.as_view(), name='razorpay-create-order'),
    path('razorpay/verify/', RazorpayVerifyPaymentView.as_view(), name='razorpay-verify'),
    path('cod/confirm/', ConfirmCodPaymentView.as_view(), name='cod-confirm'),
]
