import Seller from "../models/seller.js";
import ApiError from "../utils/apiError.js";

/**
 * requireApprovedSeller
 *
 * Expects requireAuth to have already run and set req.user.
 * Verifies the authenticated user is a seller AND that their Seller
 * profile exists with status "approved". Attaches the Seller document
 * to req.seller so downstream controllers (e.g. product creation,
 * seller order management) can use it without re-querying.
 *
 * This is independent of roleMiddleware: role checks answer "is this
 * user a seller account type", while this middleware answers the
 * stricter question "is this seller actually cleared to sell right now".
 * A route can use either or both depending on how strict it needs to be.
 */
const requireApprovedSeller = async (req, res, next) => {
  try {
    if (!req.user) {
      return next(new ApiError(401, "Authentication required"));
    }

    if (req.user.role !== "seller") {
      return next(
        new ApiError(403, "This action is restricted to seller accounts")
      );
    }

    const seller = await Seller.findOne({ user: req.user.id });

    if (!seller) {
      return next(new ApiError(403, "No seller profile found for this account"));
    }

    if (seller.status !== "approved") {
      return next(
        new ApiError(
          403,
          "Your seller account is not approved for this action"
        )
      );
    }

    req.seller = seller;
    req.sellerId = seller._id.toString();

    return next();
  } catch (error) {
    return next(error);
  }
};

export const requireSeller = async (req, res, next) => {
  try {
    if (!req.user || req.user.role !== "seller") {
      return next(new ApiError(403, "Access denied. Seller role required."));
    }

    const seller = await Seller.findOne({ user: req.user.id });
    if (!seller) {
      return next(new ApiError(403, "Seller profile not found."));
    }

    req.sellerId = seller._id.toString();
    next();
  } catch (error) {
    next(error);
  }
};

export default requireApprovedSeller;