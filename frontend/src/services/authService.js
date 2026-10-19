import api from './api';

export const authService = {
  // Login customer or admin
  async login(email, password) {
    const response = await api.post('/auth/login/', { email, password });
    if (response.data.access) {
      localStorage.setItem('access_token', response.data.access);
      localStorage.setItem('refresh_token', response.data.refresh);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  // Register new customer
  async register(registrationData) {
    const response = await api.post('/auth/register/', registrationData);
    if (response.data.tokens?.access) {
      localStorage.setItem('access_token', response.data.tokens.access);
      localStorage.setItem('refresh_token', response.data.tokens.refresh);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  // Logout and clear credentials
  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  },

  // Get current user profile
  async getProfile() {
    const response = await api.get('/auth/profile/');
    return response.data;
  },

  // Update profile
  async updateProfile(formData) {
    const response = await api.patch('/auth/profile/', formData, {
      headers: formData instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {},
    });
    const updatedUser = response.data;
    // Sync local storage user
    const existing = JSON.parse(localStorage.getItem('user') || '{}');
    localStorage.setItem('user', JSON.stringify({ ...existing, ...updatedUser }));
    return updatedUser;
  },

  // Change password
  async changePassword(old_password, new_password, new_password_confirm) {
    const response = await api.post('/auth/change-password/', {
      old_password,
      new_password,
      new_password_confirm,
    });
    return response.data;
  },

  // Address CRUD operations
  async getAddresses() {
    const response = await api.get('/auth/addresses/');
    return response.data;
  },

  async createAddress(addressData) {
    const response = await api.post('/auth/addresses/', addressData);
    return response.data;
  },

  async updateAddress(id, addressData) {
    const response = await api.put(`/auth/addresses/${id}/`, addressData);
    return response.data;
  },

  async deleteAddress(id) {
    const response = await api.delete(`/auth/addresses/${id}/`);
    return response.data;
  },

  async setDefaultAddress(id) {
    const response = await api.post(`/auth/addresses/${id}/set-default/`);
    return response.data;
  },
};
