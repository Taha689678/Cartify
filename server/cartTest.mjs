import 'dotenv/config';
import mongoose from 'mongoose';
import app from './app.js';
import request from 'supertest';
import User from './models/User.js';
import Product from './models/Product.js';
import Cart from './models/Cart.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "1d" });

async function runTests() {
  await mongoose.connect(process.env.MONGODB_URI);
  
  // Cleanup cart
  await Cart.deleteMany({});
  
  // Create user
  let user = await User.findOne({ email: "carttest@test.com" });
  if (!user) {
    user = await User.create({ name: "CartTest", username: "carttest", email: "carttest@test.com", password: await bcrypt.hash("Password123!", 10), isVerified: true });
  }
  
  let product = await Product.findOne({});
  
  const token = generateToken(user._id);
  
  console.log("1. Get empty cart");
  let res = await request(app).get('/api/cart').set('Authorization', `Bearer ${token}`);
  console.log(res.status, res.body.data.cart.items.length);
  
  console.log("2. Add to cart");
  res = await request(app).post('/api/cart/items').set('Authorization', `Bearer ${token}`).send({ productId: product._id, quantity: 2 });
  console.log(res.status, res.body.data.cart.items.length, res.body.data.cart.items[0].quantity);
  
  console.log("3. Add same product again");
  res = await request(app).post('/api/cart/items').set('Authorization', `Bearer ${token}`).send({ productId: product._id, quantity: 1 });
  console.log(res.status, res.body.data.cart.items[0].quantity); // should be 3
  
  console.log("4. Update quantity");
  res = await request(app).patch(`/api/cart/items/${product._id}`).set('Authorization', `Bearer ${token}`).send({ quantity: 5 });
  console.log(res.status, res.body.data.cart.items[0].quantity); // should be 5
  
  console.log("5. Remove item");
  res = await request(app).delete(`/api/cart/items/${product._id}`).set('Authorization', `Bearer ${token}`);
  console.log(res.status, res.body.data.cart.items.length); // should be 0
  
  console.log("6. Add again and Clear");
  await request(app).post('/api/cart/items').set('Authorization', `Bearer ${token}`).send({ productId: product._id, quantity: 1 });
  res = await request(app).delete('/api/cart').set('Authorization', `Bearer ${token}`);
  console.log(res.status, res.body.data.cart.items.length); // should be 0
  
  await mongoose.disconnect();
}
runTests().catch(console.error);
