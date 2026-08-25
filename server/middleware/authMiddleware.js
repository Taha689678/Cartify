const jwt = require("jsonwebtoken");
const User = require("../models/User");
const ApiError = require("../utils/apiError");

/**
 * requireAuth
 *
 * Verifies the access token stored in the HTTP-only "accessToken" cookie,
 * loads the corresponding user, and attaches it to req.user.
 *
 * Rejects the request (via next(ApiError)) if:
 *  - no access token cookie is present
 *  - the token is invalid or expired
 *  - the user no longer exists
 *  - the user is blocked
 *
 * Any unexpected (non-auth) failure is passed to the centralized
 * error-handling middleware via next(error).
 */
const requireAuth = async (req, res, next) => {
  try {
    const accessToken = req.cookies?.accessToken;

    if (!accessToken) {
      return next(new ApiError(401, "Authentication required"));
    }

    let decoded;
    try {
      decoded = jwt.verify(accessToken, process.env.JWT_SECRET);
    } catch (jwtError) {
      if (jwtError.name === "TokenExpiredError") {
        return next(new ApiError(401, "Session expired, please log in again"));
      }
      return next(new ApiError(401, "Invalid authentication token"));
    }

    const userId = decoded?.id || decoded?.sub;

    if (!userId) {
      return next(new ApiError(401, "Invalid authentication token"));
    }

    const user = await User.findById(userId).select(
      "-password -__v"
    );

    if (!user) {
      return next(new ApiError(401, "User no longer exists"));
    }

    if (user.isBlocked) {
      return next(new ApiError(403, "Your account has been blocked"));
    }

    req.user = {
      id: user._id.toString(),
      role: decoded.role || user.role,
      username: user.username,
      email: user.email,
      name: user.name,
      isVerified: user.isVerified,
    };

    return next();
  } catch (error) {
    return next(error);
  }
};

module.exports = requireAuth;