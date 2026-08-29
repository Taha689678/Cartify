import 'dotenv/config';
import mongoose from 'mongoose';
import request from 'supertest';
import app from './app.js';
import User from './models/User.js';
import Order from './models/Order.js';
import jwt from 'jsonwebtoken';

const genToken = (user) => jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected');

  const users = await User.find({}).limit(2);
  const user1 = users[0];
  const user2 = users[1];
  const token1 = genToken(user1);
  const token2 = user2 ? genToken(user2) : null;

  let passed = 0, total = 0;
  const assert = (cond, msg) => { total++; if (cond) { passed++; console.log('[PASS]', msg); } else console.error('[FAIL]', msg); };

  // Create a mock order for user1 directly in DB
  const mockOrder = new Order({
    user: user1._id,
    items: [{
      product: new mongoose.Types.ObjectId(),
      seller: new mongoose.Types.ObjectId(),
      name: "Test Product",
      quantity: 1,
      price: 100
    }],
    shippingAddress: {
      fullName: "Test",
      phone: "123",
      addressLine1: "123 Main St",
      city: "Test City"
    },
    subtotal: 100,
    shippingFee: 0,
    totalAmount: 100,
    paymentMethod: "cod",
    orderStatus: "pending",
    paymentStatus: "pending"
  });
  await mockOrder.save();

  // 1. Guest rejected
  let r = await request(app).get('/api/orders');
  assert(r.status === 401, 'Guest GET /api/orders -> 401');

  // 2. Auth user1 gets orders
  r = await request(app).get('/api/orders').set('Cookie', [`accessToken=${token1}`]);
  assert(r.status === 200, 'Auth GET /api/orders -> 200');
  assert(Array.isArray(r.body.data.orders), 'Returns orders array');
  assert(r.body.data.orders.some(o => o._id === mockOrder._id.toString()), 'User 1 sees their order');

  // 3. User2 cannot access user1's order
  r = await request(app).get(`/api/orders/${mockOrder._id}`).set('Cookie', [`accessToken=${token2}`]);
  assert(r.status === 404, 'User2 GET user1 order -> 404');

  // 4. Cancel unauthorized
  r = await request(app).patch(`/api/orders/${mockOrder._id}/cancel`).set('Cookie', [`accessToken=${token2}`]);
  assert(r.status === 404, 'User2 CANCEL user1 order -> 404');

  // 5. Cancel authorized
  r = await request(app).patch(`/api/orders/${mockOrder._id}/cancel`).set('Cookie', [`accessToken=${token1}`]);
  assert(r.status === 200, 'User1 CANCEL own order -> 200');
  assert(r.body.data.order.orderStatus === 'cancelled', 'Order status is cancelled');

  // 6. Cannot cancel already cancelled order
  r = await request(app).patch(`/api/orders/${mockOrder._id}/cancel`).set('Cookie', [`accessToken=${token1}`]);
  assert(r.status === 400, 'Cannot cancel again -> 400');

  // Cleanup
  await Order.findByIdAndDelete(mockOrder._id);

  console.log(`\nResults: ${passed}/${total} passed`);
  await mongoose.disconnect();
}
run().catch(console.error);
