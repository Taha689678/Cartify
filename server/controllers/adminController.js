import mongoose from "mongoose";
import User from "../models/User.js";
import Product from "../models/Product.js";
import Order from "../models/Order.js";
import Review from "../models/Review.js";
import Category from "../models/Category.js";
import Seller from "../models/Seller.js";
import Payment from "../models/Payment.js";
import ApiError from "../utils/apiError.js";
import { successResponse, errorResponse } from "../utils/apiResponse.js";
import { updateProductRating } from "./reviewController.js";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const SAFE_USER_FIELDS =
  "name username email phone avatar role isVerified isBlocked createdAt updatedAt";

const validateObjectId = (id, label = "ID") => {
  if (!mongoose.isValidObjectId(id)) {
    throw new ApiError(400, `Invalid ${label}`);
  }
};

// ---------------------------------------------------------------------------
// DASHBOARD
// ---------------------------------------------------------------------------

export const getDashboard = async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalCustomers,
      totalSellers,
      totalProducts,
      activeProducts,
      totalOrders,
      totalReviews,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: "customer" }),
      User.countDocuments({ role: "seller" }),
      Product.countDocuments(),
      Product.countDocuments({ isActive: true }),
      Order.countDocuments(),
      Review.countDocuments(),
    ]);

    // Order status breakdown
    const [pendingOrders, deliveredOrders, cancelledOrders] =
      await Promise.all([
        Order.countDocuments({ orderStatus: "pending" }),
        Order.countDocuments({ orderStatus: "delivered" }),
        Order.countDocuments({ orderStatus: "cancelled" }),
      ]);

    // Revenue: sum totalAmount from orders that are paid
    const revenueResult = await Order.aggregate([
      { $match: { paymentStatus: "paid" } },
      { $group: { _id: null, totalRevenue: { $sum: "$totalAmount" } } },
    ]);
    const totalRevenue =
      revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;

    // COD revenue (pending payment but delivered)
    const codRevenueResult = await Order.aggregate([
      {
        $match: {
          paymentMethod: "cod",
          orderStatus: "delivered",
          paymentStatus: "pending",
        },
      },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]);
    const codPendingRevenue =
      codRevenueResult.length > 0 ? codRevenueResult[0].total : 0;

    return successResponse(res, 200, "Dashboard stats fetched", {
      totalUsers,
      totalCustomers,
      totalSellers,
      totalProducts,
      activeProducts,
      totalOrders,
      pendingOrders,
      deliveredOrders,
      cancelledOrders,
      totalReviews,
      totalRevenue,
      codPendingRevenue,
    });
  } catch (error) {
    next(error);
  }
};

// ---------------------------------------------------------------------------
// USER MANAGEMENT
// ---------------------------------------------------------------------------

export const getUsers = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const skip = (page - 1) * limit;

    const filter = {};

    // Filter by role
    if (req.query.role && ["customer", "seller", "admin"].includes(req.query.role)) {
      filter.role = req.query.role;
    }

    // Filter by blocked status
    if (req.query.status === "blocked") {
      filter.isBlocked = true;
    } else if (req.query.status === "active") {
      filter.isBlocked = false;
    }

    // Search by name, email, or username
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, "i");
      filter.$or = [
        { name: searchRegex },
        { email: searchRegex },
        { username: searchRegex },
      ];
    }

    const [users, total] = await Promise.all([
      User.find(filter)
        .select(SAFE_USER_FIELDS)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(filter),
    ]);

    return successResponse(res, 200, "Users fetched", { users }, {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;
    validateObjectId(id, "user ID");

    const user = await User.findById(id).select(SAFE_USER_FIELDS).lean();
    if (!user) {
      return next(new ApiError(404, "User not found"));
    }

    // If seller, include seller profile
    let seller = null;
    if (user.role === "seller") {
      seller = await Seller.findOne({ user: id })
        .select("storeName storeSlug storeDescription status createdAt")
        .lean();
    }

    return successResponse(res, 200, "User fetched", {
      user,
      ...(seller && { seller }),
    });
  } catch (error) {
    next(error);
  }
};

