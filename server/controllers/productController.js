import mongoose from "mongoose";
import Product  from "../models/Product.js";
import Category from "../models/Category.js";
import Seller   from "../models/Seller.js";
import ApiResponse from "../utils/apiResponse.js";
import ApiError    from "../utils/apiError.js";

// ─── Constants ────────────────────────────────────────────────────────────────

const DEFAULT_PAGE  = 1;
const DEFAULT_LIMIT = 12;
const MAX_LIMIT     = 100;

// Fields intentionally stripped from public product responses
const PUBLIC_SELECT = "-__v";

// Safe seller fields exposed in populate (never passwords, tokens, etc.)
const SELLER_POPULATE = { path: "seller", select: "storeName storeSlug logo.url -_id" };

// Category fields exposed in populate
const CATEGORY_POPULATE = { path: "categories", select: "name slug -_id" };

// Slug regex (same as model / validator)
const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Maps code-11000 duplicate key errors to client-safe ApiError messages.
 * Returns null for any other error type so the global handler processes it.
 */
const handleDuplicateKeyError = (error) => {
  if (error.code === 11000) {
    const field = Object.keys(error.keyValue || {})[0] || "field";
    if (field === "slug") return new ApiError(409, "A product with that slug already exists");
    if (field === "sku")  return new ApiError(409, "A product with that SKU already exists");
    return new ApiError(409, `A product with that ${field} already exists`);
  }
  return null;
};

/**
 * Verifies that every category ID in the array exists and is active.
 * Throws ApiError immediately if any is invalid.
 */
const validateCategories = async (categoryIds) => {
  const cats = await Category.find({
    _id: { $in: categoryIds },
    isActive: true,
  }).select("_id").lean();

  if (cats.length !== categoryIds.length) {
    throw new ApiError(
      400,
      "One or more categories are invalid or inactive"
    );
  }
};

/**
 * Resolves the Seller document for the current user (seller role).
 * Throws 403 if not found or not approved.
 * Used by admin-or-seller routes where req.seller may not be pre-loaded.
 */
const resolveSellerForUser = async (userId) => {
  const seller = await Seller.findOne({ user: userId });
  if (!seller) throw new ApiError(403, "No seller profile found for this account");
  if (seller.status !== "approved") throw new ApiError(403, "Your seller account is not approved for this action");
  return seller;
};

/**
 * Builds the sort object for Mongoose from the sort query parameter.
 * Only maps to fields that exist in Product.js.
 */
const buildSortObject = (sort) => {
  switch (sort) {
    case "newest":      return { createdAt: -1 };
    case "oldest":      return { createdAt: 1  };
    case "price-low":   return { price: 1       };
    case "price-high":  return { price: -1      };
    case "rating":      return { rating: -1     };
    case "best-selling":return { isBestSelling: -1, createdAt: -1 };
    default:            return { createdAt: -1  }; // default: newest
  }
};

/**
 * Safely parses a positive-integer query param.
 * Returns the default value if the input is missing or invalid.
 */
const parsePositiveInt = (raw, defaultVal, max) => {
  const n = parseInt(raw, 10);
  if (isNaN(n) || n < 1) return defaultVal;
  return max ? Math.min(n, max) : n;
};

// ─── PUBLIC ───────────────────────────────────────────────────────────────────

/**
 * @route   GET /api/products
 * @access  Public
 *
 * Supports: pagination, search, category filter, price range, sort.
 * All filters apply only to active products.
 */
