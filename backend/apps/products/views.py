from rest_framework import viewsets, status, filters
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.decorators import action
from django_filters.rest_framework import DjangoFilterBackend
from apps.common.permissions import IsAdminUserRole
from .models import Category, Subcategory, Product, ProductImage, Review
from .filters import ProductFilter
from .serializers import (
    CategorySerializer,
    SubcategorySerializer,
    ProductListSerializer,
    ProductDetailSerializer,
    ProductCreateUpdateSerializer,
    ReviewSerializer,
)


class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Public ViewSet for browsing categories and their subcategories.
    """
    permission_classes = (AllowAny,)
    queryset = Category.objects.all().prefetch_related('subcategories')
    serializer_class = CategorySerializer
    lookup_field = 'slug'
    pagination_class = None  # Categories list is compact and returned whole


class ProductViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Customer storefront ViewSet for browsing and searching Indian Bazar products.
    Includes full-text search, multi-facet filtering, sorting, and pagination.
    """
    permission_classes = (AllowAny,)
    lookup_field = 'slug'
    filter_backends = (DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter)
    filterset_class = ProductFilter
    search_fields = ('title', 'short_description', 'description', 'origin_region', 'category__name')
    ordering_fields = ('price', 'created_at', 'title')
    ordering = ('-created_at',)

    def get_queryset(self):
        return (
            Product.objects.filter(is_active=True)
            .select_related('category', 'subcategory')
            .prefetch_related('images', 'reviews', 'reviews__customer')
        )

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return ProductDetailSerializer
        return ProductListSerializer

    @action(detail=True, methods=['get'])
    def related(self, request, slug=None):
        """Retrieve up to 4 related products within the same category."""
        product = self.get_object()
        related_products = (
            Product.objects.filter(category=product.category, is_active=True)
            .exclude(pk=product.pk)
            .prefetch_related('images', 'reviews')[:4]
        )
        serializer = ProductListSerializer(related_products, many=True, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def review(self, request, slug=None):
        """Allow logged-in customers to leave a review and star rating."""
        product = self.get_object()
        customer = request.user

        # Prevent duplicate reviews per user
        if Review.objects.filter(product=product, customer=customer).exists():
            return Response(
                {'detail': 'You have already submitted a review for this product.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        rating = request.data.get('rating')
        title = request.data.get('title', '').strip()
        comment = request.data.get('comment', '').strip()

        if not rating or not title or not comment:
            return Response(
                {'detail': 'Rating (1-5), headline title, and comment are required.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        review = Review.objects.create(
            product=product,
            customer=customer,
            rating=int(rating),
            title=title,
            comment=comment
        )

        serializer = ReviewSerializer(review)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class AdminProductViewSet(viewsets.ModelViewSet):
    """
    Store Administrator ViewSet for full Product CRUD operations and inventory control.
    """
    permission_classes = (IsAuthenticated, IsAdminUserRole)
    queryset = Product.objects.all().select_related('category', 'subcategory').prefetch_related('images')
    filter_backends = (DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter)
    filterset_class = ProductFilter
    search_fields = ('title', 'sku', 'origin_region')
    ordering = ('-created_at',)

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return ProductCreateUpdateSerializer
        if self.action == 'retrieve':
            return ProductDetailSerializer
        return ProductListSerializer


class ProductStatusView(viewsets.ViewSet):
    """
    Health check & status view for products subsystem.
    """
    permission_classes = (AllowAny,)

    def list(self, request):
        return Response(
            {
                "status": "healthy",
                "service": "products",
                "total_categories": Category.objects.count(),
                "total_products": Product.objects.count(),
            },
            status=status.HTTP_200_OK
        )
