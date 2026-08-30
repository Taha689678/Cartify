import express from "express";
import {
  initiatePayfastPayment,
  payfastCallback,
  getPaymentByOrderId
} from "../controllers/paymentController.js";
import requireAuth from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/payfast/initiate", requireAuth, initiatePayfastPayment);
router.post("/payfast/callback", payfastCallback);
router.get("/order/:orderId", requireAuth, getPaymentByOrderId);

export default router;
