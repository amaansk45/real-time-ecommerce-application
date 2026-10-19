from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.translation import gettext_lazy as _
from .models import User, Address


@admin.register(User)
class CustomUserAdmin(BaseUserAdmin):
    """
    Admin configuration for the custom User model.
    """
    list_display = (
        'email',
        'first_name',
        'last_name',
        'role',
        'is_verified',
        'is_staff',
        'is_active',
        'date_joined',
    )
    list_filter = ('role', 'is_staff', 'is_superuser', 'is_active', 'is_verified', 'date_joined')
    search_fields = ('email', 'first_name', 'last_name', 'phone_number')
    ordering = ('-date_joined',)

    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        (_('Personal info'), {'fields': ('first_name', 'last_name', 'phone_number', 'avatar')}),
        (
            _('Role & Permissions'),
            {
                'fields': (
                    'role',
                    'is_verified',
                    'is_active',
                    'is_staff',
                    'is_superuser',
                    'groups',
                    'user_permissions',
                ),
            },
        ),
        (_('Important dates'), {'fields': ('last_login', 'date_joined')}),
    )

    add_fieldsets = (
        (
            None,
            {
                'classes': ('wide',),
                'fields': (
                    'email',
                    'first_name',
                    'last_name',
                    'role',
                    'password1',
                    'password2',
                    'is_staff',
                    'is_active',
                ),
            },
        ),
    )


@admin.register(Address)
class AddressAdmin(admin.ModelAdmin):
    """
    Admin configuration for Customer Addresses.
    """
    list_display = (
        'id',
        'user',
        'full_name',
        'phone_number',
        'city',
        'state',
        'postal_code',
        'address_type',
        'is_default',
        'created_at',
    )
    list_filter = ('address_type', 'is_default', 'state', 'created_at')
    search_fields = ('full_name', 'user__email', 'street_address', 'city', 'postal_code')
    ordering = ('-is_default', '-created_at')
    raw_id_fields = ('user',)
