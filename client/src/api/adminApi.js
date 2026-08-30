import api from "../services/api.js";

export const adminApi = {
  // Dashboard & Statistics
  getDashboard: () => api.get("/admin/dashboard"),
  getStatistics: () => api.get("/admin/statistics"),

  // User Management
  getUsers: (params) => api.get("/admin/users", { params }),
  getUser: (id) => api.get(`/admin/users/${id}`),
  updateUserStatus: (id, isBlocked) => api.patch(`/admin/users/${id}/status`, { isBlocked }),
  updateUserRole: (id, role) => api.patch(`/admin/users/${id}/role`, { role }),

  // Seller Management
  getSellers: (params) => api.get("/admin/sellers", { params }),
  getSeller: (id) => api.get(`/admin/sellers/${id}`),
  updateSellerStatus: (id, status) => api.patch(`/admin/sellers/${id}/status`, { status }),

  // Product Management
  getProducts: (params) => api.get("/admin/products", { params }),
  getProduct: (id) => api.get(`/admin/products/${id}`),
  updateProductStatus: (id, isActive) => api.patch(`/admin/products/${id}/status`, { isActive }),
  deleteProduct: (id) => api.delete(`/admin/products/${id}`),

  // Category Management
  getCategories: () => api.get("/admin/categories"),
  createCategory: (data) => api.post("/admin/categories", data),
  updateCategory: (id, data) => api.patch(`/admin/categories/${id}`, data),
  deleteCategory: (id) => api.delete(`/admin/categories/${id}`),

  // Order Management
  getOrders: (params) => api.get("/admin/orders", { params }),
  getOrder: (id) => api.get(`/admin/orders/${id}`),
  updateOrderStatus: (id, orderStatus) => api.patch(`/admin/orders/${id}/status`, { orderStatus }),

  // Review Moderation
  getReviews: (params) => api.get("/admin/reviews", { params }),
  getReview: (id) => api.get(`/admin/reviews/${id}`),
  updateReviewStatus: (id, status) => api.patch(`/admin/reviews/${id}/status`, { status }),
  deleteReview: (id) => api.delete(`/admin/reviews/${id}`),
};
