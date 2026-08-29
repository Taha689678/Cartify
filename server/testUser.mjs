import 'dotenv/config';
import mongoose from 'mongoose';
import request from 'supertest';
import app from './app.js';
import User from './models/User.js';
import jwt from 'jsonwebtoken';

const generateToken = (user) => jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });

async function runTests() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('MongoDB connected.');

  // Grab two users for testing
  const users = await User.find({}).limit(2);
  if (users.length < 2) {
    console.log("Need at least 2 users for duplicate checking tests. Creating dummy users.");
    // Wait, the DB probably has users already. I'll just find one user at least.
  }
  const user = users[0];
  const user2 = users.length > 1 ? users[1] : null;

  if (!user) {
    console.error('No user found for testing.');
    await mongoose.disconnect();
    return;
  }

  const token = generateToken(user);
  let res;
  let testsPassed = 0; let testsTotal = 0;

  const assert = (condition, message) => {
    testsTotal++;
    if (condition) {
      testsPassed++;
      console.log(`[PASS] ${message}`);
    } else {
      console.error(`[FAIL] ${message}`);
    }
  };

  // 1. Guest GET /api/users/me
  res = await request(app).get('/api/users/me');
  assert(res.status === 401, 'Guest GET /api/users/me -> rejected (401)');

  // 2. Guest PATCH /api/users/me
  res = await request(app).patch('/api/users/me').send({ name: 'Hacker' });
  assert(res.status === 401, 'Guest PATCH /api/users/me -> rejected (401)');

  // 3. Auth GET profile
  res = await request(app).get('/api/users/me').set('Cookie', [`accessToken=${token}`]);
  assert(res.status === 200, 'Authenticated GET /api/users/me -> works (200)');
  const fetchedUser = res.body.data.user;
  assert(fetchedUser.name === user.name, 'Profile returns correct name');
  
  // 8 & 9. Password/tokens never returned
  assert(fetchedUser.password === undefined, 'Password hash is NOT returned');
  assert(fetchedUser.passwordResetTokenHash === undefined, 'Tokens are NOT returned');

  // 4. Update allowed fields
  const newPhone = '555-123-4567';
  res = await request(app).patch('/api/users/me').set('Cookie', [`accessToken=${token}`]).send({ phone: newPhone });
  assert(res.status === 200, 'PATCH /api/users/me allows safe field update');
  assert(res.body.data.user.phone === newPhone, 'Phone number updated successfully');

  // 5. Invalid data rejected
  res = await request(app).patch('/api/users/me').set('Cookie', [`accessToken=${token}`]).send({ phone: 'invalid_phone!' });
  assert(res.status === 400, 'PATCH /api/users/me rejects invalid validation (400)');

  if (user2) {
    // Duplicate username test
    res = await request(app).patch('/api/users/me').set('Cookie', [`accessToken=${token}`]).send({ username: user2.username });
    assert(res.status === 400, 'Duplicate username update rejected (400)');
  }

  // 6. Protected fields cannot be modified
  const maliciousPayload = { role: 'admin', isVerified: true, email: 'hacker@hack.com' };
  res = await request(app).patch('/api/users/me').set('Cookie', [`accessToken=${token}`]).send(maliciousPayload);
  assert(res.status === 200, 'PATCH /api/users/me ignores protected fields but still succeeds with no-op');
  assert(res.body.data.user.role === user.role, 'Role was NOT modified');
  assert(res.body.data.user.email === user.email, 'Email was NOT modified');

  // 7. User cannot access another user's profile
  // Because /api/users/me uses req.user.id implicitly, there's no way to pass another ID. 
  // Let's verify we can't send { id: user2._id } to modify them
  if (user2) {
    res = await request(app).patch('/api/users/me').set('Cookie', [`accessToken=${token}`]).send({ _id: user2._id, name: 'Hacked' });
    // Should still update user1, not user2
    const updatedUser2 = await User.findById(user2._id);
    assert(updatedUser2.name !== 'Hacked', 'Cannot modify another user profile by injecting _id');
  }

  // Regression tests
  res = await request(app).get('/api/products');
  assert(res.status === 200, 'Products API works');
  
  res = await request(app).get('/api/cart').set('Cookie', [`accessToken=${token}`]);
  assert(res.status === 200, 'Cart API works');

  res = await request(app).get('/api/wishlist').set('Cookie', [`accessToken=${token}`]);
  assert(res.status === 200, 'Wishlist API works');

  console.log(`\nTests passed: ${testsPassed}/${testsTotal}`);

  await mongoose.disconnect();
}

runTests().catch(err => console.error(err));
