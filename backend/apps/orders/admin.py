from django.contrib import admin
from .models import Coupon, Cart, CartItem, Wishlist, Order, OrderItem


@admin.register(Coupon)
class CouponAdmin(admin.ModelAdmin):
    list_display = (
        'code',
        'discount_type',
        'discount_value',
        'min_order_amount',
        'valid_from',
        'valid_to',
        'is_active',
        'used_count',
        'usage_limit',
    )
    list_filter = ('discount_type', 'is_active', 'valid_to')
    search_fields = ('code',)
    ordering = ('-created_at',)


class CartItemInline(admin.TabularInline):
    model = CartItem
    extra = 0
    raw_id_fields = ('product',)


@admin.register(Cart)
class CartAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'items_count', 'subtotal', 'shipping_fee', 'grand_total', 'updated_at')
    search_fields = ('user__email',)
    inlines = [CartItemInline]


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    raw_id_fields = ('product',)
    readonly_fields = ('product_title', 'product_sku', 'unit_price', 'quantity', 'total_price')


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = (
        'order_number',
        'customer',
        'status',
        'payment_method',
        'payment_status',
        'total_amount',
        'courier_name',
        'tracking_number',
        'created_at',
    )
    list_filter = ('status', 'payment_method', 'payment_status', 'created_at')
    search_fields = ('order_number', 'customer__email', 'shipping_phone', 'tracking_number')
    list_editable = ('status', 'payment_status')
    inlines = [OrderItemInline]
    ordering = ('-created_at',)
    fieldsets = (
        ('Order Information', {
            'fields': ('order_number', 'customer', 'status', 'created_at')
        }),
        ('Payment Details', {
            'fields': ('payment_method', 'payment_status', 'items_subtotal', 'discount_amount', 'coupon_code', 'shipping_fee', 'total_amount')
        }),
        ('Shipping Destination Snapshot', {
            'fields': (
                'shipping_full_name',
                'shipping_phone',
                'shipping_street_address',
                'shipping_apartment_suite',
                'shipping_city',
                'shipping_state',
                'shipping_postal_code',
                'shipping_country',
            )
        }),
        ('Logistics & Tracking', {
            'fields': ('courier_name', 'tracking_number', 'customer_notes')
        }),
    )
    readonly_fields = ('order_number', 'created_at', 'items_subtotal', 'discount_amount', 'shipping_fee', 'total_amount')
