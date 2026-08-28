import mongoose from "mongoose";

const productImageSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: [true, "Image URL is required"],
    },
    publicId: {
      type: String,
      default: "",
    },
    alt: {
      type: String,
      trim: true,
      maxlength: [200, "Alt text cannot exceed 200 characters"],
      default: "",
    },
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      minlength: [2, "Product name must be at least 2 characters"],
      maxlength: [150, "Product name cannot exceed 150 characters"],
    },
    slug: {
      type: String,
      required: [true, "Product slug is required"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
        "Product slug can only contain lowercase letters, numbers, and hyphens",
      ],
    },
    description: {
      type: String,
      required: [true, "Product description is required"],
      trim: true,
      maxlength: [5000, "Description cannot exceed 5000 characters"],
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Seller",
      required: [true, "Seller reference is required"],
    },
    categories: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Category",
        },
      ],
      required: [true, "At least one category is required"],
      validate: {
        validator: function (categories) {
          return categories.length > 0;
        },
        message: "Product must have at least one category",
      },
    },
    brand: {
      type: String,
      trim: true,
      maxlength: [100, "Brand cannot exceed 100 characters"],
      default: "",
    },
    images: {
      type: [productImageSchema],
      default: [],
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
    sku: {
      type: String,
      unique: true,
      trim: true,
      sparse: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isBestSelling: {
      type: Boolean,
      default: false,
    },
    rating: {
      type: Number,
      min: [0, "Rating cannot be negative"],
      max: [5, "Rating cannot exceed 5"],
      default: 0,
    },
    numReviews: {
      type: Number,
      min: [0, "Number of reviews cannot be negative"],
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

productSchema.index({ name: "text", brand: "text", description: "text" });

// Storefront: browse by category, seller store pages, price filtering
productSchema.index({ categories: 1, isActive: 1 });
productSchema.index({ seller: 1, isActive: 1 });
productSchema.index({ price: 1 });

// Homepage sections: featured / best-selling product carousels
productSchema.index({ isFeatured: 1, isActive: 1 });
productSchema.index({ isBestSelling: 1, isActive: 1 });

// Sorting: top-rated products, newest arrivals
productSchema.index({ rating: -1 });
productSchema.index({ createdAt: -1 });

const Product = mongoose.model("Product", productSchema);

export default Product;