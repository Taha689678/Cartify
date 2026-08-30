import mongoose from "mongoose";

const sellerSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User reference is required"],
      unique: true,
    },
    storeName: {
      type: String,
      required: [true, "Store name is required"],
      trim: true,
      minlength: [2, "Store name must be at least 2 characters"],
      maxlength: [100, "Store name cannot exceed 100 characters"],
    },
    storeSlug: {
      type: String,
      required: [true, "Store slug is required"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
        "Store slug can only contain lowercase letters, numbers, and hyphens",
      ],
    },
    storeDescription: {
      type: String,
      trim: true,
      maxlength: [1000, "Store description cannot exceed 1000 characters"],
      default: "",
    },
    logo: {
      url: {
        type: String,
        default: "",
      },
      publicId: {
        type: String,
        default: "",
      },
    },
    status: {
      type: String,
      enum: {
        values: ["pending", "approved", "rejected", "suspended"],
        message: "Status must be pending, approved, rejected, or suspended",
      },
      default: "pending",
    },
    rejectionReason: {
      type: String,
      trim: true,
      default: "",
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const Seller = mongoose.model("Seller", sellerSchema);

export default Seller;