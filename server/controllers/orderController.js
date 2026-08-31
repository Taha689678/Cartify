import Order from "../models/Order.js";
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import Address from "../models/Address.js";
import Payment from "../models/Payment.js";
import mongoose from "mongoose";
import { successResponse, errorResponse } from "../utils/apiResponse.js";

export const getOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });
    return successResponse(res, 200, "Orders retrieved successfully", { orders });
  } catch (error) {
    next(error);
  }
};

export const createOrder = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    let { addressId, paymentMethod, idempotencyKey } = req.body;
    
    // Generate idempotency key if not provided
    if (!idempotencyKey) {
      idempotencyKey = `${req.user.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    // Check if an order with this idempotencyKey already exists for this user
    const existingOrder = await Order.findOne({ 
      user: req.user.id, 
      idempotencyKey 
    }).session(session);
    
    if (existingOrder) {
      await session.abortTransaction();
      session.endSession();
      return successResponse(res, 200, "Order created successfully", { order: existingOrder });
    }

    if (!paymentMethod) {
      paymentMethod = "cod";
    }

    if (!["cod", "card", "online"].includes(paymentMethod)) {
      await session.abortTransaction();
      session.endSession();
      return errorResponse(res, 400, "Invalid payment method");
    }

    if (!addressId) {
      await session.abortTransaction();
      session.endSession();
      return errorResponse(res, 400, "Address ID is required");
    }

    const address = await Address.findById(addressId).session(session);
    if (!address || address.user.toString() !== req.user.id) {
      await session.abortTransaction();
      session.endSession();
      return errorResponse(res, 400, "Invalid address");
    }

    // Lock the cart to prevent concurrent checkouts
    // Use findOneAndUpdate to atomically lock the cart
    const cart = await Cart.findOneAndUpdate(
      { 
        user: req.user.id,
        $or: [
          { processingBy: null },
          { processingBy: idempotencyKey },
          // Allow retry if lock is older than 30 seconds (failed request recovery)
          { processStartedAt: { $lt: new Date(Date.now() - 30000) } }
        ]
      },
      { 
        processingBy: idempotencyKey,
        processStartedAt: new Date()
      },
      { new: true, session }
    );

    if (!cart) {
      await session.abortTransaction();
      session.endSession();
      return errorResponse(res, 409, "Checkout already in progress. Please wait.");
    }

    if (!cart.items || cart.items.length === 0) {
      // Unlock the cart
      await Cart.updateOne(
        { user: req.user.id },
        { processingBy: null, processStartedAt: null },
        { session }
      );
      await session.abortTransaction();
      session.endSession();
      return errorResponse(res, 400, "Cart is empty");
    }

    const orderItems = [];
    let subtotal = 0;

    for (const item of cart.items) {
      const product = await Product.findById(item.product).session(session);
      if (!product) {
        // Unlock cart
        await Cart.updateOne(
          { user: req.user.id },
          { processingBy: null, processStartedAt: null },
          { session }
        );
        await session.abortTransaction();
        session.endSession();
        return errorResponse(res, 400, `Product ${item.product} not found`);
      }

      if (!product.isActive) {
        // Unlock cart
        await Cart.updateOne(
          { user: req.user.id },
          { processingBy: null, processStartedAt: null },
          { session }
        );
        await session.abortTransaction();
        session.endSession();
        return errorResponse(res, 400, `Product ${product.name} is not active`);
      }

      if (product.stock < item.quantity) {
        // Unlock cart
        await Cart.updateOne(
          { user: req.user.id },
          { processingBy: null, processStartedAt: null },
          { session }
        );
        await session.abortTransaction();
        session.endSession();
        return errorResponse(res, 400, `Insufficient stock for ${product.name}`);
      }

      const itemPrice = product.price;
      subtotal += itemPrice * item.quantity;

      orderItems.push({
        product: product._id,
        seller: product.seller,
        name: product.name,
        image: product.images && product.images.length > 0 ? product.images[0].url : "",
        sku: product.sku || "",
        quantity: item.quantity,
        price: itemPrice
      });
    }

    // Deduct stock atomically within transaction
    for (const item of orderItems) {
      const updatedProduct = await Product.findOneAndUpdate(
        { _id: item.product, stock: { $gte: item.quantity } },
        { $inc: { stock: -item.quantity } },
        { new: true, session }
      );

      if (!updatedProduct) {
        // Unlock cart on failure
        await Cart.updateOne(
          { user: req.user.id },
          { processingBy: null, processStartedAt: null },
          { session }
        );
        await session.abortTransaction();
        session.endSession();
        return errorResponse(res, 400, `Insufficient stock for ${item.name} due to a concurrent checkout.`);
      }
    }

    // Snapshot address
    const shippingAddress = {
      fullName: address.fullName,
      phone: address.phone,
      addressLine1: address.addressLine1,
      addressLine2: address.addressLine2,
      city: address.city,
      state: address.state,
      postalCode: address.postalCode,
      country: address.country
    };

    const shippingFee = 0;
    const totalAmount = subtotal + shippingFee;

    // Create order with idempotency key
    const order = new Order({
      user: req.user.id,
      idempotencyKey,
      items: orderItems,
      shippingAddress,
      subtotal,
      shippingFee,
      totalAmount,
      paymentMethod,
      paymentStatus: "pending",
      orderStatus: "pending"
    });

    await order.save({ session });

    // Create payment record for non-card methods
    if (paymentMethod === "cod") {
      const payment = new Payment({
        order: order._id,
        user: req.user.id,
        provider: "cod",
        paymentMethod: "cod",
        amount: totalAmount,
        currency: "PKR",
        status: "pending",
      });
      await payment.save({ session });
    }

    // Clear cart items and unlock
    await Cart.updateOne(
      { user: req.user.id },
      { 
        items: [],
        processingBy: null,
        processStartedAt: null
      },
      { session }
    );

    // Commit transaction
    await session.commitTransaction();
    session.endSession();

    return successResponse(res, 201, "Order created successfully", { order });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    next(error);
  }
};

export const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.user.id });
    if (!order) {
      return errorResponse(res, 404, "Order not found");
    }
    return successResponse(res, 200, "Order retrieved successfully", { order });
  } catch (error) {
    next(error);
  }
};

export const cancelOrder = async (req, res, next) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.user.id });
    if (!order) {
      return errorResponse(res, 404, "Order not found");
    }
    if (order.orderStatus !== "pending") {
      return errorResponse(res, 400, "Order cannot be cancelled at this stage");
    }
    
    order.orderStatus = "cancelled";
    await order.save();

    // Revert stock
    for (const item of order.items) {
      const product = await Product.findById(item.product);
      if (product) {
        product.stock += item.quantity;
        await product.save();
      }
    }

    return successResponse(res, 200, "Order cancelled successfully", { order });
  } catch (error) {
    next(error);
  }
};
export const trackOrder = async (req, res, next) => {
  try {
    const { orderId } = req.body;
    if (!orderId) {
      return errorResponse(res, 400, "Order ID is required");
    }
    
    // Using findById but need to handle invalid ID format gracefully
    let order;
    try {
      order = await Order.findById(orderId).populate('items.product', 'name image slug');
    } catch (e) {
      return errorResponse(res, 404, "Invalid Order ID format");
    }

    if (!order) {
      return errorResponse(res, 404, "Order not found");
    }

    // Return safe data without exposing user details if guest
    const trackingData = {
      _id: order._id,
      orderStatus: order.orderStatus,
      paymentStatus: order.paymentStatus,
      totalAmount: order.totalAmount,
      createdAt: order.createdAt,
      items: order.items.map(item => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        itemStatus: item.itemStatus,
        image: item.image
      }))
    };

    return successResponse(res, 200, "Order tracking info retrieved", { order: trackingData });
  } catch (error) {
    next(error);
  }
};
