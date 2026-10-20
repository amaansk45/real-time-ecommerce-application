from rest_framework import serializers
from apps.products.serializers import ProductListSerializer
from apps.accounts.models import Address
from .models import Coupon, Cart, CartItem, Wishlist, Order, OrderItem


from django.utils import timezone

class CouponSerializer(serializers.ModelSerializer):
    valid_to = serializers.DateTimeField(required=False)

    class Meta:
        model = Coupon
        fields = (
            'id',
            'code',
            'discount_type',
            'discount_value',
            'min_order_amount',
            'max_discount_amount',
            'valid_from',
            'valid_to',
            'is_active',
            'usage_limit',
            'used_count',
            'created_at',
        )
        read_only_fields = ('id', 'used_count', 'created_at')

    def create(self, validated_data):
        if 'valid_to' not in validated_data or not validated_data['valid_to']:
            validated_data['valid_to'] = timezone.now() + timezone.timedelta(days=365)
        return super().create(validated_data)


class CartItemSerializer(serializers.ModelSerializer):
    product = ProductListSerializer(read_only=True)
    product_id = serializers.IntegerField(write_only=True)
    unit_price = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    subtotal = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = CartItem
        fields = ('id', 'product', 'product_id', 'quantity', 'unit_price', 'subtotal', 'created_at')


class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    items_count = serializers.IntegerField(read_only=True)
    subtotal = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    shipping_fee = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    discount_amount = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    grand_total = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    applied_coupon = CouponSerializer(read_only=True)

    class Meta:
        model = Cart
        fields = (
            'id',
            'items',
            'items_count',
            'subtotal',
            'shipping_fee',
            'discount_amount',
            'grand_total',
            'applied_coupon',
            'updated_at',
        )


class WishlistSerializer(serializers.ModelSerializer):
    products = ProductListSerializer(many=True, read_only=True)

    class Meta:
        model = Wishlist
        fields = ('id', 'products', 'created_at')


class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = (
            'id',
            'product',
            'product_title',
            'product_sku',
            'product_image_url',
            'unit_price',
            'quantity',
            'total_price',
        )


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    can_cancel = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = (
            'id',
            'order_number',
            'status',
            'payment_method',
            'payment_status',
            'shipping_full_name',
            'shipping_phone',
            'shipping_street_address',
            'shipping_apartment_suite',
            'shipping_city',
            'shipping_state',
            'shipping_postal_code',
            'shipping_country',
            'items_subtotal',
            'discount_amount',
            'coupon_code',
            'shipping_fee',
            'total_amount',
            'courier_name',
            'tracking_number',
            'customer_notes',
            'items',
            'can_cancel',
            'created_at',
            'updated_at',
        )

    def get_can_cancel(self, obj):
        return obj.can_cancel()


class CheckoutCreateOrderSerializer(serializers.Serializer):
    """
    Validates delivery address selection, payment method, and checkout inputs.
    """
    address_id = serializers.IntegerField(required=True)
    payment_method = serializers.ChoiceField(choices=Order.PaymentMethod.choices, default=Order.PaymentMethod.COD)
    customer_notes = serializers.CharField(required=False, allow_blank=True, default='')

    def validate_address_id(self, value):
        user = self.context['request'].user
        if not Address.objects.filter(id=value, user=user).exists():
            raise serializers.ValidationError('Invalid address selected. Address does not belong to your account.')
        return value
