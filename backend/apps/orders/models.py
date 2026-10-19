import uuid
from decimal import Decimal
from django.db import models
from django.conf import settings
from django.utils import timezone
from django.utils.translation import gettext_lazy as _
from apps.products.models import Product


class Coupon(models.Model):
    """
    Discount coupons with percentage or fixed discount, usage limits, and expiration.
    """
    class DiscountType(models.TextChoices):
        PERCENTAGE = 'PERCENTAGE', _('Percentage Discount (%)')
        FIXED = 'FIXED', _('Fixed Discount (₹)')

    code = models.CharField(_('coupon code'), max_length=30, unique=True, db_index=True)
    discount_type = models.CharField(
        _('discount type'),
        max_length=20,
        choices=DiscountType.choices,
        default=DiscountType.PERCENTAGE
    )
    discount_value = models.DecimalField(_('discount value'), max_digits=10, decimal_places=2)
    min_order_amount = models.DecimalField(_('minimum order amount (₹)'), max_digits=10, decimal_places=2, default=0)
    max_discount_amount = models.DecimalField(
        _('maximum discount cap (₹)'),
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True
    )
    valid_from = models.DateTimeField(_('valid from'), default=timezone.now)
    valid_to = models.DateTimeField(_('valid until'))
    is_active = models.BooleanField(_('is active'), default=True)
    usage_limit = models.PositiveIntegerField(_('maximum total uses'), default=100)
    used_count = models.PositiveIntegerField(_('times used'), default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = _('Coupon')
        verbose_name_plural = _('Coupons')
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.code} ({self.discount_value}{'%' if self.discount_type == self.DiscountType.PERCENTAGE else '₹'})"

    def is_valid(self, order_amount=0):
        """Check if coupon is active, not expired, usage limit not exceeded, and order amount meets minimum."""
        now = timezone.now()
        if not self.is_active:
            return False, 'This coupon is currently inactive.'
        if self.valid_from > now:
            return False, 'This coupon is not yet valid.'
        if self.valid_to < now:
            return False, 'This coupon has expired.'
        if self.used_count >= self.usage_limit:
            return False, 'This coupon has reached its maximum usage limit.'
        if order_amount < self.min_order_amount:
            return False, f'Minimum order amount of ₹{self.min_order_amount} required to use this coupon.'
        return True, 'Valid coupon'

    def calculate_discount(self, order_amount):
        """Calculate discount amount in ₹ according to coupon rules."""
        if self.discount_type == self.DiscountType.PERCENTAGE:
            discount = (Decimal(str(order_amount)) * (self.discount_value / Decimal('100.00')))
            if self.max_discount_amount and discount > self.max_discount_amount:
                discount = self.max_discount_amount
        else:
            discount = min(self.discount_value, Decimal(str(order_amount)))
        return round(discount, 2)


class Cart(models.Model):
    """
    Shopping cart associated with a customer account.
    """
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='cart',
        verbose_name=_('Customer')
    )
    applied_coupon = models.ForeignKey(
        Coupon,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='carts'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _('Shopping Cart')
        verbose_name_plural = _('Shopping Carts')

    def __str__(self):
        return f"Cart for {self.user.email}"

    @property
    def items_count(self):
        return sum(item.quantity for item in self.items.all())

    @property
    def subtotal(self):
        return sum(item.subtotal for item in self.items.all())

    @property
    def shipping_fee(self):
        # Free delivery over ₹999 across India
        if self.subtotal == 0 or self.subtotal >= Decimal('999.00'):
            return Decimal('0.00')
        return Decimal('99.00')

    @property
    def discount_amount(self):
        if self.applied_coupon and self.subtotal > 0:
            is_valid, _ = self.applied_coupon.is_valid(self.subtotal)
            if is_valid:
                return self.applied_coupon.calculate_discount(self.subtotal)
        return Decimal('0.00')

    @property
    def grand_total(self):
        total = self.subtotal - self.discount_amount + self.shipping_fee
        return max(Decimal('0.00'), round(total, 2))


class CartItem(models.Model):
    """
    Line item inside a Shopping Cart.
    """
    cart = models.ForeignKey(
        Cart,
        on_delete=models.CASCADE,
        related_name='items',
        verbose_name=_('Cart')
    )
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name='cart_items',
        verbose_name=_('Product')
    )
    quantity = models.PositiveIntegerField(_('quantity'), default=1)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _('Cart Item')
        verbose_name_plural = _('Cart Items')
        unique_together = ('cart', 'product')
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.quantity}x {self.product.title}"

    @property
    def unit_price(self):
        return self.product.effective_price

    @property
    def subtotal(self):
        return self.unit_price * self.quantity


