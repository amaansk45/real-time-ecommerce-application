from django.contrib import admin
from .models import Category, Subcategory, Product, ProductImage, Review


class SubcategoryInline(admin.TabularInline):
    model = Subcategory
    extra = 1
    prepopulated_fields = {'slug': ('name',)}


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'is_featured', 'order', 'created_at')
    list_filter = ('is_featured', 'created_at')
    search_fields = ('name', 'description')
    prepopulated_fields = {'slug': ('name',)}
    inlines = [SubcategoryInline]


@admin.register(Subcategory)
class SubcategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'slug', 'created_at')
    list_filter = ('category', 'created_at')
    search_fields = ('name', 'category__name')
    prepopulated_fields = {'slug': ('name',)}


class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 2
    fields = ('image', 'image_url', 'alt_text', 'is_primary', 'order')


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = (
        'title',
        'sku',
        'category',
        'price',
        'discount_price',
        'stock_quantity',
        'is_in_stock',
        'is_active',
        'is_featured',
        'origin_region',
        'created_at',
    )
    list_filter = ('is_active', 'is_featured', 'category', 'origin_region', 'created_at')
    search_fields = ('title', 'sku', 'description', 'origin_region')
    prepopulated_fields = {'slug': ('title',)}
    inlines = [ProductImageInline]
    list_editable = ('price', 'discount_price', 'stock_quantity', 'is_active', 'is_featured')
    ordering = ('-created_at',)


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ('product', 'customer', 'rating', 'title', 'created_at')
    list_filter = ('rating', 'created_at')
    search_fields = ('product__title', 'customer__email', 'title', 'comment')
    raw_id_fields = ('product', 'customer')