export const updateUserStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    validateObjectId(id, "user ID");

    const { isBlocked } = req.body;
    if (typeof isBlocked !== "boolean") {
      return next(new ApiError(400, "isBlocked must be a boolean"));
    }

    // Prevent admin from blocking themselves
    if (id === req.user.id && isBlocked) {
      return next(new ApiError(400, "You cannot block your own account"));
    }

    const user = await User.findByIdAndUpdate(
      id,
      { isBlocked },
      { new: true, runValidators: true }
    ).select(SAFE_USER_FIELDS);

    if (!user) {
      return next(new ApiError(404, "User not found"));
    }

    return successResponse(
      res,
      200,
      `User ${isBlocked ? "blocked" : "unblocked"} successfully`,
      { user }
    );
  } catch (error) {
    next(error);
  }
};

export const updateUserRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    validateObjectId(id, "user ID");

    const { role } = req.body;
    if (!role || !["customer", "seller", "admin"].includes(role)) {
      return next(
        new ApiError(400, "Role must be one of: customer, seller, admin")
      );
    }

    // Prevent admin from demoting themselves
    if (id === req.user.id && role !== "admin") {
      // Check if this is the last admin
      const adminCount = await User.countDocuments({ role: "admin" });
      if (adminCount <= 1) {
        return next(
          new ApiError(
            400,
            "Cannot remove the last admin. Promote another user to admin first."
          )
        );
      }
    }

    const user = await User.findByIdAndUpdate(
      id,
      { role },
      { new: true, runValidators: true }
    ).select(SAFE_USER_FIELDS);

    if (!user) {
      return next(new ApiError(404, "User not found"));
    }

    return successResponse(res, 200, "User role updated", { user });
  } catch (error) {
    next(error);
  }
};

// ---------------------------------------------------------------------------
// SELLER MANAGEMENT
// ---------------------------------------------------------------------------

export const getSellers = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const skip = (page - 1) * limit;

    const filter = {};

    if (
      req.query.status &&
      ["pending", "approved", "rejected", "suspended"].includes(req.query.status)
    ) {
      filter.status = req.query.status;
    }

    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, "i");
      filter.$or = [{ storeName: searchRegex }, { storeSlug: searchRegex }];
    }

    const [sellers, total] = await Promise.all([
      Seller.find(filter)
        .populate("user", SAFE_USER_FIELDS)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Seller.countDocuments(filter),
    ]);

    return successResponse(res, 200, "Sellers fetched", { sellers }, {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    next(error);
  }
};

export const getSellerById = async (req, res, next) => {
  try {
    const { id } = req.params;
    validateObjectId(id, "seller ID");

    const seller = await Seller.findById(id)
      .populate("user", SAFE_USER_FIELDS)
      .lean();

    if (!seller) {
      return next(new ApiError(404, "Seller not found"));
    }

    // Include product count for this seller
    const productCount = await Product.countDocuments({ seller: id });

    return successResponse(res, 200, "Seller fetched", {
      seller,
      productCount,
    });
  } catch (error) {
    next(error);
  }
};

export const updateSellerStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    validateObjectId(id, "seller ID");

    const { status, rejectionReason } = req.body;
    if (
      !status ||
      !["pending", "approved", "rejected", "suspended"].includes(status)
    ) {
      return next(
        new ApiError(
          400,
          "Status must be one of: pending, approved, rejected, suspended"
        )
      );
    }

    const updateData = { 
      status,
      reviewedBy: req.user.id || req.user._id,
      reviewedAt: new Date()
    };
    
    if (status === "rejected" && rejectionReason !== undefined) {
      updateData.rejectionReason = rejectionReason;
    }

    const seller = await Seller.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate("user", SAFE_USER_FIELDS);

    if (!seller) {
      return next(new ApiError(404, "Seller not found"));
    }

    // If seller is approved, ensure user role is "seller"
    // If seller is suspended/rejected, optionally downgrade role to "customer"
    if (status === "approved" && seller.user) {
      await User.findByIdAndUpdate(seller.user._id, { role: "seller" });
    }

    return successResponse(res, 200, `Seller status updated to ${status}`, {
      seller,
    });
  } catch (error) {
    next(error);
  }
};

// ---------------------------------------------------------------------------
// PRODUCT MANAGEMENT
// ---------------------------------------------------------------------------

