import api from "../services/api.js";
export const orderApi = {
  createOrder: (data) => api.post("/orders", data),
  getOrders: () => api.get("/orders"),
  getOrderById: (id) => api.get(`/orders/${id}`),
  trackOrder: (orderId) => api.post(`/orders/track`, { orderId }),
  cancelOrder: (id) => api.patch(`/orders/${id}/cancel`),
};
