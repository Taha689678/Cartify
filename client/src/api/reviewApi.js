import api from "../services/api.js";
export const reviewApi = {
  getProductReviews: (productId, params) => api.get(`/reviews/product/${productId}`, { params }),
  checkEligibility: (productId) => api.get(`/reviews/check-eligibility/${productId}`),
  createReview: (data) => api.post("/reviews", data),
  updateReview: (id, data) => api.patch(`/reviews/${id}`, data),
  deleteReview: (id) => api.delete(`/reviews/${id}`),
};