export const getProducts = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const skip = (page - 1) * limit;

    const filter = {};

    // Filter by seller
    if (req.query.seller) {
      if (mongoose.isValidObjectId(req.query.seller)) {
        filter.seller = req.query.seller;
      }
    }

    // Filter by category
    if (req.query.category) {
      if (mongoose.isValidObjectId(req.query.category)) {
        filter.categories = req.query.category;
      }
    }

    // Filter by active status
    if (req.query.status === "active") {
      filter.isActive = true;
    } else if (req.query.status === "inactive") {
      filter.isActive = false;
    }

    // Search
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, "i");
      filter.$or = [{ name: searchRegex }, { brand: searchRegex }];
    }

    const [products, total] = await Promise.all([
      Product.find(filter)
        .populate("seller", "storeName storeSlug")
        .populate("categories", "name slug")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Product.countDocuments(filter),
    ]);

    return successResponse(res, 200, "Products fetched", { products }, {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    next(error);
  }
};

export const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;
    validateObjectId(id, "product ID");

    const product = await Product.findById(id)
      .populate("seller", "storeName storeSlug status")
      .populate("categories", "name slug")
      .lean();

    if (!product) {
      return next(new ApiError(404, "Product not found"));
    }

    return successResponse(res, 200, "Product fetched", { product });
  } catch (error) {
    next(error);
  }
};

export const updateProductStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    validateObjectId(id, "product ID");

    const { isActive } = req.body;
    if (typeof isActive !== "boolean") {
      return next(new ApiError(400, "isActive must be a boolean"));
    }

    // Explicitly only update isActive — never change seller
    const product = await Product.findByIdAndUpdate(
      id,
      { isActive },
      { new: true, runValidators: true }
    )
      .populate("seller", "storeName storeSlug")
      .populate("categories", "name slug");

    if (!product) {
      return next(new ApiError(404, "Product not found"));
    }

    return successResponse(
      res,
      200,
      `Product ${isActive ? "activated" : "deactivated"}`,
      { product }
    );
  } catch (error) {
    next(error);
  }
};

export const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    validateObjectId(id, "product ID");

    const product = await Product.findByIdAndDelete(id);
    if (!product) {
      return next(new ApiError(404, "Product not found"));
    }

    return successResponse(res, 200, "Product deleted successfully");
  } catch (error) {
    next(error);
  }
};

// ---------------------------------------------------------------------------
// CATEGORY MANAGEMENT
// ---------------------------------------------------------------------------

const generateSlug = (name) =>
  name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

export const getCategories = async (req, res, next) => {
  try {
    // Admin sees ALL categories including inactive
    const categories = await Category.find()
      .select("-__v")
      .sort({ name: 1 })
      .lean();

    return successResponse(res, 200, "Categories fetched", { categories });
  } catch (error) {
    next(error);
  }
};

export const createCategory = async (req, res, next) => {
  try {
    const { name, description, image, parentCategory, isActive } = req.body;

    if (!name || !name.trim()) {
      return next(new ApiError(400, "Category name is required"));
    }

    const slug = req.body.slug || generateSlug(name);

    if (!slug) {
      return next(new ApiError(400, "Could not generate a valid slug"));
    }

    // Check slug uniqueness
    const existing = await Category.findOne({ slug });
    if (existing) {
      return next(new ApiError(409, "A category with that slug already exists"));
    }

    // Validate parent if provided
    if (parentCategory) {
      validateObjectId(parentCategory, "parent category ID");
      const parent = await Category.findById(parentCategory);
      if (!parent) {
        return next(new ApiError(404, "Parent category not found"));
      }
    }

    const category = await Category.create({
      name: name.trim(),
      slug,
      description: description || "",
      image: image || {},
      parentCategory: parentCategory || null,
      isActive: isActive !== undefined ? isActive : true,
    });

    const created = await Category.findById(category._id)
      .select("-__v")
      .lean();

    return successResponse(res, 201, "Category created", { category: created });
  } catch (error) {
    if (error.code === 11000) {
      return next(new ApiError(409, "A category with that slug already exists"));
    }
    next(error);
  }
};

