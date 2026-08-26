import mongoose from "mongoose";

const wishlistSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User reference is required"],
      unique: true,
    },
    products: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
        },
      ],
      default: [],
      validate: {
        validator: function (products) {
          const ids = products.map((id) => id.toString());
          return ids.length === new Set(ids).size;
        },
        message: "Wishlist cannot contain duplicate products",
      },
    },
  },
  {
    timestamps: true,
  }
);

// Speed up checks like "is this product already in the user's wishlist"
wishlistSchema.index({ user: 1, products: 1 });

const Wishlist = mongoose.model("Wishlist", wishlistSchema);

export default Wishlist;