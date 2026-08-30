import request from 'supertest';
import mongoose from 'mongoose';
import app from './app.js';
import User from './models/User.js';
import Order from './models/Order.js';
import Payment from './models/Payment.js';
import Product from './models/Product.js';
import Address from './models/Address.js';
import Cart from './models/Cart.js';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

dotenv.config();

let token1, token2;
let user1Id, user2Id;
let orderId, addressId, productId;

async function setup() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to DB');
  
  // Create test users
  const user1 = await User.create({
    username: `testuser1_${Date.now()}`,
    name: 'Test User 1',
    email: `test1_${Date.now()}@test.com`,
    password: 'password123',
    role: 'customer'
  });
  user1Id = user1._id;
  token1 = jwt.sign({ id: user1._id, role: user1.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

  const user2 = await User.create({
    username: `testuser2_${Date.now()}`,
    name: 'Test User 2',
    email: `test2_${Date.now()}@test.com`,
    password: 'password123',
    role: 'customer'
  });
  user2Id = user2._id;
  token2 = jwt.sign({ id: user2._id, role: user2.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

  // Create address for user 1
  const address = await Address.create({
    user: user1Id,
    fullName: 'Test User',
    phone: '1234567890',
    addressLine1: '123 Test St',
    city: 'Test City'
  });
  addressId = address._id;

  // Create product
  const product = await Product.create({
    seller: user1Id,
    name: 'Test Product',
    slug: 'test-product-' + Date.now(),
    description: 'A test product',
    price: 1000,
    stock: 10,
    categories: [new mongoose.Types.ObjectId()], // dummy category array
  });
  productId = product._id;

  // Create cart for user 1
  await Cart.create({
    user: user1Id,
    items: [{
      product: productId,
      quantity: 1,
      price: 1000
    }]
  });
}

async function cleanup() {
  await User.deleteMany({ _id: { $in: [user1Id, user2Id] } });
  await Address.deleteOne({ _id: addressId });
  await Product.deleteOne({ _id: productId });
  await Cart.deleteOne({ user: user1Id });
  await Order.deleteMany({ user: { $in: [user1Id, user2Id] } });
  await Payment.deleteMany({ user: { $in: [user1Id, user2Id] } });
  
  await mongoose.disconnect();
  console.log('Disconnected from DB');
}

async function runTests() {
  try {
    await setup();
    
    console.log('--- Test 1: COD payment creation during checkout ---');
    const resCreateOrder = await request(app)
      .post('/api/orders')
      .set('Cookie', [`accessToken=${token1}`])
      .send({
        addressId: addressId.toString(),
        paymentMethod: 'cod'
      });
      
    if (resCreateOrder.status !== 201) {
      console.error('Order creation failed:', resCreateOrder.body);
      throw new Error('Order creation failed');
    }
    orderId = resCreateOrder.body.data.order._id;
    console.log('Order created successfully.');
    
    const payment = await Payment.findOne({ order: orderId });
    if (!payment || payment.provider !== 'cod') {
      throw new Error('COD Payment record was not created properly.');
    }
    console.log('✓ COD Payment created correctly.');

    console.log('--- Test 2: /api/payments/payfast/initiate endpoint ---');
    // First, let's create a new order but pending (since COD gets created with COD payment)
    // Wait, the createOrder endpoint creates COD payment. What if we want online?
    
    // Update cart for user 1
    await Cart.findOneAndUpdate({ user: user1Id }, {
      $push: {
        items: {
          product: productId,
          quantity: 1,
          price: 1000
        }
      }
    });
    
    const resCreateOrder2 = await request(app)
      .post('/api/orders')
      .set('Cookie', [`accessToken=${token1}`])
      .send({
        addressId: addressId.toString(),
        paymentMethod: 'online'
      });
      
    const onlineOrderId = resCreateOrder2.body.data.order._id;
    
    const resInitiate = await request(app)
      .post('/api/payments/payfast/initiate')
      .set('Cookie', [`accessToken=${token1}`])
      .send({ orderId: onlineOrderId });
      
    if (resInitiate.status !== 200) {
      console.error('Initiate payment failed:', resInitiate.body);
      throw new Error('Initiate payment failed');
    }
    console.log('✓ Payfast initiate endpoint successful:', resInitiate.body.data.checkoutUrl);
    
    // Check if Payment is created
    const onlinePayment = await Payment.findOne({ order: onlineOrderId, provider: 'payfast' });
    if (!onlinePayment) {
      throw new Error('Payfast Payment record not created');
    }
    console.log('✓ Payfast Payment record created in pending state');

    console.log('--- Test 3: Verify Proper Security (IDOR) ---');
    const resIdor = await request(app)
      .post('/api/payments/payfast/initiate')
      .set('Cookie', [`accessToken=${token2}`])
      .send({ orderId: onlineOrderId });
      
    if (resIdor.status !== 403) {
      console.error('IDOR check failed, expected 403, got:', resIdor.status);
      throw new Error('IDOR check failed');
    }
    console.log('✓ IDOR check passed (user 2 cannot initiate payment for user 1\'s order).');
    
    console.log('--- Test 4: Webhook Callback ---');
    const resCallback = await request(app)
      .post('/api/payments/payfast/callback')
      .send({
        order_id: onlineOrderId,
        transaction_id: 'txn_123456'
      });
      
    if (resCallback.status !== 200) {
      console.error('Callback failed:', resCallback.body);
      throw new Error('Callback failed');
    }
    console.log('✓ Webhook callback processed.');
    
    const updatedPayment = await Payment.findById(onlinePayment._id);
    if (updatedPayment.status !== 'paid') {
      throw new Error('Payment status was not updated to paid');
    }
    console.log('✓ Payment status updated to paid successfully.');
    
    console.log('\nAll tests passed successfully! 🎉');
  } catch (error) {
    console.error('\nTest execution failed:', error.message);
    process.exitCode = 1;
  } finally {
    await cleanup();
  }
}

runTests();
