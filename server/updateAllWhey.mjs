import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();
import Product from './models/Product.js';

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const products = await Product.find({ name: /Whey/i });
  let updated = 0;
  for (const product of products) {
    if (product.name.includes('Optimum')) {
      product.images = [{ url: 'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?q=80&w=1000' }];
    } else {
      product.images = [{ url: 'https://images.unsplash.com/photo-1579722820308-d74e571900a9?q=80&w=1000' }];
    }
    await product.save();
    updated++;
  }
  console.log(`Updated images for ${updated} Whey protein products`);
  process.exit(0);
});
