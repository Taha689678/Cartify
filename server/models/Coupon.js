const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, "Coupon code is required"],
      unique: true,
      trim: true,
      uppercase: true,
      minlength: [3, "Coupon code must be at least 3 characters"],
      maxlength: [30, "Coupon code cannot exceed 30 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
      default: "",
    },
    discountType: {
      type: String,
      enum: {
        values: ["percentage", "fixed"],
        message: "Discount type must be percentage or fixed",
      },
      required: [true, "Discount type is required"],
    },
    discountValue: {
      type: Number,
      required: [true, "Discount value is required"],
      validate: {
        validator: function (value) {
          if (this.discountType === "percentage") {
            return value >= 1 && value <= 100;
          }
          if (this.discountType === "fixed") {
            return value > 0;
          }
          return true;
        },
        message:
          "Percentage discounts must be between 1 and 100, and fixed discounts must be greater than 0",
      },
    },
    minimumOrderAmount: {
      type: Number,
      min: [0, "Minimum order amount cannot be negative"],
      default: 0,
    },
    maximumDiscountAmount: {
      type: Number,
      min: [0, "Maximum discount amount cannot be negative"],
      default: null,
    },
    startDate: {
      type: Date,
      required: [true, "Start date is required"],
    },
    expiryDate: {
      type: Date,
      required: [true, "Expiry date is required"],
      validate: {
        validator: function (value) {
          return !this.startDate || value > this.startDate;
        },
        message: "Expiry date must be after start date",
      },
    },
    usageLimit: {
      type: Number,
      min: [1, "Usage limit must be at least 1"],
      default: null,
    },
    usedCount: {
      type: Number,
      min: [0, "Used count cannot be negative"],
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

couponSchema.index({ isActive: 1 });
couponSchema.index({ expiryDate: 1 });

module.exports = mongoose.model("Coupon", couponSchema);