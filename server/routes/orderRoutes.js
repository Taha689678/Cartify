import express from "express";
import requireAuth from "../middleware/authMiddleware.js";
import { createOrder, getOrderById, getOrders, cancelOrder } from "../controllers/orderController.js";

const router = express.Router();

router.post("/", requireAuth, createOrder);
router.get("/", requireAuth, getOrders);
router.get("/:id", requireAuth, getOrderById);
router.patch("/:id/cancel", requireAuth, cancelOrder);

export default router;
