import Wishlist from '../models/Wishlist.js';
import Product from '../models/Product.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

// GET /api/wishlist
export const getWishlist = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;

    let wishlist = await Wishlist.findOne({ user: userId }).populate({
      path: 'items.product',
      select: 'name slug price compareAtPrice images rating numReviews stock category brand isActive seller',
      populate: { path: 'seller', select: 'storeName storeSlug' } // populate seller cautiously if it's safe
    });

    if (!wishlist) {
      wishlist = await Wishlist.create({ user: userId, items: [] });
    }

    // Optional: filter out null products (deleted from DB)
    const validItems = wishlist.items.filter(item => item.product != null);
    if (validItems.length !== wishlist.items.length) {
      wishlist.items = validItems;
      await wishlist.save();
    }

    return successResponse(res, 200, 'Wishlist retrieved', { wishlist });
  } catch (error) {
    return errorResponse(res, 500, 'Error retrieving wishlist', error.message);
  }
};

// POST /api/wishlist/items
export const addToWishlist = async (req, res) => {
  try {
    const { productId } = req.body;
    const userId = req.user.id || req.user._id;

    if (!productId) {
      return errorResponse(res, 400, 'Product ID is required');
    }

    // Check product exists and is active
    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      return errorResponse(res, 404, 'Product not found or inactive');
    }

    let wishlist = await Wishlist.findOne({ user: userId });
    if (!wishlist) {
      wishlist = await Wishlist.create({ user: userId, items: [] });
    }

    // Check for duplicate
    const exists = wishlist.items.some(
      item => item.product.toString() === productId
    );

    if (exists) {
      return errorResponse(res, 400, 'Product is already in your wishlist');
    }

    wishlist.items.push({ product: productId });
    await wishlist.save();

    await wishlist.populate({
      path: 'items.product',
      select: 'name slug price compareAtPrice images rating numReviews stock category brand isActive seller',
      populate: { path: 'seller', select: 'storeName storeSlug' }
    });

    return successResponse(res, 201, 'Product added to wishlist', { wishlist });
  } catch (error) {
    return errorResponse(res, 500, 'Error adding to wishlist', error.message);
  }
};

// DELETE /api/wishlist/items/:productId
export const removeWishlistItem = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user.id || req.user._id;

    const wishlist = await Wishlist.findOne({ user: userId });
    
    if (!wishlist) {
      return errorResponse(res, 404, 'Wishlist not found');
    }

    wishlist.items = wishlist.items.filter(
      item => item.product.toString() !== productId
    );

    await wishlist.save();

    await wishlist.populate({
      path: 'items.product',
      select: 'name slug price compareAtPrice images rating numReviews stock category brand isActive seller',
      populate: { path: 'seller', select: 'storeName storeSlug' }
    });

    return successResponse(res, 200, 'Item removed from wishlist', { wishlist });
  } catch (error) {
    return errorResponse(res, 500, 'Error removing item from wishlist', error.message);
  }
};

// DELETE /api/wishlist
export const clearWishlist = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const wishlist = await Wishlist.findOne({ user: userId });
    
    if (wishlist) {
      wishlist.items = [];
      await wishlist.save();
    }
    
    return successResponse(res, 200, 'Wishlist cleared', { wishlist: { items: [] } });
  } catch (error) {
    return errorResponse(res, 500, 'Error clearing wishlist', error.message);
  }
};
