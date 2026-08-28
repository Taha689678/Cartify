import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User    from "./models/User.js";
import Product from "./models/Product.js";
import Cart    from "./models/Cart.js";

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  
  const user = await User.findOne({ email: "carttest@test.com" });
  if (user) {
    let cart = await Cart.findOne({ user: user._id });
    if (!cart) {
      cart = await Cart.create({ user: user._id, items: [] });
    }
    const product = await Product.findOne();
    if (product) {
      cart.items.push({
        product: product._id,
        quantity: 1,
        price: product.price
      });
      await cart.save();
      console.log("Cart saved successfully with 1 item");
    }
  } else {
    console.log("No user found");
  }
  
  await mongoose.disconnect();
}
run().catch(console.error);
