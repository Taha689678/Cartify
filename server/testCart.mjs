import 'dotenv/config';
import mongoose from 'mongoose';
import request from 'supertest';
import app from './app.js';
import User from './models/User.js';
import jwt from 'jsonwebtoken';

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  const user = await User.findOne({});
  const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
  const res = await request(app).get('/api/cart').set('Cookie', [`accessToken=${token}`]);
  console.log(res.status, res.body);
  await mongoose.disconnect();
}
run();
