import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();
import Product from './models/Product.js';

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const products = await Product.find({});
  let updated = 0;
  for (const product of products) {
    if (!product.images || product.images.length === 0 || !product.images[0].url) {
      product.images = [{ url: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=1000' }]; // Shopping/Sale generic image
      await product.save();
      updated++;
    }
  }
  console.log(`Updated images for ${updated} products that had missing images`);
  process.exit(0);
});
