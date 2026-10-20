import api from './api';

export const paymentService = {
  // Create Razorpay order on backend
  async createRazorpayOrder(orderNumber) {
    const response = await api.post('/payments/razorpay/create-order/', {
      order_number: orderNumber,
    });
    return response.data;
  },

  // Verify HMAC-SHA256 signature
  async verifyRazorpayPayment(verificationData) {
    const response = await api.post('/payments/razorpay/verify/', verificationData);
    return response.data;
  },

  // Confirm COD choice
  async confirmCod(orderNumber) {
    const response = await api.post('/payments/cod/confirm/', {
      order_number: orderNumber,
    });
    return response.data;
  },
};