export const updateCategoryAdmin = async (req, res, next) => {
  try {
    const { id } = req.params;
    validateObjectId(id, "category ID");

    const updates = {};
    const allowed = ["name", "slug", "description", "image", "parentCategory", "isActive"];

    for (const key of allowed) {
      if (req.body[key] !== undefined) {
        updates[key] = req.body[key];
      }
    }

    if (updates.name && !updates.slug) {
      updates.slug = generateSlug(updates.name);
    }

    // Check slug uniqueness if slug is being changed
    if (updates.slug) {
      const existing = await Category.findOne({
        slug: updates.slug,
        _id: { $ne: id },
      });
      if (existing) {
        return next(
          new ApiError(409, "A category with that slug already exists")
        );
      }
    }

    // Validate parent if provided
    if (updates.parentCategory) {
      validateObjectId(updates.parentCategory, "parent category ID");
      if (updates.parentCategory === id) {
        return next(new ApiError(400, "A category cannot be its own parent"));
      }
    }

    const category = await Category.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    )
      .select("-__v")
      .lean();

    if (!category) {
      return next(new ApiError(404, "Category not found"));
    }

    return successResponse(res, 200, "Category updated", { category });
  } catch (error) {
    if (error.code === 11000) {
      return next(new ApiError(409, "A category with that slug already exists"));
    }
    next(error);
  }
};

export const deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    validateObjectId(id, "category ID");

    const category = await Category.findById(id);
    if (!category) {
      return next(new ApiError(404, "Category not found"));
    }

    // Check if any products reference this category
    const productCount = await Product.countDocuments({ categories: id });
    if (productCount > 0) {
      return next(
        new ApiError(
          400,
          `Cannot delete: ${productCount} product(s) are using this category. Remove or reassign them first.`
        )
      );
    }

    // Check if any child categories reference this as parent
    const childCount = await Category.countDocuments({ parentCategory: id });
    if (childCount > 0) {
      return next(
        new ApiError(
          400,
          `Cannot delete: ${childCount} child category/categories reference this as parent.`
        )
      );
    }

    await category.deleteOne();

    return successResponse(res, 200, "Category deleted successfully");
  } catch (error) {
    next(error);
  }
};

// ---------------------------------------------------------------------------
// ORDER MANAGEMENT
// ---------------------------------------------------------------------------

export const getOrders = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const skip = (page - 1) * limit;

    const filter = {};

    if (
      req.query.status &&
      [
        "pending",
        "confirmed",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
      ].includes(req.query.status)
    ) {
      filter.orderStatus = req.query.status;
    }

    if (
      req.query.paymentStatus &&
      ["pending", "paid", "failed", "refunded"].includes(req.query.paymentStatus)
    ) {
      filter.paymentStatus = req.query.paymentStatus;
    }

    // Date range filter
    if (req.query.from || req.query.to) {
      filter.createdAt = {};
      if (req.query.from) {
        filter.createdAt.$gte = new Date(req.query.from);
      }
      if (req.query.to) {
        filter.createdAt.$lte = new Date(req.query.to);
      }
    }

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .populate("user", "name email username")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Order.countDocuments(filter),
    ]);

    return successResponse(res, 200, "Orders fetched", { orders }, {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    next(error);
  }
};

export const getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;
    validateObjectId(id, "order ID");

    // Admin sees the COMPLETE order (all items, all sellers)
    const order = await Order.findById(id)
      .populate("user", "name email username")
      .lean();

    if (!order) {
      return next(new ApiError(404, "Order not found"));
    }

    return successResponse(res, 200, "Order fetched", { order });
  } catch (error) {
    next(error);
  }
};

export const updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    validateObjectId(id, "order ID");

    const { orderStatus } = req.body;
    const validStatuses = [
      "pending",
      "confirmed",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
    ];

    if (!orderStatus || !validStatuses.includes(orderStatus)) {
      return next(
        new ApiError(
          400,
          `orderStatus must be one of: ${validStatuses.join(", ")}`
        )
      );
    }

    const order = await Order.findById(id);
    if (!order) {
      return next(new ApiError(404, "Order not found"));
    }

    // Prevent going backwards from delivered/cancelled
    if (order.orderStatus === "delivered") {
      return next(new ApiError(400, "Delivered orders cannot change status"));
    }
    if (order.orderStatus === "cancelled") {
      return next(new ApiError(400, "Cancelled orders cannot change status"));
    }

    // If cancelling, revert stock
    if (orderStatus === "cancelled" && order.orderStatus !== "cancelled") {
      for (const item of order.items) {
        const product = await Product.findById(item.product);
        if (product) {
          product.stock += item.quantity;
          await product.save();
        }
      }
    }

    order.orderStatus = orderStatus;

    // Also update all item statuses to match the global status
    for (const item of order.items) {
      item.itemStatus = orderStatus;
    }

    await order.save();

    return successResponse(res, 200, `Order status updated to ${orderStatus}`, {
      order,
    });
  } catch (error) {
    next(error);
  }
};

