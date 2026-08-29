import mongoose from "mongoose";
import request from "supertest";
import app from "./app.js";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";

// Models
import User from "./models/User.js";
import Seller from "./models/Seller.js";
import Category from "./models/Category.js";
import Product from "./models/Product.js";
import Cart from "./models/Cart.js";
import Address from "./models/Address.js";
import Order from "./models/Order.js";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

const runTests = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB for testing");

    // Clean up
    await Order.deleteMany({ "shippingAddress.fullName": "Test User" });
    await Cart.deleteMany({ user: { $exists: true } }); // just clear all for safety, but better to clear for our user
    
    // Create test user
    let user = await User.findOne({ email: "testcheckout@example.com" });
    if (!user) {
      user = new User({
        name: "Test User",
        username: "testcheckout",
        email: "testcheckout@example.com",
        password: "password123",
      });
      await user.save();
    }
    
    // Generate token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Ensure cart exists
    let cart = await Cart.findOne({ user: user._id });
    if (!cart) {
      cart = new Cart({ user: user._id, items: [] });
      await cart.save();
    } else {
      cart.items = [];
      await cart.save();
    }

    // Create test seller user and seller profile
    let sellerUser = await User.findOne({ email: "testseller@example.com" });
    if (!sellerUser) {
      sellerUser = new User({
        name: "Test Seller User",
        username: "testseller",
        email: "testseller@example.com",
        password: "password123",
        role: "seller"
      });
      await sellerUser.save();
    }

    let seller = await Seller.findOne({ user: sellerUser._id });
    if (!seller) {
      seller = new Seller({
        user: sellerUser._id,
        storeName: "Test Store",
        storeSlug: "test-store-123",
      });
      await seller.save();
    }

    // Create category
    let category = await Category.findOne({ slug: "test-category" });
    if (!category) {
      category = new Category({
        name: "Test Category",
        slug: "test-category",
      });
      await category.save();
    }

    // Create product
    let product = await Product.findOne({ slug: "test-product-123" });
    if (!product) {
      product = new Product({
        name: "Test Product",
        slug: "test-product-123",
        description: "Test description",
        seller: seller._id,
        categories: [category._id],
        price: 100,
        stock: 10,
        isActive: true,
      });
      await product.save();
    } else {
      product.stock = 10; // reset stock
      await product.save();
    }

    // Create Address
    let address = await Address.findOne({ user: user._id, addressLine1: "123 Test St" });
    if (!address) {
      address = new Address({
        user: user._id,
        fullName: "Test User",
        phone: "1234567890",
        addressLine1: "123 Test St",
        city: "Test City",
        country: "Pakistan",
      });
      await address.save();
    }

    // 1. Guest request denied
    console.log("Testing guest request...");
    let res = await request(app).post("/api/orders").send({ addressId: address._id });
    if (res.status !== 401) throw new Error(`Expected 401, got ${res.status}`);
    console.log("Guest request correctly denied");

    // 2. Empty cart request denied
    console.log("Testing empty cart...");
    res = await request(app)
      .post("/api/orders")
      .set("Cookie", [`accessToken=${token}`])
      .send({ addressId: address._id });
    if (res.status !== 400) throw new Error(`Expected 400, got ${res.status}`);
    console.log("Empty cart request correctly denied");

    // 3. Add to cart and valid checkout
    console.log("Testing valid checkout...");
    cart.items.push({ product: product._id, quantity: 2, price: 100 });
    await cart.save();

    res = await request(app)
      .post("/api/orders")
      .set("Cookie", [`accessToken=${token}`])
      .send({ addressId: address._id, paymentMethod: "cod" });
    
    if (res.status !== 201) throw new Error(`Expected 201, got ${res.status}, body: ${JSON.stringify(res.body)}`);
    console.log("Valid checkout succeeded");

    const orderId = res.body.order._id;
    if (res.body.order.subtotal !== 200) throw new Error("Subtotal should be 200");
    if (res.body.order.items.length !== 1) throw new Error("Order items count mismatch");

    // Check stock
    const updatedProduct = await Product.findById(product._id);
    if (updatedProduct.stock !== 8) throw new Error(`Stock should be 8, got ${updatedProduct.stock}`);
    console.log("Stock deducted correctly");

    // Check cart empty
    const updatedCart = await Cart.findById(cart._id);
    if (updatedCart.items.length !== 0) throw new Error("Cart should be empty");
    console.log("Cart cleared correctly");

    // 4. Test getOrderById
    console.log("Testing getOrderById...");
    res = await request(app)
      .get(`/api/orders/${orderId}`)
      .set("Cookie", [`accessToken=${token}`]);
    
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    if (res.body.order._id !== orderId) throw new Error("Order ID mismatch");
    console.log("getOrderById succeeded");

    console.log("ALL TESTS PASSED");
  } catch (error) {
    console.error("Test failed:", error);
  } finally {
    await mongoose.disconnect();
  }
};

runTests();
