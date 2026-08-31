import mongoose from 'mongoose';
import Order from './models/Order.js';
import dotenv from 'dotenv';
dotenv.config();

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  const order = await Order.findOne();
  if (order) {
    console.log("Order items:");
    console.log(JSON.stringify(order.items[0], null, 2));
  } else {
    console.log("No orders found");
  }
  process.exit(0);
}
run();