const getProducts = async (req, res, next) => {
  try {
    const page  = parsePositiveInt(req.query.page,  DEFAULT_PAGE);
    const limit = parsePositiveInt(req.query.limit, DEFAULT_LIMIT, MAX_LIMIT);
    const skip  = (page - 1) * limit;

    // Build filter — always restrict to active products
    const filter = { isActive: true };

    // Search — uses the text index on name, brand, description
    if (req.query.search && typeof req.query.search === "string") {
      const q = req.query.search.trim();
      if (q.length > 0) {
        filter.$text = { $search: q };
      }
    }

    // Category filter
    if (req.query.category) {
      if (mongoose.Types.ObjectId.isValid(req.query.category)) {
        filter.categories = req.query.category;
      } else {
        const categoryDoc = await Category.findOne({ slug: req.query.category, isActive: true }).select("_id").lean();
        if (!categoryDoc) {
          throw new ApiError(404, "Category not found");
        }
        filter.categories = categoryDoc._id;
      }
    }

    // Seller filter
    if (req.query.seller) {
      if (!mongoose.Types.ObjectId.isValid(req.query.seller)) {
        throw new ApiError(400, "Invalid seller ID");
      }
      filter.seller = req.query.seller;
    }

    // Price range
    if (req.query.minPrice !== undefined || req.query.maxPrice !== undefined) {
      filter.price = {};
      if (req.query.minPrice !== undefined) {
        const min = Number(req.query.minPrice);
        if (isNaN(min) || min < 0) throw new ApiError(400, "minPrice must be a non-negative number");
        filter.price.$gte = min;
      }
      if (req.query.maxPrice !== undefined) {
        const max = Number(req.query.maxPrice);
        if (isNaN(max) || max < 0) throw new ApiError(400, "maxPrice must be a non-negative number");
        filter.price.$lte = max;
      }
    }

    const sortObj  = buildSortObject(req.query.sort);

    const [products, totalProducts] = await Promise.all([
      Product.find(filter)
        .select(PUBLIC_SELECT)
        .populate(SELLER_POPULATE)
        .populate(CATEGORY_POPULATE)
        .sort(sortObj)
        .skip(skip)
        .limit(limit)
        .lean(),
      Product.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(totalProducts / limit);

    return res.status(200).json(
      new ApiResponse(200, "Products fetched successfully", { products }, {
        page,
        limit,
        totalProducts,
        totalPages,
      })
    );
  } catch (error) {
    return next(error);
  }
};

/**
 * @route   GET /api/products/:id
 * @access  Public
 *
 * Returns a single active product populated with category + seller info.
 */
const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ApiError(400, "Invalid product ID");
    }

    const product = await Product.findOne({ _id: id, isActive: true })
      .select(PUBLIC_SELECT)
      .populate(SELLER_POPULATE)
      .populate(CATEGORY_POPULATE)
      .lean();

    if (!product) throw new ApiError(404, "Product not found");

    return res.status(200).json(
      new ApiResponse(200, "Product fetched successfully", { product })
    );
  } catch (error) {
    return next(error);
  }
};

/**
 * @route   GET /api/products/slug/:slug
 * @access  Public
 *
 * Returns a single active product by its URL slug.
 * Route is registered BEFORE /:id to prevent route conflicts.
 */
const getProductBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;

    if (!slug || !SLUG_REGEX.test(slug)) {
      throw new ApiError(400, "Invalid product slug");
    }

    const product = await Product.findOne({ slug, isActive: true })
      .select(PUBLIC_SELECT)
      .populate(SELLER_POPULATE)
      .populate(CATEGORY_POPULATE)
      .lean();

    if (!product) throw new ApiError(404, "Product not found");

    return res.status(200).json(
      new ApiResponse(200, "Product fetched successfully", { product })
    );
  } catch (error) {
    return next(error);
  }
};

// ─── SELLER / ADMIN ───────────────────────────────────────────────────────────

/**
 * @route   POST /api/products
 * @access  Private — approved seller or admin
 *
 * The seller identity is ALWAYS resolved server-side:
 *   - Sellers: Seller document attached by requireApprovedSeller middleware
 *   - Admins:  Seller profile looked up from their user ID
 *
 * "seller" in the request body is ignored entirely.
 */
