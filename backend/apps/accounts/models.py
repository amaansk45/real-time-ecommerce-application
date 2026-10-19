from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from django.utils.translation import gettext_lazy as _
from .managers import CustomUserManager


class User(AbstractBaseUser, PermissionsMixin):
    """
    Custom User model for Indian Bazar e-commerce application.
    Supports two dedicated roles: CUSTOMER and ADMIN.
    """

    class RoleChoices(models.TextChoices):
        CUSTOMER = 'CUSTOMER', _('Customer')
        ADMIN = 'ADMIN', _('Admin')

    email = models.EmailField(
        _('email address'),
        unique=True,
        db_index=True,
        max_length=255
    )
    first_name = models.CharField(_('first name'), max_length=100)
    last_name = models.CharField(_('last name'), max_length=100, blank=True, default='')
    phone_number = models.CharField(_('phone number'), max_length=15, blank=True, default='')
    role = models.CharField(
        _('role'),
        max_length=20,
        choices=RoleChoices.choices,
        default=RoleChoices.CUSTOMER,
        db_index=True
    )
    avatar = models.ImageField(
        _('profile picture'),
        upload_to='avatars/%Y/%m/',
        blank=True,
        null=True
    )
    is_verified = models.BooleanField(
        _('email verified'),
        default=False,
        help_text=_('Designates whether this customer has verified their email.')
    )
    is_active = models.BooleanField(
        _('active'),
        default=True,
        help_text=_('Designates whether this user account should be treated as active.')
    )
    is_staff = models.BooleanField(
        _('staff status'),
        default=False,
        help_text=_('Designates whether the user can log into this admin site.')
    )
    date_joined = models.DateTimeField(_('date joined'), auto_now_add=True)
    updated_at = models.DateTimeField(_('last updated'), auto_now=True)

    objects = CustomUserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name']

    class Meta:
        verbose_name = _('User')
        verbose_name_plural = _('Users')
        ordering = ['-date_joined']

    def __str__(self):
        return f"{self.email} ({self.role})"

    @property
    def full_name(self):
        name = f"{self.first_name} {self.last_name}".strip()
        return name if name else self.email

    @property
    def is_admin(self):
        return self.role == self.RoleChoices.ADMIN or self.is_superuser

    @property
    def is_customer(self):
        return self.role == self.RoleChoices.CUSTOMER


class Address(models.Model):
    """
    Shipping and billing address management for Indian Bazar customers.
    """

    class AddressType(models.TextChoices):
        HOME = 'HOME', _('Home')
        WORK = 'WORK', _('Work')
        OTHER = 'OTHER', _('Other')

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='addresses',
        verbose_name=_('Customer')
    )
    full_name = models.CharField(_('full name'), max_length=150)
    phone_number = models.CharField(_('phone number'), max_length=15)
    street_address = models.CharField(_('street address'), max_length=255)
    apartment_suite = models.CharField(_('apartment, suite, unit (optional)'), max_length=255, blank=True, default='')
    city = models.CharField(_('city'), max_length=100)
    state = models.CharField(_('state'), max_length=100)
    postal_code = models.CharField(_('PIN / Postal code'), max_length=10)
    country = models.CharField(_('country'), max_length=50, default='India')
    address_type = models.CharField(
        _('address type'),
        max_length=20,
        choices=AddressType.choices,
        default=AddressType.HOME
    )
    is_default = models.BooleanField(_('default address'), default=False)
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    updated_at = models.DateTimeField(_('updated at'), auto_now=True)

    class Meta:
        verbose_name = _('Address')
        verbose_name_plural = _('Addresses')
        ordering = ['-is_default', '-created_at']

    def __str__(self):
        return f"{self.full_name} - {self.city}, {self.state} ({self.postal_code})"

    def save(self, *args, **kwargs):
        """
        Ensure that if is_default is set to True, all other addresses of this user
        have is_default toggled to False. Also, if this is the user's first address,
        automatically set is_default to True.
        """
        if self.is_default:
            Address.objects.filter(user=self.user, is_default=True).exclude(pk=self.pk).update(is_default=False)
        else:
            # If user has no addresses yet, make this first one default
            if not Address.objects.filter(user=self.user).exclude(pk=self.pk).exists():
                self.is_default = True
        super().save(*args, **kwargs)
