import express from "express";
import requireAuth from "../middleware/authMiddleware.js";
import { createOrder, getOrderById } from "../controllers/orderController.js";

const router = express.Router();

router.post("/", requireAuth, createOrder);
router.get("/:id", requireAuth, getOrderById);

export default router;
