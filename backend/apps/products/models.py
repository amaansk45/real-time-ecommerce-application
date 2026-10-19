from django.db import models
from django.utils.text import slugify
from django.utils.translation import gettext_lazy as _
from django.conf import settings
from decimal import Decimal


class Category(models.Model):
    """
    Top-level product category (e.g., Ethnic Wear, Spices & Grocery, Handicrafts, Dry Fruits).
    """
    name = models.CharField(_('name'), max_length=100, unique=True)
    slug = models.SlugField(_('slug'), max_length=120, unique=True, blank=True)
    description = models.TextField(_('description'), blank=True, default='')
    image = models.ImageField(_('category banner'), upload_to='categories/', blank=True, null=True)
    image_url = models.URLField(_('external image url'), blank=True, default='')
    is_featured = models.BooleanField(_('featured category'), default=False)
    order = models.PositiveIntegerField(_('display order'), default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _('Category')
        verbose_name_plural = _('Categories')
        ordering = ['order', 'name']

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    @property
    def display_image(self):
        if self.image:
            return self.image.url
        return self.image_url or None


class Subcategory(models.Model):
    """
    Subcategory belonging to a Category (e.g., Sarees, Kurtas under Ethnic Wear).
    """
    category = models.ForeignKey(
        Category,
        on_delete=models.CASCADE,
        related_name='subcategories',
        verbose_name=_('Parent Category')
    )
    name = models.CharField(_('name'), max_length=100)
    slug = models.SlugField(_('slug'), max_length=120, unique=True, blank=True)
    description = models.TextField(_('description'), blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = _('Subcategory')
        verbose_name_plural = _('Subcategories')
        ordering = ['category', 'name']
        unique_together = ('category', 'name')

    def __str__(self):
        return f"{self.category.name} > {self.name}"

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(f"{self.category.name}-{self.name}")
        super().save(*args, **kwargs)


class Product(models.Model):
    """
    Core Product model for Indian Bazar.
    Supports pricing in INR (₹), discount pricing, stock inventory, and multi-facet filtering.
    """
    title = models.CharField(_('product title'), max_length=255, db_index=True)
    slug = models.SlugField(_('slug'), max_length=280, unique=True, blank=True)
    sku = models.CharField(_('SKU / Code'), max_length=60, unique=True, db_index=True)
    category = models.ForeignKey(
        Category,
        on_delete=models.PROTECT,
        related_name='products',
        verbose_name=_('category')
    )
    subcategory = models.ForeignKey(
        Subcategory,
        on_delete=models.SET_NULL,
        related_name='products',
        blank=True,
        null=True,
        verbose_name=_('subcategory')
    )
    short_description = models.CharField(_('short tagline'), max_length=350, blank=True, default='')
    description = models.TextField(_('full description'))
    origin_region = models.CharField(
        _('Indian origin / state'),
        max_length=100,
        blank=True,
        default='',
        help_text=_('e.g., Varanasi, Kashmir, Rajasthan, Malabar Coast')
    )
    price = models.DecimalField(_('regular price (₹)'), max_digits=10, decimal_places=2)
    discount_price = models.DecimalField(
        _('discounted offer price (₹)'),
        max_digits=10,
        decimal_places=2,
        blank=True,
        null=True
    )
    stock_quantity = models.PositiveIntegerField(_('stock quantity in inventory'), default=10)
    unit = models.CharField(_('unit / package size'), max_length=50, default='piece')
    is_active = models.BooleanField(_('is published/active'), default=True, db_index=True)
    is_featured = models.BooleanField(_('featured on homepage'), default=False, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _('Product')
        verbose_name_plural = _('Products')
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} (₹{self.effective_price})"

    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(self.title)
            slug = base_slug
            counter = 1
            while Product.objects.filter(slug=slug).exclude(pk=self.pk).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1
            self.slug = slug
        super().save(*args, **kwargs)

    @property
    def effective_price(self):
        """Returns discount price if valid and lower than regular price, else returns regular price."""
        if self.discount_price and self.discount_price < self.price:
            return self.discount_price
        return self.price

    @property
    def discount_percentage(self):
        """Calculate discount percentage savings."""
        if self.discount_price and self.discount_price < self.price:
            savings = self.price - self.discount_price
            return int((savings / self.price) * Decimal(100))
        return 0

    @property
    def is_in_stock(self):
        return self.stock_quantity > 0

    @property
    def primary_image_url(self):
        primary = self.images.filter(is_primary=True).first() or self.images.first()
        if primary:
            return primary.display_image
        return None

    @property
    def average_rating(self):
        reviews = self.reviews.all()
        if reviews.exists():
            total = sum(r.rating for r in reviews)
            return round(total / reviews.count(), 1)
        return 5.0

    @property
    def reviews_count(self):
        return self.reviews.count()


class ProductImage(models.Model):
    """
    Multiple high-resolution gallery images for a Product.
    """
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name='images',
        verbose_name=_('Product')
    )
    image = models.ImageField(_('uploaded image'), upload_to='products/%Y/%m/', blank=True, null=True)
    image_url = models.URLField(_('external image url / CDN'), blank=True, default='')
    alt_text = models.CharField(_('alt text for SEO'), max_length=255, blank=True, default='')
    is_primary = models.BooleanField(_('primary thumbnail'), default=False)
    order = models.PositiveIntegerField(_('display order'), default=0)

    class Meta:
        verbose_name = _('Product Image')
        verbose_name_plural = _('Product Images')
        ordering = ['-is_primary', 'order', 'id']

    def __str__(self):
        return f"Image for {self.product.title}"

    @property
    def display_image(self):
        if self.image:
            return self.image.url
        return self.image_url or None

    def save(self, *args, **kwargs):
        if self.is_primary:
            ProductImage.objects.filter(product=self.product, is_primary=True).exclude(pk=self.pk).update(is_primary=False)
        super().save(*args, **kwargs)


class Review(models.Model):
    """
    Customer ratings and written reviews for products.
    """
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name='reviews',
        verbose_name=_('Product')
    )
    customer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='reviews',
        verbose_name=_('Customer')
    )
    rating = models.PositiveSmallIntegerField(
        _('star rating (1-5)'),
        choices=[(i, f"{i} Star") for i in range(1, 6)],
        default=5
    )
    title = models.CharField(_('review headline'), max_length=150)
    comment = models.TextField(_('detailed feedback'))
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _('Review')
        verbose_name_plural = _('Reviews')
        ordering = ['-created_at']
        unique_together = ('product', 'customer')

    def __str__(self):
        return f"{self.rating}★ by {self.customer.first_name} on {self.product.title}"
