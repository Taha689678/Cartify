const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User reference is required"],
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: [true, "Product reference is required"],
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      default: null,
    },
    rating: {
      type: Number,
      required: [true, "Rating is required"],
      min: [1, "Rating must be at least 1"],
      max: [5, "Rating cannot exceed 5"],
      validate: {
        validator: Number.isInteger,
        message: "Rating must be a whole number between 1 and 5",
      },
    },
    title: {
      type: String,
      trim: true,
      maxlength: [150, "Title cannot exceed 150 characters"],
      default: "",
    },
    comment: {
      type: String,
      trim: true,
      maxlength: [2000, "Comment cannot exceed 2000 characters"],
      default: "",
    },
    images: {
      type: [String],
      default: [],
    },
    isVerifiedPurchase: {
      type: Boolean,
      default: false,
    },
    isApproved: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent a user from submitting more than one review for the same product/order combination
reviewSchema.index({ user: 1, product: 1, order: 1 }, { unique: true });

// Fetch all reviews for a product (product page), and all reviews by a user (profile page)
reviewSchema.index({ product: 1, isApproved: 1 });
reviewSchema.index({ user: 1 });

module.exports = mongoose.model("Review", reviewSchema);