import express from 'express';
import {
  getWishlist,
  addToWishlist,
  removeWishlistItem,
  clearWishlist
} from '../controllers/wishlistController.js';
import requireAuth from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(requireAuth);

router.get('/', getWishlist);
router.post('/items', addToWishlist);
router.delete('/items/:productId', removeWishlistItem);
router.delete('/', clearWishlist);

export default router;
