import Order from "../models/Order.js";
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import Address from "../models/Address.js";
import Payment from "../models/Payment.js";
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
  try {
    let { addressId, paymentMethod } = req.body;
    if (!paymentMethod) {
      paymentMethod = "cod";
    }

    if (!["cod", "card", "online"].includes(paymentMethod)) {
      return errorResponse(res, 400, "Invalid payment method");
    }

    if (!addressId) {
      return errorResponse(res, 400, "Address ID is required");
    }

    const address = await Address.findById(addressId);
    if (!address || address.user.toString() !== req.user.id) {
      return errorResponse(res, 400, "Invalid address");
    }

    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart || cart.items.length === 0) {
      return errorResponse(res, 400, "Cart is empty");
    }

    const orderItems = [];
    let subtotal = 0;

    for (const item of cart.items) {
      const product = await Product.findById(item.product);
      if (!product) {
        return errorResponse(res, 400, `Product ${item.product} not found`);
      }

      if (!product.isActive) {
        return errorResponse(res, 400, `Product ${product.name} is not active`);
      }

      if (product.stock < item.quantity) {
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

    // Deduct stock
    for (const item of orderItems) {
      const product = await Product.findById(item.product);
      product.stock -= item.quantity;
      await product.save();
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

    const order = new Order({
      user: req.user.id,
      items: orderItems,
      shippingAddress,
      subtotal,
      shippingFee,
      totalAmount,
      paymentMethod,
      paymentStatus: "pending",
      orderStatus: "pending"
    });

    await order.save();

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
      await payment.save();
    }

    cart.items = [];
    await cart.save();

    return successResponse(res, 201, "Order created successfully", { order });
  } catch (error) {
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
