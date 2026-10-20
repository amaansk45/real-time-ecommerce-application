from django.contrib import admin
from .models import PaymentTransaction


@admin.register(PaymentTransaction)
class PaymentTransactionAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'order',
        'payment_method',
        'status',
        'amount',
        'razorpay_order_id',
        'razorpay_payment_id',
        'created_at',
    )
    list_filter = ('payment_method', 'status', 'created_at')
    search_fields = ('order__order_number', 'razorpay_order_id', 'razorpay_payment_id')
    readonly_fields = (
        'order',
        'amount',
        'currency',
        'payment_method',
        'razorpay_order_id',
        'razorpay_payment_id',
        'razorpay_signature',
        'gateway_response',
        'created_at',
        'updated_at',
    )
