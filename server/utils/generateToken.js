const crypto = require("crypto");
const RANDOM_TOKEN_BYTES = 32;
/**
 * Generates a cryptographically secure, URL-safe random token.
 * Suitable as the raw value for email-verification and
 * password-reset links (the caller is responsible for hashing it
 * via hashToken.js before persisting, and for sending only the raw
 * value to the user).
 *
 * @returns {string} URL-safe random token (base64url encoded)
 */
function generateRandomToken() {
  return crypto.randomBytes(RANDOM_TOKEN_BYTES).toString("base64url");
}

module.exports = {
  generateRandomToken,
};