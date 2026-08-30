import 'dotenv/config';
import mongoose from 'mongoose';
import User from './models/User.js';
import Seller from './models/Seller.js';

async function makeSeller() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to DB');

  const email = process.argv[2];
  if (!email) {
    console.error('Please provide an email address. Example: node makeSeller.mjs your@email.com');
    process.exit(1);
  }

  const user = await User.findOne({ email });
  if (!user) {
    console.error(`User with email ${email} not found.`);
    process.exit(1);
  }

  user.role = 'seller';
  await user.save();
  console.log(`User ${email} role updated to 'seller'.`);

  let seller = await Seller.findOne({ user: user._id });
  if (!seller) {
    seller = new Seller({
      user: user._id,
      storeName: `${user.name}'s Store`,
      storeSlug: `${user.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-store`,
      status: 'approved'
    });
    await seller.save();
    console.log(`Seller profile created for ${email}.`);
  } else {
    seller.status = 'approved';
    await seller.save();
    console.log(`Seller profile already exists. Status updated to 'approved'.`);
  }

  console.log('Done! You can now log in and access the seller dashboard.');
  process.exit(0);
}

makeSeller().catch(console.error);
