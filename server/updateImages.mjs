import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();
import Product from './models/Product.js';

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const watch = await Product.findOne({ name: /Cartify SmartWatch Series X/i });
  if (watch) {
    watch.images = [{ url: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?q=80&w=1000&auto=format&fit=crop' }];
    await watch.save();
    console.log('Updated Cartify SmartWatch Series X');
  } else {
    console.log('Cartify SmartWatch Series X not found');
  }

  const headphones = await Product.findOne({ name: /Cartify Pro Wireless Headphones/i });
  if (headphones) {
    headphones.images = [{ url: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?q=80&w=1000&auto=format&fit=crop' }];
    await headphones.save();
    console.log('Updated Cartify Pro Wireless Headphones');
  } else {
    console.log('Cartify Pro Wireless Headphones not found');
  }
  
  process.exit(0);
});
