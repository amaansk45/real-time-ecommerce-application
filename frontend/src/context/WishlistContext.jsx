import React, { createContext, useContext, useState, useEffect } from 'react';
import { orderService } from '../services/orderService';
import { useAuth } from './AuthContext';

const WishlistContext = createContext(null);

export const WishlistProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [wishlistProducts, setWishlistProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchWishlist = async () => {
    if (!isAuthenticated) {
      setWishlistProducts([]);
      return;
    }
    setLoading(true);
    try {
      const data = await orderService.getWishlist();
      setWishlistProducts(data.products || []);
    } catch (err) {
      console.error('Failed to load wishlist:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, [isAuthenticated]);

  const toggleWishlist = async (product) => {
    if (!isAuthenticated) {
      alert('Please sign in to save products to your wishlist.');
      return false;
    }

    try {
      const res = await orderService.toggleWishlist(product.id);
      if (res.in_wishlist) {
        setWishlistProducts((prev) => [...prev, product]);
      } else {
        setWishlistProducts((prev) => prev.filter((p) => p.id !== product.id));
      }
      return res.in_wishlist;
    } catch (err) {
      console.error('Failed to toggle wishlist:', err);
      return false;
    }
  };

  const isWishlisted = (productId) => {
    return wishlistProducts.some((p) => p.id === productId);
  };

  const value = {
    wishlistProducts,
    wishlistCount: wishlistProducts.length,
    loading,
    fetchWishlist,
    toggleWishlist,
    isWishlisted,
  };

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
