import django_filters
from .models import Product


class ProductFilter(django_filters.FilterSet):
    """
    Multi-facet filter for Indian Bazar products.
    Supports filtering by category slug, price range, stock availability, and Indian origin.
    """
    category = django_filters.CharFilter(field_name='category__slug', lookup_expr='iexact')
    subcategory = django_filters.CharFilter(field_name='subcategory__slug', lookup_expr='iexact')
    min_price = django_filters.NumberFilter(field_name='price', lookup_expr='gte')
    max_price = django_filters.NumberFilter(field_name='price', lookup_expr='lte')
    in_stock = django_filters.BooleanFilter(method='filter_in_stock')
    featured = django_filters.BooleanFilter(field_name='is_featured')
    origin = django_filters.CharFilter(field_name='origin_region', lookup_expr='icontains')

    class Meta:
        model = Product
        fields = ['category', 'subcategory', 'min_price', 'max_price', 'in_stock', 'featured', 'origin']

    def filter_in_stock(self, queryset, name, value):
        if value is True:
            return queryset.filter(stock_quantity__gt=0)
        elif value is False:
            return queryset.filter(stock_quantity=0)
        return queryset
