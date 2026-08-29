import "dotenv/config";
import mongoose from "mongoose";
import request from "supertest";
import app from "./app.js";
import User from "./models/User.js";
import Product from "./models/Product.js";
import Wishlist from "./models/Wishlist.js";
import jwt from "jsonwebtoken";

const generateToken = (user) => jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1d" });

async function runTests() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("MongoDB connected.");

  const user = await User.findOne({});
  const product = await Product.findOne({});

  if (!user || !product) {
    console.error("No user or product found in DB for testing.");
    await mongoose.disconnect();
    return;
  }

  const token = generateToken(user);
  
  await Wishlist.deleteMany({ user: user._id });

  let testsPassed = 0;
  let testsTotal = 0;

  const assert = (condition, message) => {
    testsTotal++;
    if (condition) {
      testsPassed++;
      console.log(`[PASS] ${message}`);
    } else {
      console.error(`[FAIL] ${message}`);
    }
  };

  let res = await request(app).get("/api/wishlist");
  assert(res.status === 401, "Guest GET wishlist rejected (401)");

  res = await request(app).post("/api/wishlist/items").send({ productId: product._id });
  assert(res.status === 401, "Guest POST wishlist rejected (401)");

  res = await request(app).delete(`/api/wishlist/items/${product._id}`);
  assert(res.status === 401, "Guest DELETE wishlist item rejected (401)");

  res = await request(app).get("/api/wishlist").set("Cookie", [`accessToken=${token}`]);
  assert(res.status === 200, "Authenticated GET wishlist works (200)");
  assert(res.body.data.wishlist.items.length === 0, "Wishlist is initially empty");

  res = await request(app).post("/api/wishlist/items").set("Cookie", [`accessToken=${token}`]).send({ productId: product._id });
  assert(res.status === 201, "Add valid active product works (201)");
  assert(res.body.data.wishlist.items.length === 1, "Product added successfully");

  res = await request(app).post("/api/wishlist/items").set("Cookie", [`accessToken=${token}`]).send({ productId: product._id });
  assert(res.status === 400, "Add same product twice rejected (400)");

  res = await request(app).post("/api/wishlist/items").set("Cookie", [`accessToken=${token}`]).send({ productId: "invalidId" });
  assert(res.status === 500 || res.status === 400, "Invalid productId rejected"); 

  const fakeId = new mongoose.Types.ObjectId();
  res = await request(app).post("/api/wishlist/items").set("Cookie", [`accessToken=${token}`]).send({ productId: fakeId });
  assert(res.status === 404, "Nonexistent product rejected (404)");

  res = await request(app).delete(`/api/wishlist/items/${product._id}`).set("Cookie", [`accessToken=${token}`]);
  assert(res.status === 200, "Remove existing product works (200)");
  assert(res.body.data.wishlist.items.length === 0, "Item removed successfully");

  await request(app).post("/api/wishlist/items").set("Cookie", [`accessToken=${token}`]).send({ productId: product._id });
  res = await request(app).delete("/api/wishlist").set("Cookie", [`accessToken=${token}`]);
  assert(res.status === 200, "Clear wishlist works (200)");
  assert(res.body.data.wishlist.items.length === 0, "Wishlist fully cleared");

  console.log(`\nTests passed: ${testsPassed}/${testsTotal}`);

  await mongoose.disconnect();
}

runTests().catch(err => console.error(err));
