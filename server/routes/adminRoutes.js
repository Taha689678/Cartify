import express from "express";
import requireAuth from "../middleware/authMiddleware.js";
import requireRole from "../middleware/roleMiddleware.js";
import {
  getDashboard,
  getStatistics,
  getUsers,
  getUserById,
  updateUserStatus,
  updateUserRole,
  getSellers,
  getSellerById,
  updateSellerStatus,
  getProducts,
  getProductById,
  updateProductStatus,
  deleteProduct,
  getCategories,
  createCategory,
  updateCategoryAdmin,
  deleteCategory,
  getOrders,
  getOrderById,
  updateOrderStatus,
  getReviews,
  getReviewById,
  updateReviewStatus,
  deleteReviewAdmin,
} from "../controllers/adminController.js";

const router = express.Router();

// All admin routes require authentication + admin role
router.use(requireAuth, requireRole("admin"));

// Dashboard & Statistics
router.get("/dashboard", getDashboard);
router.get("/statistics", getStatistics);

// User Management
router.get("/users", getUsers);
router.get("/users/:id", getUserById);
router.patch("/users/:id/status", updateUserStatus);
router.patch("/users/:id/role", updateUserRole);

// Seller Management
router.get("/sellers", getSellers);
router.get("/sellers/:id", getSellerById);
router.patch("/sellers/:id/status", updateSellerStatus);

// Product Management
router.get("/products", getProducts);
router.get("/products/:id", getProductById);
router.patch("/products/:id/status", updateProductStatus);
router.delete("/products/:id", deleteProduct);

// Category Management
router.get("/categories", getCategories);
router.post("/categories", createCategory);
router.patch("/categories/:id", updateCategoryAdmin);
router.delete("/categories/:id", deleteCategory);

// Order Management
router.get("/orders", getOrders);
router.get("/orders/:id", getOrderById);
router.patch("/orders/:id/status", updateOrderStatus);

// Review Moderation
router.get("/reviews", getReviews);
router.get("/reviews/:id", getReviewById);
router.patch("/reviews/:id/status", updateReviewStatus);
router.delete("/reviews/:id", deleteReviewAdmin);

export default router;
