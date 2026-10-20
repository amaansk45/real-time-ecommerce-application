from rest_framework import serializers
from .models import Category, Subcategory, Product, ProductImage, Review


class SubcategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Subcategory
        fields = ('id', 'name', 'slug', 'description')


class CategorySerializer(serializers.ModelSerializer):
    subcategories = SubcategorySerializer(many=True, read_only=True)
    image = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ('id', 'name', 'slug', 'description', 'image', 'is_featured', 'order', 'subcategories')

    def get_image(self, obj):
        return obj.display_image


class ProductImageSerializer(serializers.ModelSerializer):
    url = serializers.SerializerMethodField()

    class Meta:
        model = ProductImage
        fields = ('id', 'url', 'alt_text', 'is_primary', 'order')

    def get_url(self, obj):
        return obj.display_image


class ReviewSerializer(serializers.ModelSerializer):
    customer_name = serializers.CharField(source='customer.full_name', read_only=True)
    customer_email = serializers.CharField(source='customer.email', read_only=True)

    class Meta:
        model = Review
        fields = (
            'id',
            'product',
            'customer_name',
            'customer_email',
            'rating',
            'title',
            'comment',
            'created_at',
        )
        read_only_fields = ('id', 'product', 'created_at')


class ProductListSerializer(serializers.ModelSerializer):
    """
    Optimized serializer for storefront catalog grids and search results.
    """
    category_name = serializers.CharField(source='category.name', read_only=True)
    category_slug = serializers.CharField(source='category.slug', read_only=True)
    effective_price = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    discount_percentage = serializers.IntegerField(read_only=True)
    is_in_stock = serializers.BooleanField(read_only=True)
    primary_image = serializers.CharField(source='primary_image_url', read_only=True)
    average_rating = serializers.FloatField(read_only=True)
    reviews_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Product
        fields = (
            'id',
            'title',
            'slug',
            'sku',
            'category_name',
            'category_slug',
            'short_description',
            'price',
            'discount_price',
            'effective_price',
            'discount_percentage',
            'stock_quantity',
            'is_in_stock',
            'unit',
            'origin_region',
            'primary_image',
            'average_rating',
            'reviews_count',
            'is_featured',
            'created_at',
        )


class ProductDetailSerializer(serializers.ModelSerializer):
    """
    Comprehensive serializer for the individual Product Details Page.
    Includes full image gallery, reviews, and related category information.
    """
    category = CategorySerializer(read_only=True)
    subcategory = SubcategorySerializer(read_only=True)
    images = ProductImageSerializer(many=True, read_only=True)
    reviews = ReviewSerializer(many=True, read_only=True)
    effective_price = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    discount_percentage = serializers.IntegerField(read_only=True)
    is_in_stock = serializers.BooleanField(read_only=True)
    average_rating = serializers.FloatField(read_only=True)
    reviews_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Product
        fields = (
            'id',
            'title',
            'slug',
            'sku',
            'category',
            'subcategory',
            'short_description',
            'description',
            'price',
            'discount_price',
            'effective_price',
            'discount_percentage',
            'stock_quantity',
            'is_in_stock',
            'unit',
            'origin_region',
            'images',
            'reviews',
            'average_rating',
            'reviews_count',
            'is_featured',
            'created_at',
            'updated_at',
        )


class AdminCategorySerializer(serializers.ModelSerializer):
    subcategories = SubcategorySerializer(many=True, read_only=True)
    products_count = serializers.IntegerField(source='products.count', read_only=True)

    class Meta:
        model = Category
        fields = (
            'id',
            'name',
            'slug',
            'description',
            'image',
            'image_url',
            'is_featured',
            'order',
            'subcategories',
            'products_count',
            'created_at',
            'updated_at',
        )
        read_only_fields = ('id', 'slug', 'created_at', 'updated_at')


class AdminSubcategorySerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    products_count = serializers.IntegerField(source='products.count', read_only=True)

    class Meta:
        model = Subcategory
        fields = (
            'id',
            'category',
            'category_name',
            'name',
            'slug',
            'description',
            'products_count',
            'created_at',
        )
        read_only_fields = ('id', 'slug', 'created_at')


class ProductCreateUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer used by store administrators to create and update products.
    Supports inline initial image_url binding.
    """
    image_url = serializers.CharField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model = Product
        fields = (
            'id',
            'title',
            'slug',
            'sku',
            'category',
            'subcategory',
            'short_description',
            'description',
            'origin_region',
            'price',
            'discount_price',
            'stock_quantity',
            'unit',
            'is_active',
            'is_featured',
            'image_url',
        )
        read_only_fields = ('id', 'slug')

    def create(self, validated_data):
        image_url = validated_data.pop('image_url', '').strip()
        product = super().create(validated_data)
        if image_url:
            ProductImage.objects.create(product=product, image_url=image_url, is_primary=True)
        return product

    def update(self, instance, validated_data):
        image_url = validated_data.pop('image_url', None)
        product = super().update(instance, validated_data)
        if image_url is not None and image_url.strip():
            primary_img = product.images.filter(is_primary=True).first()
            if primary_img:
                primary_img.image_url = image_url.strip()
                primary_img.save()
            else:
                ProductImage.objects.create(product=product, image_url=image_url.strip(), is_primary=True)
        return product

