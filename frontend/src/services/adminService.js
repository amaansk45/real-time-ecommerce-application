import api from './api';

export const adminService = {
  // 1. Dashboard KPI Metrics
  async getDashboardMetrics() {
    const response = await api.get('/common/admin/metrics/');
    return response.data;
  },

  // 2. Product Management
  async getAdminProducts(params = {}) {
    const response = await api.get('/products/admin/items/', { params });
    return response.data;
  },

  async createProduct(productData) {
    const response = await api.post('/products/admin/items/', productData);
    return response.data;
  },

  async updateProduct(id, productData) {
    const response = await api.patch(`/products/admin/items/${id}/`, productData);
    return response.data;
  },

  async deleteProduct(id) {
    const response = await api.delete(`/products/admin/items/${id}/`);
    return response.data;
  },

  // 3. Category & Taxonomy Management
  async getAdminCategories() {
    const response = await api.get('/products/admin/categories/');
    return response.data;
  },

  async createCategory(categoryData) {
    const response = await api.post('/products/admin/categories/', categoryData);
    return response.data;
  },

  async updateCategory(id, categoryData) {
    const response = await api.patch(`/products/admin/categories/${id}/`, categoryData);
    return response.data;
  },

  async deleteCategory(id) {
    const response = await api.delete(`/products/admin/categories/${id}/`);
    return response.data;
  },

  async getAdminSubcategories() {
    const response = await api.get('/products/admin/subcategories/');
    return response.data;
  },

  async createSubcategory(subcategoryData) {
    const response = await api.post('/products/admin/subcategories/', subcategoryData);
    return response.data;
  },

  async deleteSubcategory(id) {
    const response = await api.delete(`/products/admin/subcategories/${id}/`);
    return response.data;
  },

  // 4. Order Fulfillment & Processing
  async getAdminOrders(params = {}) {
    const response = await api.get('/orders/admin/orders/', { params });
    return response.data;
  },

  async updateOrderStatus(orderId, statusData) {
    const response = await api.post(`/orders/admin/orders/${orderId}/update-status/`, statusData);
    return response.data;
  },

  async updateOrderPayment(orderId, paymentData) {
    const response = await api.post(`/orders/admin/orders/${orderId}/update-payment/`, paymentData);
    return response.data;
  },

  // 5. Coupon & Promotions Management
  async getAdminCoupons() {
    const response = await api.get('/orders/admin/coupons/');
    return response.data;
  },

  async createCoupon(couponData) {
    const response = await api.post('/orders/admin/coupons/', couponData);
    return response.data;
  },

  async updateCoupon(id, couponData) {
    const response = await api.patch(`/orders/admin/coupons/${id}/`, couponData);
    return response.data;
  },

  async deleteCoupon(id) {
    const response = await api.delete(`/orders/admin/coupons/${id}/`);
    return response.data;
  },

  // 6. Customer Directory
  async getAdminCustomers(params = {}) {
    const response = await api.get('/auth/admin/customers/', { params });
    return response.data;
  },
};

export default adminService;
