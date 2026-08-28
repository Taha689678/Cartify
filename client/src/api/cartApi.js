import api from "../services/api.js";

export const cartApi = {
  getCart: () => api.get("/cart"),
  addToCart: (productId, quantity) => api.post("/cart/items", { productId, quantity }),
  updateCartItem: (productId, quantity) => api.patch(`/cart/items/${productId}`, { quantity }),
  removeCartItem: (productId) => api.delete(`/cart/items/${productId}`),
  clearCart: () => api.delete("/cart"),
};