const createProduct = async (req, res, next) => {
  try {
    const { name, slug, description, categories, brand, images,
            price, compareAtPrice, stock, sku, isActive,
            isFeatured, isBestSelling } = req.body;

    // Resolve seller ID server-side — never from client
    let sellerId;
    if (req.seller) {
      // Set by requireApprovedSeller
      sellerId = req.seller._id;
    } else {
      // Admin path — find their seller profile or reject
      const seller = await resolveSellerForUser(req.user.id);
      sellerId = seller._id;
    }

    // Validate category references exist and are active
    await validateCategories(categories);

    const productData = {
      name, slug, description,
      categories,
      seller: sellerId,
      brand:  brand  ?? "",
      images: images ?? [],
      price,
      stock:  stock  ?? 0,
      isActive:      isActive      ?? true,
      isFeatured:    isFeatured    ?? false,
      isBestSelling: isBestSelling ?? false,
    };
    if (compareAtPrice !== undefined && compareAtPrice !== null) productData.compareAtPrice = compareAtPrice;
    if (sku)                                                     productData.sku = sku;

    const product = await Product.create(productData);

    const created = await Product.findById(product._id)
      .select(PUBLIC_SELECT)
      .populate(SELLER_POPULATE)
      .populate(CATEGORY_POPULATE)
      .lean();

    return res.status(201).json(
      new ApiResponse(201, "Product created successfully", { product: created })
    );
  } catch (error) {
    const dup = handleDuplicateKeyError(error);
    if (dup) return next(dup);
    return next(error);
  }
};

/**
 * @route   PUT /PATCH /api/products/:id
 * @access  Private — approved seller (own products only) or admin (any product)
 *
 * Sellers cannot change the `seller` field — it is stripped from the validated
 * body by the validator (not in UPDATE_FIELDS).
 */
const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body; // already sanitized by validateMiddleware

    // Fetch existing product to check ownership
    const existing = await Product.findById(id);
    if (!existing) throw new ApiError(404, "Product not found");

    // Ownership check for sellers
    if (req.user.role === "seller") {
      const seller = req.seller || (await resolveSellerForUser(req.user.id));
      if (!existing.seller.equals(seller._id)) {
        throw new ApiError(403, "You can only modify your own products");
      }
    }

    // Validate categories if being changed
    if (updates.categories) {
      await validateCategories(updates.categories);
    }

    const product = await Product.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    )
      .select(PUBLIC_SELECT)
      .populate(SELLER_POPULATE)
      .populate(CATEGORY_POPULATE)
      .lean();

    return res.status(200).json(
      new ApiResponse(200, "Product updated successfully", { product })
    );
  } catch (error) {
    const dup = handleDuplicateKeyError(error);
    if (dup) return next(dup);
    return next(error);
  }
};

/**
 * @route   DELETE /api/products/:id
 * @access  Private — approved seller (own products only) or admin (any product)
 *
 * Soft-deletes by setting isActive = false.
 * Hard deletion is intentionally not implemented because products may be
 * referenced in orders, wishlists, reviews, and cart items.
 */
const deactivateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    const existing = await Product.findById(id);
    if (!existing) throw new ApiError(404, "Product not found");

    // Ownership check for sellers
    if (req.user.role === "seller") {
      const seller = req.seller || (await resolveSellerForUser(req.user.id));
      if (!existing.seller.equals(seller._id)) {
        throw new ApiError(403, "You can only deactivate your own products");
      }
    }

    const product = await Product.findByIdAndUpdate(
      id,
      { $set: { isActive: false } },
      { new: true }
    )
      .select(PUBLIC_SELECT)
      .lean();

    return res.status(200).json(
      new ApiResponse(200, "Product deactivated successfully", { product })
    );
  } catch (error) {
    return next(error);
  }
};

export {
  getProducts,
  getProductById,
  getProductBySlug,
  createProduct,
  updateProduct,
  deactivateProduct,
};
