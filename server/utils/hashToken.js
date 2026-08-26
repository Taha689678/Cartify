import crypto from "crypto";
/**
 * Hashes a token using SHA-256, returning a consistent hex string.
 * The same input always produces the same output, so a stored hash
 * can later be compared against the hash of a freshly submitted
 * token (e.g. from a password-reset URL) without ever storing the
 * raw token itself.
 *
 * @param {string} token - raw token value (never logged)
 * @returns {string} SHA-256 hash of the token, as a hex string
 * @throws {Error} if token is missing or not a non-empty string
 */
function hashToken(token) {
  if (typeof token !== "string" || token.length === 0) {
    throw new Error("Invalid token input");
  }

  return crypto.createHash("sha256").update(token).digest("hex");
}

export default hashToken;