// ---------------------------------------------------------------------------
// REVIEW MODERATION
// ---------------------------------------------------------------------------

export const getReviews = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const skip = (page - 1) * limit;

    const filter = {};

    if (req.query.rating) {
      const rating = parseInt(req.query.rating, 10);
      if (rating >= 1 && rating <= 5) {
        filter.rating = rating;
      }
    }

    if (
      req.query.status &&
      ["published", "hidden", "flagged"].includes(req.query.status)
    ) {
      filter.status = req.query.status;
    }

    const [reviews, total] = await Promise.all([
      Review.find(filter)
        .populate("user", "name username")
        .populate("product", "name slug")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Review.countDocuments(filter),
    ]);

    return successResponse(res, 200, "Reviews fetched", { reviews }, {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    next(error);
  }
};

export const getReviewById = async (req, res, next) => {
  try {
    const { id } = req.params;
    validateObjectId(id, "review ID");

    const review = await Review.findById(id)
      .populate("user", "name username email")
      .populate("product", "name slug seller")
      .lean();

    if (!review) {
      return next(new ApiError(404, "Review not found"));
    }

    return successResponse(res, 200, "Review fetched", { review });
  } catch (error) {
    next(error);
  }
};

export const updateReviewStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    validateObjectId(id, "review ID");

    const { status } = req.body;
    if (!status || !["published", "hidden", "flagged"].includes(status)) {
      return next(
        new ApiError(400, "Status must be one of: published, hidden, flagged")
      );
    }

    const review = await Review.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    )
      .populate("user", "name username")
      .populate("product", "name slug");

    if (!review) {
      return next(new ApiError(404, "Review not found"));
    }

    return successResponse(res, 200, `Review status updated to ${status}`, {
      review,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteReviewAdmin = async (req, res, next) => {
  try {
    const { id } = req.params;
    validateObjectId(id, "review ID");

    const review = await Review.findById(id);
    if (!review) {
      return next(new ApiError(404, "Review not found"));
    }

    const productId = review.product;
    await review.deleteOne();

    // Recalculate product rating
    await updateProductRating(productId);

    return successResponse(res, 200, "Review deleted successfully");
  } catch (error) {
    next(error);
  }
};

// ---------------------------------------------------------------------------
// PLATFORM STATISTICS
// ---------------------------------------------------------------------------

export const getStatistics = async (req, res, next) => {
  try {
    // Top products by sales
    const topProducts = await Order.aggregate([
      { $match: { orderStatus: { $ne: "cancelled" } } },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.product",
          productName: { $first: "$items.name" },
          totalSold: { $sum: "$items.quantity" },
          totalRevenue: {
            $sum: { $multiply: ["$items.quantity", "$items.price"] },
          },
        },
      },
      { $sort: { totalSold: -1 } },
      { $limit: 10 },
    ]);

    // Top sellers by revenue
    const topSellers = await Order.aggregate([
      { $match: { orderStatus: { $ne: "cancelled" } } },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.seller",
          totalSold: { $sum: "$items.quantity" },
          totalRevenue: {
            $sum: { $multiply: ["$items.quantity", "$items.price"] },
          },
        },
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: "sellers",
          localField: "_id",
          foreignField: "_id",
          as: "seller",
        },
      },
      { $unwind: { path: "$seller", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 1,
          storeName: "$seller.storeName",
          totalSold: 1,
          totalRevenue: 1,
        },
      },
    ]);

    return successResponse(res, 200, "Statistics fetched", {
      topProducts,
      topSellers,
    });
  } catch (error) {
    next(error);
  }
};
