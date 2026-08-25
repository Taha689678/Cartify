const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const ApiError = require("../utils/apiError");

const JWT_ALGORITHM = "HS256";

const ACCESS_TOKEN_EXPIRES_IN = process.env.JWT_ACCESS_EXPIRES_IN || "15m";
const REFRESH_TOKEN_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || "7d";

/**
 * Reads a required secret from environment variables. Fails safely: throws
 * a generic, non-leaking error to the caller while logging only the NAME
 * of the missing variable (never a secret value — there isn't one to leak)
 * so operators can diagnose a misconfigured deployment from server logs.
 */
const getRequiredSecret = (envVarName) => {
  const value = process.env[envVarName];
  if (!value) {
    console.error(
      `tokenService: missing required environment variable ${envVarName}`
    );
    throw new ApiError(500, "Server authentication configuration error");
  }
  return value;
};

/**
 * ACCESS token secret intentionally reuses JWT_SECRET — this matches the
 * already-built authMiddleware.js, which verifies access tokens directly
 * via jwt.verify(token, process.env.JWT_SECRET). Using a different env var
 * name here would silently break every authenticated request, since
 * tokens issued by this service would fail verification in that
 * middleware. See the compatibility note in chat for details.
 */
const getAccessTokenSecret = () => getRequiredSecret("JWT_SECRET");

/**
 * REFRESH tokens use a SEPARATE secret from access tokens, as required —
 * compromising one token type's secret does not compromise the other.
 */
const getRefreshTokenSecret = () => getRequiredSecret("JWT_REFRESH_SECRET");

/**
 * generateAccessToken(user)
 * Short-lived token used to authenticate ordinary API requests.
 * Claims: user id + role only.
 */
const generateAccessToken = (user) => {
  const id = user?._id ? user._id.toString() : user?.id;
  if (!id) {
    throw new ApiError(500, "Cannot generate access token without a user id");
  }

  const payload = { id, role: user.role };

  return jwt.sign(payload, getAccessTokenSecret(), {
    algorithm: JWT_ALGORITHM,
    expiresIn: ACCESS_TOKEN_EXPIRES_IN,
  });
};

/**
 * generateRefreshToken(user, sessionId)
 * Longer-lived token used only to obtain new access tokens. Carries the
 * session id as a claim so refresh/rotation logic can locate the exact
 * Session document directly. Deliberately does NOT carry role — role is
 * re-derived from the database on every refresh (in authService), so a
 * stale or since-elevated/demoted role can never be replayed via an old
 * refresh token.
 */
const generateRefreshToken = (user, sessionId) => {
  const id = user?._id ? user._id.toString() : user?.id;
  if (!id || !sessionId) {
    throw new ApiError(
      500,
      "Cannot generate refresh token without a user id and session id"
    );
  }

  const payload = { id, sessionId: sessionId.toString() };

  return jwt.sign(payload, getRefreshTokenSecret(), {
    algorithm: JWT_ALGORITHM,
    expiresIn: REFRESH_TOKEN_EXPIRES_IN,
  });
};

/**
 * verifyAccessToken(token)
 * Verifies signature + expiry against the access-token secret, with the
 * algorithm pinned explicitly (never trusts the token's own "alg" header).
 * Throws — never silently passes through — on any invalid, expired, or
 * malformed token.
 */
const verifyAccessToken = (token) => {
  if (!token || typeof token !== "string") {
    throw new ApiError(401, "Invalid access token");
  }

  try {
    return jwt.verify(token, getAccessTokenSecret(), {
      algorithms: [JWT_ALGORITHM],
    });
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      throw new ApiError(401, "Access token expired");
    }
    throw new ApiError(401, "Invalid access token");
  }
};

/**
 * verifyRefreshToken(token)
 * Verifies signature + expiry against the refresh-token secret, algorithm
 * pinned explicitly. Throws on any invalid, expired, or malformed token.
 */
const verifyRefreshToken = (token) => {
  if (!token || typeof token !== "string") {
    throw new ApiError(401, "Invalid refresh token");
  }

  try {
    return jwt.verify(token, getRefreshTokenSecret(), {
      algorithms: [JWT_ALGORITHM],
    });
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      throw new ApiError(401, "Refresh token expired");
    }
    throw new ApiError(401, "Invalid refresh token");
  }
};

/**
 * generateRandomToken(bytes = 32)
 * Cryptographically secure random token for non-JWT use cases: email
 * verification, password reset, or opaque refresh-token material. This
 * function only generates the raw value — callers are responsible for
 * hashing it before persisting (see the hashToken utility) and for never
 * storing or logging the raw value itself.
 */
const generateRandomToken = (bytes = 32) =>
  crypto.randomBytes(bytes).toString("hex");

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  generateRandomToken,
};