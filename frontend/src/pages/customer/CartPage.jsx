import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  Sparkles,
  Tag,
  ShieldCheck,
  Truck,
  RotateCcw,
  CheckCircle,
  X,
  AlertCircle,
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/common/Button';

export const CartPage = () => {
  const {
    cart,
    loading,
    itemsCount,
    subtotal,
    shippingFee,
    discountAmount,
    grandTotal,
    appliedCoupon,
    updateQuantity,
    removeItem,
    clearCart,
    applyCoupon,
    removeCoupon,
  } = useCart();

  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [couponCode, setCouponCode] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState('');

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    setCouponError('');
    const res = await applyCoupon(couponCode.trim().toUpperCase());
    setCouponLoading(false);
    if (!res.success) {
      setCouponError(res.message);
    } else {
      setCouponCode('');
    }
  };

  const freeDeliveryThreshold = 999;
  const remainingForFreeDelivery = Math.max(0, freeDeliveryThreshold - (subtotal || 0));
  const deliveryProgress = Math.min(100, Math.round(((subtotal || 0) / freeDeliveryThreshold) * 100));

  if (!isAuthenticated) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-20 h-20 rounded-3xl bg-primary-50 text-primary-600 flex items-center justify-center mx-auto shadow-md">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-extrabold text-slate-900 font-heading">
            Your Shopping Bag is Waiting
          </h2>
          <p className="text-slate-500 max-w-md mx-auto text-sm">
            Sign in to view your saved cart items, festive discounts, and proceed to checkout smoothly.
          </p>
        </div>
        <div className="flex justify-center gap-4">
          <Link to="/login">
            <Button size="lg">Sign In to Indian Bazar</Button>
          </Link>
          <Link to="/shop">
            <Button variant="outline" size="lg">Continue Browsing</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (loading && !cart) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center">
        <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-slate-500 font-medium text-sm">Fetching your shopping bag...</p>
      </div>
    );
  }

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-24 h-24 rounded-3xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto shadow-inner">
          <ShoppingBag className="w-12 h-12" />
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-extrabold text-slate-900 font-heading">
            Your Shopping Bag is Empty
          </h2>
          <p className="text-slate-500 max-w-md mx-auto text-sm">
            Discover exquisite handlooms, organic heritage spices, royal brassware, and festive delights from across India.
          </p>
        </div>
        <Link to="/shop" className="inline-block">
          <Button size="lg" icon={ArrowRight}>
            Explore the Bazaar
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Title & Clear Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-3xl font-extrabold font-heading text-slate-900 tracking-tight">
            Shopping Bag <span className="text-primary-600 text-xl font-normal">({itemsCount} {itemsCount === 1 ? 'item' : 'items'})</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Handcrafted luxury and authentic Indian regional treasures
          </p>
        </div>
        <button
          type="button"
          onClick={clearCart}
          className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1.5 w-fit"
        >
          <Trash2 className="w-4 h-4" /> Clear All Items
        </button>
      </div>

      {/* Free Delivery Bar */}
      <div className="bg-gradient-to-r from-amber-50 to-primary-50 rounded-2xl p-4 border border-amber-200/70 space-y-2">
        <div className="flex items-center justify-between text-xs font-bold">
          <span className="flex items-center gap-2 text-slate-800">
            <Truck className="w-4 h-4 text-primary-600" />
            {remainingForFreeDelivery === 0 ? (
              <span className="text-emerald-700 font-extrabold">🎉 You unlocked FREE Pan-India Delivery!</span>
            ) : (
              <span>Add <strong className="text-primary-700">{formatCurrency(remainingForFreeDelivery)}</strong> more for FREE Pan-India Delivery</span>
            )}
          </span>
          <span className="text-slate-500">{deliveryProgress}%</span>
        </div>
        <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-amber-500 to-primary-600 rounded-full transition-all duration-500"
            style={{ width: `${deliveryProgress}%` }}
          ></div>
        </div>
      </div>

      {/* Main Cart Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Cart Items List */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white rounded-3xl shadow-card border border-slate-200/80 divide-y divide-slate-100 overflow-hidden">
            {cart.items.map((item) => (
              <div
                key={item.id}
                className="p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 hover:bg-slate-50/50 transition-colors"
              >
                {/* Product Thumbnail & Details */}
                <div className="flex items-center gap-4 flex-1">
                  <Link
                    to={`/product/${item.product_slug}`}
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-slate-100 flex-shrink-0 border border-slate-200"
                  >
                    <img
                      src={
                        item.product_image ||
                        'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=400&q=80'
                      }
                      alt={item.product_title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform"
                    />
                  </Link>

                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-primary-700">
                      {item.product_category}
                    </span>
                    <Link
                      to={`/product/${item.product_slug}`}
                      className="block font-heading font-bold text-base text-slate-900 hover:text-primary-600 transition-colors line-clamp-2"
                    >
                      {item.product_title}
                    </Link>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span>Price: <strong className="text-slate-800">{formatCurrency(item.unit_price)}</strong></span>
                      <span>•</span>
                      <span>Unit: {item.product_unit}</span>
                    </div>
                  </div>
                </div>

                {/* Quantity Stepper & Price / Delete */}
                <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  {/* Quantity Stepper */}
                  <div className="flex items-center border border-slate-300 rounded-xl bg-white shadow-sm overflow-hidden">
                    <button
                      type="button"
                      disabled={item.quantity <= 1}
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="p-2 hover:bg-slate-100 disabled:opacity-40 transition-colors"
                      title="Decrease quantity"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-10 text-center text-xs font-bold text-slate-800">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      disabled={item.quantity >= item.stock_quantity}
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="p-2 hover:bg-slate-100 disabled:opacity-40 transition-colors"
                      title="Increase quantity"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Line Total */}
                  <div className="text-right min-w-[90px]">
                    <span className="font-heading font-black text-base text-slate-900 block">
                      {formatCurrency(item.total_price)}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      ({formatCurrency(item.unit_price)} × {item.quantity})
                    </span>
                  </div>

                  {/* Remove Button */}
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    className="p-2 text-slate-400 hover:text-red-600 rounded-xl hover:bg-red-50 transition-colors"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 pt-2">
            <Link to="/shop" className="text-primary-600 font-bold hover:underline flex items-center gap-1">
              ← Continue Shopping
            </Link>
            <span>Prices are inclusive of Indian GST</span>
          </div>
        </div>

        {/* Right Column: Order Summary & Coupon Card */}
        <div className="lg:col-span-4 space-y-6">
          {/* Coupon Code Drawer */}
          <div className="bg-white rounded-3xl p-6 shadow-card border border-slate-200/80 space-y-4">
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4 text-primary-600" />
              <h3 className="font-heading font-bold text-base text-slate-900">
                Apply Promo Coupon
              </h3>
            </div>

            {appliedCoupon ? (
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <div>
                    <span className="font-mono font-bold text-xs text-emerald-800">
                      {appliedCoupon.code}
                    </span>
                    <span className="text-[11px] text-emerald-700 block">
                      {appliedCoupon.discount_type === 'PERCENTAGE'
                        ? `${appliedCoupon.discount_value}% OFF`
                        : `₹${appliedCoupon.discount_value} FLAT OFF`}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={removeCoupon}
                  className="p-1 rounded-lg text-emerald-700 hover:bg-emerald-100"
                  title="Remove coupon"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyCoupon} className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="e.g. FESTIVE20"
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-mono font-semibold uppercase focus:bg-white focus:border-primary-500 focus:outline-none"
                  />
                  <Button
                    type="submit"
                    size="sm"
                    loading={couponLoading}
                    disabled={!couponCode.trim()}
                  >
                    Apply
                  </Button>
                </div>
                {couponError && (
                  <p className="text-[11px] text-red-600 font-medium flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> {couponError}
                  </p>
                )}
                {/* Available Coupon Hints */}
                <div className="pt-2 border-t border-slate-100">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1.5">
                    Available Festive Offers:
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() => setCouponCode('FESTIVE20')}
                      className="px-2.5 py-1 rounded-lg bg-primary-50 hover:bg-primary-100 text-primary-700 font-mono text-[10px] font-bold transition-colors"
                    >
                      FESTIVE20 (20% OFF)
                    </button>
                    <button
                      type="button"
                      onClick={() => setCouponCode('WELCOME100')}
                      className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 font-mono text-[10px] font-bold transition-colors"
                    >
                      WELCOME100 (₹100 OFF)
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>

          {/* Price Breakdown Card */}
          <div className="bg-white rounded-3xl p-6 shadow-card border border-slate-200/80 space-y-5">
            <h3 className="font-heading font-bold text-lg text-slate-900 border-b border-slate-100 pb-3">
              Order Summary
            </h3>

            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between text-slate-600">
                <span>Items Subtotal</span>
                <span className="font-semibold text-slate-900">{formatCurrency(subtotal)}</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex items-center justify-between text-emerald-600 font-medium">
                  <span className="flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" /> Coupon Discount
                  </span>
                  <span className="font-bold">-{formatCurrency(discountAmount)}</span>
                </div>
              )}

              <div className="flex items-center justify-between text-slate-600">
                <span className="flex items-center gap-1">
                  <Truck className="w-3.5 h-3.5 text-slate-400" /> Shipping & Handling
                </span>
                <span>
                  {shippingFee === 0 ? (
                    <span className="text-emerald-700 font-bold uppercase text-xs">FREE</span>
                  ) : (
                    <span className="font-semibold text-slate-900">{formatCurrency(shippingFee)}</span>
                  )}
                </span>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-baseline justify-between">
                <div>
                  <span className="font-heading font-extrabold text-lg text-slate-900 block">
                    Total Amount
                  </span>
                  <span className="text-[10px] text-slate-400">Inclusive of all Indian taxes</span>
                </div>
                <span className="font-heading font-black text-2xl text-primary-700">
                  {formatCurrency(grandTotal)}
                </span>
              </div>
            </div>

            <Button
              size="lg"
              className="w-full shadow-lg shadow-primary-500/25"
              icon={ArrowRight}
              onClick={() => navigate('/checkout')}
            >
              Proceed to Checkout
            </Button>

            {/* Trust Assurance */}
            <div className="pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-center text-[10px] text-slate-500">
              <div className="flex items-center justify-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-primary-600" /> 100% Secure Checkout
              </div>
              <div className="flex items-center justify-center gap-1">
                <RotateCcw className="w-3.5 h-3.5 text-primary-600" /> Easy 7-Day Returns
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
