import api from '../services/api.js';

export const wishlistApi = {
  getWishlist: () => api.get('/wishlist'),
  addToWishlist: (productId) => api.post('/wishlist/items', { productId }),
  removeFromWishlist: (productId) => api.delete(`/wishlist/items/${productId}`),
  clearWishlist: () => api.delete('/wishlist'),
};
