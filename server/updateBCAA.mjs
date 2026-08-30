import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();
import Product from './models/Product.js';

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const bcaa = await Product.findOne({ name: /Iron BCAA Extreme/i });
  if (bcaa) {
    bcaa.images = [{ url: 'https://images.unsplash.com/photo-1583454155184-870a1f056eb1?q=80&w=1000&auto=format&fit=crop' }]; // Dumbbells / Gym Gear
    await bcaa.save();
    console.log('Updated Iron BCAA Extreme');
  } else {
    console.log('Iron BCAA Extreme not found');
  }
  process.exit(0);
});
