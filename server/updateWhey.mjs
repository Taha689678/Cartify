import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();
import Product from './models/Product.js';

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const products = await Product.find({ name: /Gold Whey Protein Extreme/i });
  let updated = 0;
  for (const product of products) {
    product.images = [{ url: 'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?q=80&w=1000&auto=format&fit=crop' }];
    await product.save();
    updated++;
  }
  console.log(`Updated ${updated} products matching Gold Whey Protein Extreme`);
  process.exit(0);
});
