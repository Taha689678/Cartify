import Payment from "../models/Payment.js";
import Order from "../models/Order.js";
import { initiatePayment, verifySignature } from "../services/payfastService.js";
import { successResponse, errorResponse } from "../utils/apiResponse.js";

export const initiatePayfastPayment = async (req, res, next) => {
  try {
    const { orderId } = req.body;
    if (!orderId) {
      return errorResponse(res, 400, "Order ID is required");
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return errorResponse(res, 404, "Order not found");
    }

    if (order.user.toString() !== req.user.id) {
      return errorResponse(res, 403, "Not authorized to access this order");
    }

    if (order.paymentStatus !== "pending") {
      return errorResponse(res, 400, "Payment for this order is not pending");
    }

    const payment = new Payment({
      order: order._id,
      user: req.user.id,
      provider: "payfast",
      paymentMethod: "easypaisa",
      amount: order.totalAmount,
      currency: "PKR",
      status: "pending",
    });
    
    await payment.save();

    const result = await initiatePayment(order, payment);
    
    return successResponse(res, 200, "Payment initiated", result);
  } catch (error) {
    next(error);
  }
};

export const payfastCallback = async (req, res, next) => {
  try {
    const payload = req.body;
    
    const isValid = verifySignature(payload);
    if (!isValid) {
      return res.status(400).json({ error: "Invalid signature" });
    }

    // Usually we find by providerReference, but we can also use orderId passed in webhook
    // Assuming the webhook returns our order ID as `order_id` in payload
    const orderId = payload.order_id || req.query.order_id;
    
    if (!orderId) {
      return res.status(400).json({ error: "Order ID missing" });
    }

    const payment = await Payment.findOne({ order: orderId }).sort({ createdAt: -1 });
    
    if (!payment) {
      return res.status(404).json({ error: "Payment not found" });
    }

    // Idempotency check
    if (payment.status === "paid") {
      return res.status(200).json({ success: true, message: "Already paid" });
    }

    payment.status = "paid";
    payment.paidAt = new Date();
    // In a real scenario, we'd also store the transaction reference ID
    if (payload.transaction_id) {
       payment.transactionId = payload.transaction_id;
       payment.providerReference = payload.transaction_id;
    }
    
    await payment.save();

    const order = await Order.findById(orderId);
    if (order) {
      order.paymentStatus = "paid";
      await order.save();
    }

    return res.status(200).json({ success: true, message: "Callback processed successfully" });
  } catch (error) {
    next(error);
  }
};

export const getPaymentByOrderId = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    
    const order = await Order.findById(orderId);
    if (!order) {
      return errorResponse(res, 404, "Order not found");
    }

    if (order.user.toString() !== req.user.id) {
      return errorResponse(res, 403, "Not authorized to access this order");
    }

    const payments = await Payment.find({ order: orderId }).sort({ createdAt: -1 });

    return successResponse(res, 200, "Payment retrieved successfully", { payments });
  } catch (error) {
    next(error);
  }
};
