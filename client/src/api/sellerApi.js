import api from "../services/api.js";

export const sellerApi = {
  getDashboard: () => api.get("/seller/dashboard"),
  getProducts: () => api.get("/seller/products"),
  getProduct: (id) => api.get(`/seller/products/${id}`),
  createProduct: (data) => api.post("/seller/products", data),
  updateProduct: (id, data) => api.patch(`/seller/products/${id}`, data),
  updateProductStatus: (id, status) => api.patch(`/seller/products/${id}/status`, { isActive: status }),
  updateProductStock: (id, stock) => api.patch(`/seller/products/${id}/stock`, { stock }),
  deleteProduct: (id) => api.delete(`/seller/products/${id}`),
  getOrders: () => api.get("/seller/orders"),
  getOrder: (id) => api.get(`/seller/orders/${id}`),
  updateOrderItemStatus: (orderId, itemId, status) => api.patch(`/seller/orders/${orderId}/status`, { itemId, status }),
};
