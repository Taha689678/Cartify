import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import { successResponse, errorResponse } from "../utils/apiResponse.js";

// GET /api/cart
export const getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user.id }).populate({
      path: "items.product",
      select: "name images price stock seller isActive",
      populate: { path: "seller", select: "storeName storeSlug" }
    });

    if (!cart) {
      cart = await Cart.create({ user: req.user.id, items: [] });
    }

    // Filter out items where the product was deleted or is inactive, if necessary.
    // For now, we return it but the frontend can handle inactive products.
    // Wait, let's filter out null products (deleted from DB).
    const validItems = cart.items.filter(item => item.product != null);
    if (validItems.length !== cart.items.length) {
      cart.items = validItems;
      await cart.save();
    }

    return successResponse(res, 200, "Cart retrieved", { cart });
  } catch (error) {
    return errorResponse(res, 500, "Error retrieving cart", error.message);
  }
};

// POST /api/cart/items
export const addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    
    if (!productId || !quantity || quantity < 1) {
      return errorResponse(res, 400, "Invalid product or quantity");
    }

    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      return errorResponse(res, 404, "Product not found or inactive");
    }

    let cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      cart = await Cart.create({ user: req.user.id, items: [] });
    }

    const existingItemIndex = cart.items.findIndex(
      item => item.product.toString() === productId
    );

    let newQuantity = quantity;
    if (existingItemIndex > -1) {
      newQuantity += cart.items[existingItemIndex].quantity;
    }

    if (newQuantity > product.stock) {
      return errorResponse(res, 400, `Cannot exceed available stock (${product.stock})`);
    }

    if (existingItemIndex > -1) {
      cart.items[existingItemIndex].quantity = newQuantity;
      cart.items[existingItemIndex].price = product.price; // Update to latest price
    } else {
      cart.items.push({
        product: productId,
        quantity: newQuantity,
        price: product.price
      });
    }

    await cart.save();
    await cart.populate({
      path: "items.product",
      select: "name images price stock seller isActive",
      populate: { path: "seller", select: "storeName storeSlug" }
    });

    return successResponse(res, 200, "Item added to cart", { cart });
  } catch (error) {
    return errorResponse(res, 500, "Error adding to cart", error.message);
  }
};

// PATCH /api/cart/items/:productId
export const updateCartItem = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
      return errorResponse(res, 400, "Invalid quantity");
    }

    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      return errorResponse(res, 404, "Product not found or inactive");
    }

    if (quantity > product.stock) {
      return errorResponse(res, 400, `Cannot exceed available stock (${product.stock})`);
    }

    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return errorResponse(res, 404, "Cart not found");
    }

    const itemIndex = cart.items.findIndex(
      item => item.product.toString() === productId
    );

    if (itemIndex === -1) {
      return errorResponse(res, 404, "Item not found in cart");
    }

    cart.items[itemIndex].quantity = quantity;
    cart.items[itemIndex].price = product.price; // Update to latest price
    await cart.save();
    
    await cart.populate({
      path: "items.product",
      select: "name images price stock seller isActive",
      populate: { path: "seller", select: "storeName storeSlug" }
    });

    return successResponse(res, 200, "Cart updated", { cart });
  } catch (error) {
    return errorResponse(res, 500, "Error updating cart", error.message);
  }
};

// DELETE /api/cart/items/:productId
export const removeCartItem = async (req, res) => {
  try {
    const { productId } = req.params;
    const cart = await Cart.findOne({ user: req.user.id });
    
    if (!cart) {
      return errorResponse(res, 404, "Cart not found");
    }

    cart.items = cart.items.filter(
      item => item.product.toString() !== productId
    );

    await cart.save();
    await cart.populate({
      path: "items.product",
      select: "name images price stock seller isActive",
      populate: { path: "seller", select: "storeName storeSlug" }
    });

    return successResponse(res, 200, "Item removed from cart", { cart });
  } catch (error) {
    return errorResponse(res, 500, "Error removing item", error.message);
  }
};

// DELETE /api/cart
export const clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (cart) {
      cart.items = [];
      await cart.save();
    }
    return successResponse(res, 200, "Cart cleared", { cart: { items: [] } });
  } catch (error) {
    return errorResponse(res, 500, "Error clearing cart", error.message);
  }
};
