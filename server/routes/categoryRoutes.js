import express from "express";
const router = express.Router();

import requireAuth from "../middleware/authMiddleware.js";
import requireRole from "../middleware/roleMiddleware.js";
import validate from "../middleware/validateMiddleware.js";
import {
  getAllCategories,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deactivateCategory,
} from "../controllers/categoryController.js";
import {
  createCategory as createCategoryValidator,
  updateCategory as updateCategoryValidator,
  categoryIdParam,
} from "../validators/categoryValidator.js";

// ─── Public ───────────────────────────────────────────────────────────────────

// GET /api/categories
router.get("/", getAllCategories);

// GET /api/categories/:slug
// :slug is validated inside the controller (format guard only; no schema needed)
router.get("/:slug", getCategoryBySlug);

// ─── Admin ────────────────────────────────────────────────────────────────────

// POST /api/categories
router.post(
  "/",
  requireAuth,
  requireRole("admin"),
  validate(createCategoryValidator),
  createCategory
);

// PUT /api/categories/:id
router.put(
  "/:id",
  requireAuth,
  requireRole("admin"),
  validate({ params: categoryIdParam, body: updateCategoryValidator }),
  updateCategory
);

// PATCH /api/categories/:id
router.patch(
  "/:id",
  requireAuth,
  requireRole("admin"),
  validate({ params: categoryIdParam, body: updateCategoryValidator }),
  updateCategory
);

// DELETE /api/categories/:id
router.delete(
  "/:id",
  requireAuth,
  requireRole("admin"),
  validate({ params: categoryIdParam }),
  deactivateCategory
);

export default router;
