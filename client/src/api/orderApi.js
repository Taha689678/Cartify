import api from "../services/api.js";
export const orderApi = {
  createOrder: (data) => api.post("/orders", data),
  getOrders: () => api.get("/orders"),
  getOrderById: (id) => api.get(`/orders/${id}`),
  cancelOrder: (id) => api.patch(`/orders/${id}/cancel`),
};
