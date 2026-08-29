import api from "../services/api.js";
export const orderApi = {
  createOrder: (data) => api.post("/orders", data),
  getOrderById: (id) => api.get(`/orders/${id}`),
};
