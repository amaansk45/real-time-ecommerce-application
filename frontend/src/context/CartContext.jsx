import React, { createContext, useContext, useState, useEffect } from 'react';
import { orderService } from '../services/orderService';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const fetchCart = async () => {
    if (!isAuthenticated) {
      setCart(null);
      return;
    }
    setLoading(true);
    try {
      const data = await orderService.getCart();
      setCart(data);
    } catch (err) {
      console.error('Failed to load cart:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [isAuthenticated]);

  const showFeedback = (message, type = 'success') => {
    setFeedback({ message, type });
    setTimeout(() => setFeedback(null), 3000);
  };

  const addToCart = async (productId, quantity = 1) => {
    if (!isAuthenticated) {
      showFeedback('Please log in to add items to your cart.', 'error');
      return false;
    }
    try {
      const updatedCart = await orderService.addToCart(productId, quantity);
      setCart(updatedCart);
      showFeedback('Item added to your shopping bag!');
      return true;
    } catch (err) {
      const msg = err.response?.data?.detail || 'Could not add item to cart.';
      showFeedback(msg, 'error');
      return false;
    }
  };

  const updateQuantity = async (itemId, quantity) => {
    try {
      const updatedCart = await orderService.updateCartItem(itemId, quantity);
      setCart(updatedCart);
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to update quantity.';
      showFeedback(msg, 'error');
    }
  };

  const removeItem = async (itemId) => {
    try {
      const updatedCart = await orderService.removeCartItem(itemId);
      setCart(updatedCart);
      showFeedback('Item removed from cart.');
    } catch (err) {
      showFeedback('Failed to remove item.', 'error');
    }
  };

  const clearCart = async () => {
    try {
      const updatedCart = await orderService.clearCart();
      setCart(updatedCart);
    } catch (err) {
      console.error(err);
    }
  };

  const applyCoupon = async (code) => {
    try {
      const res = await orderService.applyCoupon(code);
      setCart(res.cart);
      showFeedback(res.message);
      return { success: true, message: res.message };
    } catch (err) {
      const msg = err.response?.data?.detail || 'Invalid or expired coupon.';
      showFeedback(msg, 'error');
      return { success: false, message: msg };
    }
  };

  const removeCoupon = async () => {
    try {
      const res = await orderService.removeCoupon();
      setCart(res.cart);
      showFeedback('Coupon removed.');
    } catch (err) {
      console.error(err);
    }
  };

  const value = {
    cart,
    loading,
    feedback,
    itemsCount: cart?.items_count || 0,
    subtotal: cart?.subtotal || 0,
    shippingFee: cart?.shipping_fee || 0,
    discountAmount: cart?.discount_amount || 0,
    grandTotal: cart?.grand_total || 0,
    appliedCoupon: cart?.applied_coupon || null,
    fetchCart,
    addToCart,
    updateQuantity,
    removeItem,
    clearCart,
    applyCoupon,
    removeCoupon,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
      {/* Floating feedback toast */}
      {feedback && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl shadow-xl border text-sm font-bold flex items-center gap-2 animate-in fade-in slide-in-from-bottom-3 duration-200 ${
            feedback.type === 'error'
              ? 'bg-red-600 text-white border-red-700'
              : 'bg-slate-900 text-white border-slate-800'
          }`}
        >
          <span>{feedback.message}</span>
        </div>
      )}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
