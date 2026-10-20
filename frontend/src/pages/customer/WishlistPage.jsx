import React from 'react';
import { Link } from 'react-router-dom';
import {
  Heart,
  ShoppingBag,
  Trash2,
  ArrowRight,
  Star,
  MapPin,
  Sparkles,
} from 'lucide-react';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/common/Button';

export const WishlistPage = () => {
  const { wishlistProducts, loading, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  const handleMoveToCart = async (product) => {
    const success = await addToCart(product.id, 1);
    if (success) {
      await toggleWishlist(product);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-20 h-20 rounded-3xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto shadow-md">
          <Heart className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-extrabold text-slate-900 font-heading">
            Your Wishlist Awaits
          </h2>
          <p className="text-slate-500 max-w-md mx-auto text-sm">
            Sign in to your Indian Bazar account to save and sync your favorite handcrafted items across all your devices.
          </p>
        </div>
        <div className="flex justify-center gap-4">
          <Link to="/login">
            <Button size="lg">Sign In to Indian Bazar</Button>
          </Link>
          <Link to="/shop">
            <Button variant="outline" size="lg">Explore Products</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (loading && wishlistProducts.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center">
        <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-slate-500 font-medium text-sm">Loading your saved items...</p>
      </div>
    );
  }

  if (wishlistProducts.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-24 h-24 rounded-3xl bg-rose-50 text-rose-400 flex items-center justify-center mx-auto shadow-inner">
          <Heart className="w-12 h-12" />
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-extrabold text-slate-900 font-heading">
            Your Wishlist is Empty
          </h2>
          <p className="text-slate-500 max-w-md mx-auto text-sm">
            Save the products you adore by clicking the heart icon while exploring our royal Indian collections.
          </p>
        </div>
        <Link to="/shop" className="inline-block">
          <Button size="lg" icon={ArrowRight}>
            Discover Curated Crafts
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-3xl font-extrabold font-heading text-slate-900 tracking-tight">
            My Wishlist <span className="text-rose-600 text-xl font-normal">({wishlistProducts.length} {wishlistProducts.length === 1 ? 'item' : 'items'})</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Items saved for later from your favorite Indian artisans and collections
          </p>
        </div>
        <Link to="/shop">
          <Button variant="outline" size="sm" icon={Sparkles}>
            Explore More Items
          </Button>
        </Link>
      </div>

      {/* Wishlist Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {wishlistProducts.map((product) => {
          const imageSrc =
            product.primary_image ||
            'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=600&q=80';

          return (
            <div
              key={product.id}
              className="bg-white rounded-3xl overflow-hidden shadow-card hover:shadow-premium transition-all duration-300 border border-slate-200/80 flex flex-col justify-between group"
            >
              {/* Product Image & Badges */}
              <div className="relative h-60 overflow-hidden bg-slate-100">
                <Link to={`/product/${product.slug}`} className="block w-full h-full">
                  <img
                    src={imageSrc}
                    alt={product.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </Link>

                {/* Remove from Wishlist Button */}
                <button
                  type="button"
                  onClick={() => toggleWishlist(product)}
                  className="absolute top-3 right-3 p-2 rounded-full bg-white/90 backdrop-blur-md text-red-500 hover:bg-red-50 shadow-sm transition-colors z-10"
                  title="Remove from wishlist"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                {/* Badges */}
                <div className="absolute top-3 left-3 flex flex-col gap-1 z-10 pointer-events-none">
                  {product.discount_percentage > 0 && (
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-red-600 text-white shadow-md">
                      -{product.discount_percentage}% OFF
                    </span>
                  )}
                </div>

                {product.origin_region && (
                  <div className="absolute bottom-3 left-3 px-2 py-0.5 rounded-full bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-medium flex items-center gap-1 shadow-sm">
                    <MapPin className="w-3 h-3 text-amber-400" />
                    <span>{product.origin_region}</span>
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                    <span className="text-primary-700 font-bold uppercase tracking-wider text-[10px]">
                      {product.category_name}
                    </span>
                    <div className="flex items-center gap-1 text-slate-700 font-bold text-xs">
                      <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                      <span>{product.average_rating || 5.0}</span>
                    </div>
                  </div>

                  <Link
                    to={`/product/${product.slug}`}
                    className="block font-heading font-bold text-sm text-slate-900 hover:text-primary-600 transition-colors line-clamp-2"
                  >
                    {product.title}
                  </Link>

                  <div className="flex items-baseline gap-2 pt-1">
                    <span className="font-heading font-black text-base text-slate-900">
                      {formatCurrency(product.effective_price)}
                    </span>
                    {product.discount_price && (
                      <span className="text-xs text-slate-400 line-through">
                        {formatCurrency(product.price)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Move to Bag Action */}
                <div className="pt-3 border-t border-slate-100">
                  {product.is_in_stock ? (
                    <button
                      type="button"
                      onClick={() => handleMoveToCart(product)}
                      className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold shadow-md shadow-primary-500/20 active:scale-98 transition-all"
                    >
                      <ShoppingBag className="w-4 h-4" /> Move to Bag
                    </button>
                  ) : (
                    <div className="w-full py-2 text-center text-xs font-bold text-red-600 bg-red-50 rounded-xl border border-red-200">
                      Currently Out of Stock
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WishlistPage;
