import 'dotenv/config';
import mongoose from 'mongoose';
import request from 'supertest';
import app from './app.js';
import User from './models/User.js';
import Seller from './models/Seller.js';
import Product from './models/Product.js';
import Order from './models/Order.js';
import Category from './models/Category.js';
import jwt from 'jsonwebtoken';
import assert from 'assert';

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);

  // Clear previous test data
  await User.deleteMany({ email: /@test\.com$/ });
  await Seller.deleteMany({ storeName: /Test Store/ });
  await Product.deleteMany({ name: /Test Product/ });
  // Just delete orders involving test users later

  // 1. Setup mock users
  const customer = await User.create({
    name: 'Customer Test',
    email: 'customer@test.com',
    username: 'customertest',
    password: 'Password123!',
    role: 'customer'
  });
  
  const sellerUser1 = await User.create({
    name: 'Seller 1',
    email: 'seller1@test.com',
    username: 'seller1',
    password: 'Password123!',
    role: 'seller'
  });
  const seller1 = await Seller.create({
    user: sellerUser1._id,
    storeName: 'Test Store 1',
    storeSlug: 'test-store-1',
    description: 'Desc',
    status: 'approved'
  });

  const sellerUser2 = await User.create({
    name: 'Seller 2',
    email: 'seller2@test.com',
    username: 'seller2',
    password: 'Password123!',
    role: 'seller'
  });
  const seller2 = await Seller.create({
    user: sellerUser2._id,
    storeName: 'Test Store 2',
    storeSlug: 'test-store-2',
    description: 'Desc 2',
    status: 'approved'
  });

  const category = await Category.findOne() || await Category.create({ name: 'TestCat', slug: 'test-cat' });

  const getCookie = (user) => {
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
    return [`accessToken=${token}`];
  };

  const guestRes = await request(app).get('/api/seller/dashboard');
  assert.strictEqual(guestRes.status, 401, 'Guest should get 401');

  const customerRes = await request(app).get('/api/seller/dashboard').set('Cookie', getCookie(customer));
  assert.strictEqual(customerRes.status, 403, 'Customer should get 403');

  // 2. Seller can create product
  const createProdRes = await request(app)
    .post('/api/seller/products')
    .set('Cookie', getCookie(sellerUser1))
    .send({
      name: 'Test Product 1',
      slug: 'test-product-1',
      description: 'Desc',
      price: 100,
      categories: [category._id.toString()]
    });
  assert.strictEqual(createProdRes.status, 201, `Failed to create product: ${JSON.stringify(createProdRes.body)}`);
  const prod1Id = createProdRes.body.data._id;

  const createProd2Res = await request(app)
    .post('/api/seller/products')
    .set('Cookie', getCookie(sellerUser2))
    .send({
      name: 'Test Product 2',
      slug: 'test-product-2',
      description: 'Desc',
      price: 200,
      categories: [category._id.toString()]
    });
  assert.strictEqual(createProd2Res.status, 201, `Failed to create product 2: ${JSON.stringify(createProd2Res.body)}`);
  const prod2Id = createProd2Res.body.data._id;

  // 3. IDOR: Seller cannot edit other seller's product
  const editProdRes = await request(app)
    .patch(`/api/seller/products/${prod2Id}`)
    .set('Cookie', getCookie(sellerUser1))
    .send({ price: 999 });
  assert.strictEqual(editProdRes.status, 404, 'IDOR: Seller 1 should not be able to edit Seller 2 product');

  // 4. Seller orders fetch ONLY returns their items
  const order = await Order.create({
    user: customer._id,
    shippingAddress: {
      fullName: 'Customer',
      phone: '1234567890',
      addressLine1: 'Test St',
      city: 'Test City',
    },
    subtotal: 300,
    totalAmount: 300,
    paymentMethod: 'cod',
    items: [
      {
        product: prod1Id,
        seller: seller1._id,
        name: 'Test Product 1',
        quantity: 1,
        price: 100
      },
      {
        product: prod2Id,
        seller: seller2._id,
        name: 'Test Product 2',
        quantity: 1,
        price: 200
      }
    ]
  });

  const getOrdersRes = await request(app)
    .get('/api/seller/orders')
    .set('Cookie', getCookie(sellerUser1));
  assert.strictEqual(getOrdersRes.status, 200);
  assert.strictEqual(getOrdersRes.body.data.length, 1);
  assert.strictEqual(getOrdersRes.body.data[0].items.length, 1);
  assert.strictEqual(getOrdersRes.body.data[0].items[0].product.toString(), prod1Id);

  // 5. Seller order status update modifies itemStatus correctly
  const updateStatusRes = await request(app)
    .patch(`/api/seller/orders/${order._id}/status`)
    .set('Cookie', getCookie(sellerUser1))
    .send({ itemId: order.items[0]._id, status: 'processing' });
  assert.strictEqual(updateStatusRes.status, 200);
  assert.strictEqual(updateStatusRes.body.data.items[0].itemStatus, 'processing');

  const updatedOrder = await Order.findById(order._id);
  assert.strictEqual(updatedOrder.items[0].itemStatus, 'processing');
  assert.strictEqual(updatedOrder.items[1].itemStatus, 'pending'); // Seller 2's item should remain pending
  
  await Order.findByIdAndDelete(order._id);
  console.log("All tests passed");

  await mongoose.disconnect();
}

run().catch(async (e) => {
  console.error(e);
  await mongoose.disconnect();
  process.exit(1);
});
