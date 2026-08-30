import api from "../services/api.js";

export const paymentApi = {
  initiatePayFastPayment: (data) => api.post("/payments/payfast/initiate", data),
  getPaymentByOrderId: (orderId) => api.get(`/payments/order/${orderId}`),
};
