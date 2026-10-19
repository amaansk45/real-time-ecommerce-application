import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { productService } from '../../services/productService';
import { ProductCard } from '../../components/customer/ProductCard';
import { Button } from '../../components/common/Button';
import {
  Filter,
  Search,
  X,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  ShoppingBag,
} from 'lucide-react';

export const ShopPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Filter states synced with URL
  const currentCategory = searchParams.get('category') || '';
  const currentSearch = searchParams.get('search') || '';
  const currentOrdering = searchParams.get('ordering') || '-created_at';
  const currentInStock = searchParams.get('in_stock') === 'true';
  const currentMinPrice = searchParams.get('min_price') || '';
  const currentMaxPrice = searchParams.get('max_price') || '';
  const currentPage = parseInt(searchParams.get('page') || '1', 10);

  // Fetch Categories on mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await productService.getCategories();
        setCategories(data);
      } catch (err) {
        console.error('Failed to load categories:', err);
      }
    };
    loadCategories();
  }, []);

  // Fetch Products whenever filters change
  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      try {
        const params = {
          page: currentPage,
          ordering: currentOrdering,
        };

        if (currentCategory) params.category = currentCategory;
        if (currentSearch) params.search = currentSearch;
        if (currentInStock) params.in_stock = true;
        if (currentMinPrice) params.min_price = currentMinPrice;
        if (currentMaxPrice) params.max_price = currentMaxPrice;

        const data = await productService.getProducts(params);
        setProducts(data.results || data);
        setTotalCount(data.count || 0);
        setTotalPages(data.total_pages || 1);
      } catch (err) {
        console.error('Failed to load products:', err);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [
    currentCategory,
    currentSearch,
    currentOrdering,
    currentInStock,
    currentMinPrice,
    currentMaxPrice,
    currentPage,
  ]);

  const updateParam = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    newParams.set('page', '1'); // Reset to page 1 on filter change
    setSearchParams(newParams);
  };

  const handlePriceRange = (min, max) => {
    const newParams = new URLSearchParams(searchParams);
    if (min !== undefined && min !== '') {
      newParams.set('min_price', min);
    } else {
      newParams.delete('min_price');
    }
    if (max !== undefined && max !== '') {
      newParams.set('max_price', max);
    } else {
      newParams.delete('max_price');
    }
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  const clearAllFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 font-heading">
            {currentCategory
              ? categories.find((c) => c.slug === currentCategory)?.name || 'Filtered Collection'
              : 'All Authentic Products'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Showing <strong className="text-slate-800">{totalCount}</strong> authentic items direct from artisans
          </p>
        </div>

        {/* Sort & Mobile Filters toggle */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileFiltersOpen(true)}
            className="lg:hidden flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            <SlidersHorizontal className="w-4 h-4" /> Filters
          </button>

          <div className="flex items-center gap-2 text-sm text-slate-600">
            <span className="hidden sm:inline font-medium">Sort by:</span>
            <select
              value={currentOrdering}
              onChange={(e) => updateParam('ordering', e.target.value)}
              className="bg-white border border-slate-300 text-slate-800 text-sm rounded-xl px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:outline-none"
            >
              <option value="-created_at">Newest Arrivals</option>
              <option value="price">Price: Low to High</option>
              <option value="-price">Price: High to Low</option>
              <option value="title">Alphabetical (A-Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Filter Sidebar (Desktop) */}
        <aside className="hidden lg:block space-y-8 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-card h-fit">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-heading font-bold text-base text-slate-900 flex items-center gap-2">
              <Filter className="w-4 h-4 text-primary-600" /> Filters
            </h3>
            {(currentCategory || currentSearch || currentInStock || currentMinPrice || currentMaxPrice) && (
              <button
                onClick={clearAllFilters}
                className="text-xs font-semibold text-primary-600 hover:underline"
              >
                Reset All
              </button>
            )}
          </div>

          {/* Categories */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Categories</h4>
            <div className="space-y-1">
              <button
                onClick={() => updateParam('category', '')}
                className={`w-full text-left px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                  !currentCategory ? 'bg-primary-50 text-primary-700 font-bold' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                All Categories
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => updateParam('category', cat.slug)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                    currentCategory === cat.slug ? 'bg-primary-50 text-primary-700 font-bold' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Price Range (₹)</h4>
            <div className="space-y-1 text-sm text-slate-600 font-medium">
              {[
                { label: 'All Prices', min: '', max: '' },
                { label: 'Under ₹1,000', min: '0', max: '1000' },
                { label: '₹1,000 - ₹3,000', min: '1000', max: '3000' },
                { label: '₹3,000 - ₹5,000', min: '3000', max: '5000' },
                { label: 'Over ₹5,000', min: '5000', max: '' },
              ].map((tier, idx) => {
                const isActive = currentMinPrice === tier.min && currentMaxPrice === tier.max;
                return (
                  <button
                    key={idx}
                    onClick={() => handlePriceRange(tier.min, tier.max)}
                    className={`w-full text-left px-3 py-2 rounded-xl transition-colors ${
                      isActive ? 'bg-primary-50 text-primary-700 font-bold' : 'hover:bg-slate-50'
                    }`}
                  >
                    {tier.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Availability */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Availability</h4>
            <label className="flex items-center gap-2.5 text-sm font-medium text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={currentInStock}
                onChange={(e) => updateParam('in_stock', e.target.checked ? 'true' : '')}
                className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
              />
              In Stock Only
            </label>
          </div>
        </aside>

        {/* Right Product Grid Area */}
        <div className="lg:col-span-3 space-y-8">
          {/* Active Filter Pills */}
          {(currentCategory || currentSearch || currentInStock || currentMinPrice) && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-slate-400 font-medium">Active:</span>
              {currentCategory && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-primary-100 text-primary-800">
                  {categories.find((c) => c.slug === currentCategory)?.name || currentCategory}
                  <X className="w-3.5 h-3.5 cursor-pointer" onClick={() => updateParam('category', '')} />
                </span>
              )}
              {currentSearch && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-slate-200 text-slate-800">
                  "{currentSearch}"
                  <X className="w-3.5 h-3.5 cursor-pointer" onClick={() => updateParam('search', '')} />
                </span>
              )}
              {currentInStock && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                  In Stock Only
                  <X className="w-3.5 h-3.5 cursor-pointer" onClick={() => updateParam('in_stock', '')} />
                </span>
              )}
              {currentMinPrice && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                  ₹{currentMinPrice} {currentMaxPrice ? `- ₹${currentMaxPrice}` : '+'}
                  <X className="w-3.5 h-3.5 cursor-pointer" onClick={() => handlePriceRange('', '')} />
                </span>
              )}
            </div>
          )}

          {/* Product Grid or Loader */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm animate-pulse space-y-4">
                  <div className="h-56 bg-slate-200 rounded-2xl w-full"></div>
                  <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                  <div className="h-3 bg-slate-100 rounded w-1/2"></div>
                  <div className="h-8 bg-slate-200 rounded-xl w-full"></div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="bg-white rounded-3xl p-16 text-center shadow-card border border-slate-200/80 space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center mx-auto">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 font-heading">No Products Found</h3>
              <p className="text-sm text-slate-500 max-w-sm mx-auto">
                No items match your selected filters. Try clearing your search or expanding the price range.
              </p>
              <Button onClick={clearAllFilters} size="sm">
                Clear Filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 pt-6 border-t border-slate-200">
              <button
                disabled={currentPage <= 1}
                onClick={() => updateParam('page', (currentPage - 1).toString())}
                className="p-2.5 rounded-xl border border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="text-sm font-semibold text-slate-700">
                Page {currentPage} of {totalPages}
              </span>
              <button
                disabled={currentPage >= totalPages}
                onClick={() => updateParam('page', (currentPage + 1).toString())}
                className="p-2.5 rounded-xl border border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