class Wishlist(models.Model):
    """
    Customer wishlist storing saved products.
    """
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='wishlist',
        verbose_name=_('Customer')
    )
    products = models.ManyToManyField(
        Product,
        related_name='wishlisted_by',
        blank=True,
        verbose_name=_('Wishlisted Products')
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = _('Wishlist')
        verbose_name_plural = _('Wishlists')

    def __str__(self):
        return f"Wishlist of {self.user.email}"


class Order(models.Model):
    """
    Customer Order entity storing complete transaction, shipping, and fulfillment data.
    """
    class OrderStatus(models.TextChoices):
        PENDING = 'PENDING', _('Pending')
        CONFIRMED = 'CONFIRMED', _('Confirmed')
        PROCESSING = 'PROCESSING', _('Processing')
        SHIPPED = 'SHIPPED', _('Shipped')
        DELIVERED = 'DELIVERED', _('Delivered')
        CANCELLED = 'CANCELLED', _('Cancelled')
        RETURN_REQUESTED = 'RETURN_REQUESTED', _('Return Requested')
        REFUNDED = 'REFUNDED', _('Refunded')

    class PaymentMethod(models.TextChoices):
        RAZORPAY = 'RAZORPAY', _('Razorpay Online (UPI/Cards/NetBanking)')
        COD = 'COD', _('Cash on Delivery (COD)')

    class PaymentStatus(models.TextChoices):
        PENDING = 'PENDING', _('Pending')
        PAID = 'PAID', _('Paid')
        FAILED = 'FAILED', _('Failed')
        REFUNDED = 'REFUNDED', _('Refunded')

    order_number = models.CharField(_('order number'), max_length=40, unique=True, db_index=True)
    customer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='orders',
        verbose_name=_('Customer')
    )
    status = models.CharField(
        _('order status'),
        max_length=25,
        choices=OrderStatus.choices,
        default=OrderStatus.PENDING,
        db_index=True
    )
    payment_method = models.CharField(
        _('payment method'),
        max_length=20,
        choices=PaymentMethod.choices,
        default=PaymentMethod.COD
    )
    payment_status = models.CharField(
        _('payment status'),
        max_length=20,
        choices=PaymentStatus.choices,
        default=PaymentStatus.PENDING,
        db_index=True
    )

    # Shipping Address Snapshot (Immutable once ordered)
    shipping_full_name = models.CharField(_('shipping receiver name'), max_length=150)
    shipping_phone = models.CharField(_('shipping phone'), max_length=15)
    shipping_street_address = models.CharField(_('street address'), max_length=255)
    shipping_apartment_suite = models.CharField(_('apartment, suite (optional)'), max_length=255, blank=True, default='')
    shipping_city = models.CharField(_('city'), max_length=100)
    shipping_state = models.CharField(_('state'), max_length=100)
    shipping_postal_code = models.CharField(_('PIN code'), max_length=10)
    shipping_country = models.CharField(_('country'), max_length=50, default='India')

    # Financial Breakdown
    items_subtotal = models.DecimalField(_('items subtotal (₹)'), max_digits=10, decimal_places=2)
    discount_amount = models.DecimalField(_('coupon discount (₹)'), max_digits=10, decimal_places=2, default=0)
    coupon_code = models.CharField(_('applied coupon code'), max_length=30, blank=True, default='')
    shipping_fee = models.DecimalField(_('shipping fee (₹)'), max_digits=10, decimal_places=2, default=0)
    total_amount = models.DecimalField(_('grand total (₹)'), max_digits=10, decimal_places=2)

    # Logistics & Tracking
    courier_name = models.CharField(_('courier / logistics partner'), max_length=100, blank=True, default='')
    tracking_number = models.CharField(_('shipment tracking number'), max_length=100, blank=True, default='')
    customer_notes = models.TextField(_('delivery instructions'), blank=True, default='')

    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _('Order')
        verbose_name_plural = _('Orders')
        ordering = ['-created_at']

    def __str__(self):
        return f"Order #{self.order_number} - {self.customer.email} (₹{self.total_amount})"

    @classmethod
    def generate_order_number(cls):
        date_str = timezone.now().strftime('%Y%m%d')
        unique_suffix = uuid.uuid4().hex[:6].upper()
        return f"IB-{date_str}-{unique_suffix}"

    def can_cancel(self):
        """Customer can only cancel if order is in PENDING or CONFIRMED state."""
        return self.status in [self.OrderStatus.PENDING, self.OrderStatus.CONFIRMED]


class OrderItem(models.Model):
    """
    Immutable line item snapshot preserved at the moment of order placement.
    """
    order = models.ForeignKey(
        Order,
        on_delete=models.CASCADE,
        related_name='items',
        verbose_name=_('Order')
    )
    product = models.ForeignKey(
        Product,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='order_items',
        verbose_name=_('Product')
    )
    product_title = models.CharField(_('product title'), max_length=255)
    product_sku = models.CharField(_('SKU'), max_length=60)
    product_image_url = models.URLField(_('product image url'), blank=True, default='')
    unit_price = models.DecimalField(_('unit price (₹)'), max_digits=10, decimal_places=2)
    quantity = models.PositiveIntegerField(_('quantity'), default=1)
    total_price = models.DecimalField(_('line total (₹)'), max_digits=10, decimal_places=2)

    class Meta:
        verbose_name = _('Order Item')
        verbose_name_plural = _('Order Items')

    def __str__(self):
        return f"{self.quantity}x {self.product_title} (Order #{self.order.order_number})"
