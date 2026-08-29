import Order from "../models/Order.js";
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import Address from "../models/Address.js";

export const createOrder = async (req, res, next) => {
  try {
    let { addressId, paymentMethod } = req.body;
    if (!paymentMethod) {
      paymentMethod = "cod";
    }

    if (!["cod", "card", "online"].includes(paymentMethod)) {
      return res.status(400).json({ success: false, message: "Invalid payment method" });
    }

    if (!addressId) {
      return res.status(400).json({ success: false, message: "Address ID is required" });
    }

    const address = await Address.findById(addressId);
    if (!address || address.user.toString() !== req.user.id) {
      return res.status(400).json({ success: false, message: "Invalid address" });
    }

    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ success: false, message: "Cart is empty" });
    }

    const orderItems = [];
    let subtotal = 0;

    for (const item of cart.items) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(400).json({ success: false, message: `Product ${item.product} not found` });
      }

      if (!product.isActive) {
        return res.status(400).json({ success: false, message: `Product ${product.name} is not active` });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({ success: false, message: `Insufficient stock for ${product.name}` });
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

    cart.items = [];
    await cart.save();

    return res.status(201).json({ success: true, order });
  } catch (error) {
    next(error);
  }
};

export const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.user.id });
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }
    return res.status(200).json({ success: true, order });
  } catch (error) {
    next(error);
  }
};
