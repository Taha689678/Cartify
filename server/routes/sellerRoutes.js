import express from "express";
import {
  getProducts,
  createProduct,
  getProduct,
  updateProduct,
  deleteProduct,
  updateProductStatus,
  updateProductStock,
  getOrders,
  getOrderById,
  updateOrderItemStatus,
  getDashboard
} from "../controllers/sellerController.js";
import requireAuth from "../middleware/authMiddleware.js";
import { requireSeller } from "../middleware/sellerMiddleware.js";

const router = express.Router();

router.use(requireAuth);
router.use(requireSeller);

// Dashboard
router.get("/dashboard", getDashboard);

// Products
router.route("/products")
  .get(getProducts)
  .post(createProduct);

router.route("/products/:id")
  .get(getProduct)
  .patch(updateProduct)
  .delete(deleteProduct);

router.patch("/products/:id/status", updateProductStatus);
router.patch("/products/:id/stock", updateProductStock);

// Orders
router.route("/orders")
  .get(getOrders);

router.route("/orders/:id")
  .get(getOrderById);

router.patch("/orders/:id/status", updateOrderItemStatus);

export default router;
