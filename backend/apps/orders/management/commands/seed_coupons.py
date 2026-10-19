from decimal import Decimal
from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from apps.orders.models import Coupon


class Command(BaseCommand):
    """
    Seeds initial festive promotional coupons for Indian Bazar.
    Usage:
        python manage.py seed_coupons
    """
    help = 'Seeds discount coupons in Indian Bazar'

    def handle(self, *args, **options):
        now = timezone.now()
        expiry = now + timedelta(days=90)

        coupons_data = [
            {
                'code': 'FESTIVE20',
                'discount_type': Coupon.DiscountType.PERCENTAGE,
                'discount_value': Decimal('20.00'),
                'min_order_amount': Decimal('1000.00'),
                'max_discount_amount': Decimal('500.00'),
                'valid_from': now,
                'valid_to': expiry,
                'usage_limit': 500,
            },
            {
                'code': 'WELCOME100',
                'discount_type': Coupon.DiscountType.FIXED,
                'discount_value': Decimal('100.00'),
                'min_order_amount': Decimal('499.00'),
                'max_discount_amount': None,
                'valid_from': now,
                'valid_to': expiry,
                'usage_limit': 1000,
            },
            {
                'code': 'BAZAR50',
                'discount_type': Coupon.DiscountType.FIXED,
                'discount_value': Decimal('50.00'),
                'min_order_amount': Decimal('299.00'),
                'max_discount_amount': None,
                'valid_from': now,
                'valid_to': expiry,
                'usage_limit': 2000,
            },
        ]

        count = 0
        for data in coupons_data:
            coupon, created = Coupon.objects.get_or_create(
                code=data['code'],
                defaults=data
            )
            if created:
                count += 1

        self.stdout.write(
            self.style.SUCCESS(f"Successfully seeded {count} coupons! Total coupons in database: {Coupon.objects.count()}")
        )
