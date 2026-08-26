import ApiError from "../utils/apiError.js";

const VALID_ROLES = ["customer", "seller", "admin"];

/**
 * requireRole(...allowedRoles)
 *
 * Role-based authorization guard. Must run AFTER requireAuth, since it
 * relies entirely on req.user.role being already set by that middleware.
 *
 * This middleware performs no authentication, no JWT verification, and
 * no database queries — it only compares the already-authenticated
 * user's role (from req.user, never from the request body/query/params)
 * against the list of roles allowed to access the route.
 *
 * Usage:
 *   router.get("/admin/users", requireAuth, requireRole("admin"), handler);
 *   router.post("/seller/products", requireAuth, requireRole("seller"), handler);
 *   router.get("/orders/:id", requireAuth, requireRole("seller", "admin"), handler);
 */
const requireRole = (...allowedRoles) => {
  const roles = allowedRoles.filter((role) => VALID_ROLES.includes(role));

  return (req, res, next) => {
    try {
      if (!req.user) {
        return next(new ApiError(401, "Authentication required"));
      }

      if (!roles.includes(req.user.role)) {
        return next(
          new ApiError(403, "You do not have permission to perform this action")
        );
      }

      return next();
    } catch (error) {
      return next(error);
    }
  };
};

export default requireRole;