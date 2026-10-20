import React from 'react';
import { Link } from 'react-router-dom';
import { Star, ShoppingBag, MapPin, Heart } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';

export const ProductCard = ({ product, onAddToCart, onToggleWishlist, isWishlisted }) => {
  const { addToCart } = useCart();
  const { toggleWishlist, isWishlisted: checkWishlist } = useWishlist();

  const activeIsWishlisted =
    typeof isWishlisted === 'boolean' ? isWishlisted : checkWishlist(product.id);

  const handleAdd = () => {
    if (onAddToCart) {
      onAddToCart(product);
    } else {
      addToCart(product.id, 1);
    }
  };

  const handleToggle = () => {
    if (onToggleWishlist) {
      onToggleWishlist(product);
    } else {
      toggleWishlist(product);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const imageSrc =
    product.primary_image ||
    'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=600&q=80';

  return (
    <div className="group relative bg-white rounded-3xl overflow-hidden shadow-card hover:shadow-premium transition-all duration-300 border border-slate-200/80 flex flex-col justify-between">
      {/* Top Image & Floating Badges */}
      <div className="relative h-64 overflow-hidden bg-slate-100">
        <Link to={`/product/${product.slug}`} className="block w-full h-full">
          <img
            src={imageSrc}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500 ease-out"
          />
        </Link>

        {/* Floating Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10 pointer-events-none">
          {product.discount_percentage > 0 && (
            <span className="px-2.5 py-1 rounded-full text-[11px] font-black bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-md">
              -{product.discount_percentage}% OFF
            </span>
          )}
          {product.is_featured && (
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-slate-900 shadow-sm">
              Featured
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          type="button"
          onClick={handleToggle}
          className="absolute top-3 right-3 p-2 rounded-full bg-white/90 backdrop-blur-md text-slate-500 hover:text-red-500 shadow-sm transition-colors z-10"
          title="Save to Wishlist"
        >
          <Heart className={`w-4 h-4 ${activeIsWishlisted ? 'fill-red-500 text-red-500' : ''}`} />
        </button>

        {/* Origin Tag */}
        {product.origin_region && (
          <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-medium flex items-center gap-1 shadow-sm">
            <MapPin className="w-3 h-3 text-amber-400" />
            <span>{product.origin_region}</span>
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span className="text-primary-700 font-bold uppercase tracking-wider text-[11px]">
              {product.category_name}
            </span>
            <div className="flex items-center gap-1 text-slate-700 font-bold">
              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span>{product.average_rating || 5.0}</span>
              <span className="text-slate-400 font-normal">({product.reviews_count || 0})</span>
            </div>
          </div>

          <Link to={`/product/${product.slug}`} className="block group-hover:text-primary-600 transition-colors">
            <h3 className="font-heading font-bold text-base text-slate-900 line-clamp-2 leading-snug">
              {product.title}
            </h3>
          </Link>

          {product.short_description && (
            <p className="text-xs text-slate-500 line-clamp-1">{product.short_description}</p>
          )}
        </div>

        {/* Price & Add to Bag */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-heading font-black text-lg text-slate-900">
                {formatCurrency(product.effective_price)}
              </span>
              {product.discount_price && (
                <span className="text-xs text-slate-400 line-through">
                  {formatCurrency(product.price)}
                </span>
              )}
            </div>
            <span className="text-[10px] text-slate-400 capitalize">per {product.unit || 'item'}</span>
          </div>

          {product.is_in_stock ? (
            <button
              type="button"
              onClick={handleAdd}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold shadow-md shadow-primary-500/20 active:scale-95 transition-all"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          ) : (
            <span className="text-xs font-bold text-red-600 bg-red-50 px-2.5 py-1.5 rounded-xl border border-red-200">
              Out of Stock
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
