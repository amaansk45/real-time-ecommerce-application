import api from './api';

export const productService = {
  // Fetch all categories with subcategories
  async getCategories() {
    const response = await api.get('/products/categories/');
    return response.data;
  },

  // Fetch paginated products with filtering and search
  async getProducts(params = {}) {
    const response = await api.get('/products/', { params });
    return response.data;
  },

  // Fetch single product detail by slug
  async getProductBySlug(slug) {
    const response = await api.get(`/products/${slug}/`);
    return response.data;
  },

  // Fetch related products
  async getRelatedProducts(slug) {
    const response = await api.get(`/products/${slug}/related/`);
    return response.data;
  },

  // Submit product review (authenticated)
  async submitReview(slug, reviewData) {
    const response = await api.post(`/products/${slug}/review/`, reviewData);
    return response.data;
  },

  // Admin Product CRUD
  async getAdminProducts(params = {}) {
    const response = await api.get('/products/admin/items/', { params });
    return response.data;
  },

  async createAdminProduct(productData) {
    const response = await api.post('/products/admin/items/', productData);
    return response.data;
  },

  async updateAdminProduct(id, productData) {
    const response = await api.put(`/products/admin/items/${id}/`, productData);
    return response.data;
  },

  async deleteAdminProduct(id) {
    const response = await api.delete(`/products/admin/items/${id}/`);
    return response.data;
  },
};
