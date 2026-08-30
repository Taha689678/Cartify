import express from "express";
import {
  checkEligibility,
  createReview,
  getProductReviews,
  updateReview,
  deleteReview,
} from "../controllers/reviewController.js";
import requireAuth from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/check-eligibility/:productId", requireAuth, checkEligibility);
router.post("/", requireAuth, createReview);
router.get("/product/:productId", getProductReviews);
router.patch("/:id", requireAuth, updateReview);
router.delete("/:id", requireAuth, deleteReview);

export default router;
