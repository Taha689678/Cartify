import express from "express";
import {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart
} from "../controllers/cartController.js";
import requireAuth from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(requireAuth);

router.get("/", getCart);
router.post("/items", addToCart);
router.patch("/items/:productId", updateCartItem);
router.delete("/items/:productId", removeCartItem);
router.delete("/", clearCart);

export default router;
