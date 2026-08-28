import express from "express";
const router = express.Router();

import requireAuth            from "../middleware/authMiddleware.js";
import requireRole            from "../middleware/roleMiddleware.js";
import requireApprovedSeller  from "../middleware/sellerMiddleware.js";
import validate               from "../middleware/validateMiddleware.js";
import {
  getProducts,
  getProductById,
  getProductBySlug,
  createProduct,
  updateProduct,
  deactivateProduct,
} from "../controllers/productController.js";
import {
  createProduct as createProductValidator,
  updateProduct as updateProductValidator,
  productIdParam,
} from "../validators/productValidator.js";

// ─── PUBLIC ───────────────────────────────────────────────────────────────────

// GET /api/products
router.get("/", getProducts);

// GET /api/products/slug/:slug
// MUST be registered before /:id so Express does not treat "slug" as an id param
router.get("/slug/:slug", getProductBySlug);

// GET /api/products/:id
router.get("/:id", getProductById);

// ─── SELLER / ADMIN (write operations) ───────────────────────────────────────
//
// Auth chain for write operations:
//   requireAuth ensures the user is logged in.
//   Then either:
//     - requireApprovedSeller  (sellers must have an approved Seller profile), OR
//     - requireRole("admin")   (admins bypass seller profile requirement)
//
// Both paths go to the same controller which handles ownership logic internally.

// POST /api/products
// Accessible by: approved sellers, admins
router.post(
  "/",
  requireAuth,
  (req, res, next) => {
    if (req.user.role === "admin") return next();
    return requireApprovedSeller(req, res, next);
  },
  validate(createProductValidator),
  createProduct
);

// PUT /api/products/:id
router.put(
  "/:id",
  requireAuth,
  (req, res, next) => {
    if (req.user.role === "admin") return next();
    return requireApprovedSeller(req, res, next);
  },
  validate({ params: productIdParam, body: updateProductValidator }),
  updateProduct
);

// PATCH /api/products/:id
router.patch(
  "/:id",
  requireAuth,
  (req, res, next) => {
    if (req.user.role === "admin") return next();
    return requireApprovedSeller(req, res, next);
  },
  validate({ params: productIdParam, body: updateProductValidator }),
  updateProduct
);

// DELETE /api/products/:id
router.delete(
  "/:id",
  requireAuth,
  (req, res, next) => {
    if (req.user.role === "admin") return next();
    return requireApprovedSeller(req, res, next);
  },
  validate({ params: productIdParam }),
  deactivateProduct
);

export default router;
