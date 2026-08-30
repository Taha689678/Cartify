import Product from "../models/Product.js";
import Order from "../models/Order.js";
import Seller from "../models/Seller.js";
import ApiError from "../utils/apiError.js";
import { successResponse } from "../utils/apiResponse.js";

// === Products ===

export const getProducts = async (req, res, next) => {
  try {
    const products = await Product.find({ seller: req.sellerId });
    return successResponse(res, 200, "Products fetched successfully", products);
  } catch (error) {
    next(error);
  }
};

export const createProduct = async (req, res, next) => {
  try {
    const productData = { ...req.body, seller: req.sellerId };
    
    // Generate slug from name if not provided
    if (!productData.slug && productData.name) {
      const baseSlug = productData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");
      // Append random string to prevent duplicates
      const randomStr = Math.random().toString(36).substring(2, 8);
      productData.slug = `${baseSlug}-${randomStr}`;
    }

    const product = await Product.create(productData);
    return successResponse(res, 201, "Product created successfully", product);
  } catch (error) {
    next(error);
  }
};

export const getProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await Product.findOne({ _id: id, seller: req.sellerId });
    if (!product) {
      return next(new ApiError(404, "Product not found"));
    }
    return successResponse(res, 200, "Product fetched successfully", product);
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };
    delete updateData.seller; // Exclude seller from updates

    const product = await Product.findOneAndUpdate(
      { _id: id, seller: req.sellerId },
      updateData,
      { new: true, runValidators: true }
    );

    if (!product) {
      return next(new ApiError(404, "Product not found"));
    }

    return successResponse(res, 200, "Product updated successfully", product);
  } catch (error) {
    next(error);
  }
};

export const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await Product.findOneAndDelete({ _id: id, seller: req.sellerId });
    if (!product) {
      return next(new ApiError(404, "Product not found"));
    }
    return successResponse(res, 200, "Product deleted successfully");
  } catch (error) {
    next(error);
  }
};

export const updateProductStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    if (isActive === undefined) {
      return next(new ApiError(400, "isActive status is required"));
    }

    const product = await Product.findOneAndUpdate(
      { _id: id, seller: req.sellerId },
      { isActive },
      { new: true, runValidators: true }
    );

    if (!product) {
      return next(new ApiError(404, "Product not found"));
    }
    return successResponse(res, 200, "Product status updated", product);
  } catch (error) {
    next(error);
  }
};

export const updateProductStock = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { stock } = req.body;

    if (stock === undefined || stock < 0) {
      return next(new ApiError(400, "Valid stock value (>= 0) is required"));
    }

    const product = await Product.findOneAndUpdate(
      { _id: id, seller: req.sellerId },
      { stock },
      { new: true, runValidators: true }
    );

    if (!product) {
      return next(new ApiError(404, "Product not found"));
    }
    return successResponse(res, 200, "Product stock updated", product);
  } catch (error) {
    next(error);
  }
};

// === Orders ===

export const getOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ "items.seller": req.sellerId });
    
    // Filter items to include only seller's items
    const filteredOrders = orders.map(order => {
      const orderObj = order.toObject();
      orderObj.items = orderObj.items.filter(item => item.seller.toString() === req.sellerId);
      return orderObj;
    });

    return successResponse(res, 200, "Orders fetched successfully", filteredOrders);
  } catch (error) {
    next(error);
  }
};

export const getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const order = await Order.findOne({ _id: id, "items.seller": req.sellerId });
    
    if (!order) {
      return next(new ApiError(404, "Order not found"));
    }

    const orderObj = order.toObject();
    orderObj.items = orderObj.items.filter(item => item.seller.toString() === req.sellerId);

    return successResponse(res, 200, "Order fetched successfully", orderObj);
  } catch (error) {
    next(error);
  }
};

export const updateOrderItemStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { itemId, status } = req.body;

    const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return next(new ApiError(400, "Invalid status"));
    }

    const order = await Order.findOne({ _id: id, "items.seller": req.sellerId });
    if (!order) {
      return next(new ApiError(404, "Order not found"));
    }

    let modified = false;
    for (const item of order.items) {
      if (item.seller.toString() === req.sellerId) {
        if (!itemId || item._id.toString() === itemId) {
          item.itemStatus = status;
          modified = true;
        }
      }
    }

    if (!modified) {
      return next(new ApiError(404, "Order item not found or does not belong to seller"));
    }

    await order.save();

    const orderObj = order.toObject();
    orderObj.items = orderObj.items.filter(item => item.seller.toString() === req.sellerId);

    return successResponse(res, 200, "Order item status updated", orderObj);
  } catch (error) {
    next(error);
  }
};

// === Dashboard ===

export const getDashboard = async (req, res, next) => {
  try {
    const totalProducts = await Product.countDocuments({ seller: req.sellerId });
    const activeProducts = await Product.countDocuments({ seller: req.sellerId, isActive: true });

    const orders = await Order.find({ "items.seller": req.sellerId });
    
    let totalItemsSold = 0;
    let totalRevenue = 0;
    
    for (const order of orders) {
      for (const item of order.items) {
        if (item.seller.toString() === req.sellerId) {
          totalItemsSold += item.quantity;
          totalRevenue += item.quantity * item.price;
        }
      }
    }

    return successResponse(res, 200, "Dashboard stats fetched successfully", {
      totalProducts,
      activeProducts,
      totalOrders: orders.length,
      totalItemsSold,
      totalRevenue
    });
  } catch (error) {
    next(error);
  }
};
