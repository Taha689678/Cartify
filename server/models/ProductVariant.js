import mongoose from "mongoose";

const productVariantSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: [true, "Product reference is required"],
    },
    sku: {
      type: String,
      required: [true, "SKU is required"],
      unique: true,
      trim: true,
    },
    attributes: {
      type: Map,
      of: String,
      default: {},
      validate: {
        validator: (map) => map && map.size > 0,
        message: "At least one attribute (e.g. color, size) is required",
      },
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },
    compareAtPrice: {
      type: Number,
      min: [0, "Compare-at price cannot be negative"],
      default: null,
    },
    stock: {
      type: Number,
      min: [0, "Stock cannot be negative"],
      default: 0,
    },
    image: {
      url: {
        type: String,
        default: "",
      },
      publicId: {
        type: String,
        default: "",
      },
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

// Fetch all variants for a product, restricted to active ones
productVariantSchema.index({ product: 1, isActive: 1 });

const ProductVariant = mongoose.model("ProductVariant", productVariantSchema);

export default ProductVariant;