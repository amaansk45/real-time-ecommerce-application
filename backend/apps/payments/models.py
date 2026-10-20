from django.db import models
from django.utils.translation import gettext_lazy as _
from apps.orders.models import Order


class PaymentTransaction(models.Model):
    """
    Financial payment record tracking Razorpay gateway transactions and Cash on Delivery verifications.
    """
    class PaymentMethod(models.TextChoices):
        RAZORPAY = 'RAZORPAY', _('Razorpay Online (UPI/Cards/NetBanking)')
        COD = 'COD', _('Cash on Delivery (COD)')

    class TransactionStatus(models.TextChoices):
        CREATED = 'CREATED', _('Created / Order Initiated')
        AUTHORIZED = 'AUTHORIZED', _('Authorized')
        CAPTURED = 'CAPTURED', _('Payment Captured / Completed')
        FAILED = 'FAILED', _('Failed')
        REFUNDED = 'REFUNDED', _('Refunded')

    order = models.OneToOneField(
        Order,
        on_delete=models.CASCADE,
        related_name='payment_transaction',
        verbose_name=_('Associated Order')
    )
    payment_method = models.CharField(
        _('payment method'),
        max_length=20,
        choices=PaymentMethod.choices,
        default=PaymentMethod.COD
    )
    status = models.CharField(
        _('transaction status'),
        max_length=20,
        choices=TransactionStatus.choices,
        default=TransactionStatus.CREATED,
        db_index=True
    )
    amount = models.DecimalField(_('amount (₹)'), max_digits=10, decimal_places=2)
    currency = models.CharField(_('currency code'), max_length=10, default='INR')

    # Razorpay Specific Verification Fields
    razorpay_order_id = models.CharField(_('Razorpay Order ID'), max_length=100, blank=True, default='', db_index=True)
    razorpay_payment_id = models.CharField(_('Razorpay Payment ID'), max_length=100, blank=True, default='', db_index=True)
    razorpay_signature = models.CharField(_('Razorpay Signature Token'), max_length=255, blank=True, default='')

    # Raw response from payment gateway for audit trail
    gateway_response = models.JSONField(_('gateway payload audit'), default=dict, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _('Payment Transaction')
        verbose_name_plural = _('Payment Transactions')
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.payment_method} Payment (₹{self.amount}) for Order #{self.order.order_number} [{self.status}]"
