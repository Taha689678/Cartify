import mongoose from "mongoose";
import Category from "../models/Category.js";
import ApiResponse from "../utils/apiResponse.js";
import ApiError from "../utils/apiError.js";

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Maps a Mongoose duplicate-key error (code 11000) on the slug field to a
 * client-safe ApiError. Returns null for any other error so the caller can
 * re-throw it and let the global error handler deal with it.
 */
const handleDuplicateKeyError = (error) => {
  if (error.code === 11000) {
    const field = Object.keys(error.keyValue || {})[0] || "field";
    if (field === "slug") {
      return new ApiError(409, "A category with that slug already exists");
    }
    return new ApiError(409, `A category with that ${field} already exists`);
  }
  return null;
};

// ─── Public ───────────────────────────────────────────────────────────────────

/**
 * @route   GET /api/categories
 * @access  Public
 *
 * Returns all active categories sorted alphabetically by name.
 * Intentionally excludes __v from the response.
 */
const getAllCategories = async (req, res, next) => {
  try {
    const categories = await Category.find({ isActive: true })
      .select("-__v")
      .sort({ name: 1 })
      .lean();

    return res
      .status(200)
      .json(
        new ApiResponse(200, "Categories fetched successfully", { categories })
      );
  } catch (error) {
    return next(error);
  }
};

/**
 * @route   GET /api/categories/:slug
 * @access  Public
 *
 * Returns a single active category by its URL slug.
 */
const getCategoryBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;

    // Basic slug format guard — keeps raw DB queries out of obviously bad input
    const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    if (!slug || !SLUG_REGEX.test(slug)) {
      throw new ApiError(400, "Invalid category slug");
    }

    const category = await Category.findOne({ slug, isActive: true })
      .select("-__v")
      .lean();

    if (!category) {
      throw new ApiError(404, "Category not found");
    }

    return res
      .status(200)
      .json(
        new ApiResponse(200, "Category fetched successfully", { category })
      );
  } catch (error) {
    return next(error);
  }
};

// ─── Admin ────────────────────────────────────────────────────────────────────

/**
 * @route   POST /api/categories
 * @access  Private — admin only
 *
 * Creates a new category. The body is already validated and sanitized by
 * validateMiddleware + categoryValidator before this handler runs.
 */
const createCategory = async (req, res, next) => {
  try {
    const { name, slug, description, image, parentCategory, isActive } =
      req.body;

    const category = await Category.create({
      name,
      slug,
      description,
      image,
      parentCategory: parentCategory ?? null,
      isActive: isActive ?? true,
    });

    // Re-fetch with lean so the response shape is consistent with the others
    const created = await Category.findById(category._id)
      .select("-__v")
      .lean();

    return res
      .status(201)
      .json(
        new ApiResponse(201, "Category created successfully", { category: created })
      );
  } catch (error) {
    const duplicateErr = handleDuplicateKeyError(error);
    if (duplicateErr) return next(duplicateErr);
    return next(error);
  }
};

/**
 * @route   PUT /PATCH /api/categories/:id
 * @access  Private — admin only
 *
 * Updates any subset of fields on an existing category.
 * :id is validated by categoryIdParam before this handler runs.
 * Body is validated by updateCategory validator.
 */
const updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body; // already sanitized by validateMiddleware

    const category = await Category.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    )
      .select("-__v")
      .lean();

    if (!category) {
      throw new ApiError(404, "Category not found");
    }

    return res
      .status(200)
      .json(
        new ApiResponse(200, "Category updated successfully", { category })
      );
  } catch (error) {
    const duplicateErr = handleDuplicateKeyError(error);
    if (duplicateErr) return next(duplicateErr);
    return next(error);
  }
};

/**
 * @route   DELETE /api/categories/:id
 * @access  Private — admin only
 *
 * Soft-deletes a category by setting isActive = false.
 * Products reference categories by ObjectId; those references remain intact
 * so that existing product data is not disrupted. Product filtering by active
 * categories is handled at the query layer (not here).
 *
 * NOTE: Hard deletion is intentionally avoided because Product documents hold
 * ObjectId references to Category. Removing a category document would leave
 * dangling references in the products collection. If permanent removal is ever
 * required, a migration job should reassign or remove those product references
 * first — outside the scope of this endpoint.
 */
const deactivateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;

    const category = await Category.findByIdAndUpdate(
      id,
      { $set: { isActive: false } },
      { new: true }
    )
      .select("-__v")
      .lean();

    if (!category) {
      throw new ApiError(404, "Category not found");
    }

    return res
      .status(200)
      .json(
        new ApiResponse(200, "Category deactivated successfully", { category })
      );
  } catch (error) {
    return next(error);
  }
};

export {
  getAllCategories,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deactivateCategory,
};
