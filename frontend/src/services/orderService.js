import api from './api';

export const orderService = {
  // Cart API
  async getCart() {
    const response = await api.get('/orders/cart/');
    return response.data;
  },

  async addToCart(productId, quantity = 1) {
    const response = await api.post('/orders/cart/add/', {
      product_id: productId,
      quantity,
    });
    return response.data;
  },

  async updateCartItem(itemId, quantity) {
    const response = await api.patch(`/orders/cart/item/${itemId}/`, { quantity });
    return response.data;
  },

  async removeCartItem(itemId) {
    const response = await api.delete(`/orders/cart/item/${itemId}/`);
    return response.data;
  },

  async clearCart() {
    const response = await api.delete('/orders/cart/');
    return response.data;
  },

  async applyCoupon(code) {
    const response = await api.post('/orders/cart/apply-coupon/', { code });
    return response.data;
  },

  async removeCoupon() {
    const response = await api.post('/orders/cart/remove-coupon/');
    return response.data;
  },

  // Wishlist API
  async getWishlist() {
    const response = await api.get('/orders/wishlist/');
    return response.data;
  },

  async toggleWishlist(productId) {
    const response = await api.post('/orders/wishlist/', { product_id: productId });
    return response.data;
  },

  // Checkout & Orders API
  async checkout(checkoutData) {
    const response = await api.post('/orders/checkout/', checkoutData);
    return response.data;
  },

  async getOrders() {
    const response = await api.get('/orders/');
    return response.data;
  },

  async getOrderByNumber(orderNumber) {
    const response = await api.get(`/orders/${orderNumber}/`);
    return response.data;
  },

  async cancelOrder(orderNumber) {
    const response = await api.post(`/orders/${orderNumber}/cancel/`);
    return response.data;
  },

  async requestReturn(orderNumber) {
    const response = await api.post(`/orders/${orderNumber}/return-request/`);
    return response.data;
  },
};
