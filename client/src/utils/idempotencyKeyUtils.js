/**
 * Utility for managing idempotency keys to prevent duplicate requests
 * Stores the key in sessionStorage for the duration of the session
 */

const IDEMPOTENCY_KEY_PREFIX = "cartify_idempotency_";

/**
 * Generate a unique idempotency key for checkout requests
 * The key is stored in sessionStorage to persist across retries
 * @returns {string} A unique idempotency key
 */
export const getOrCreateIdempotencyKey = () => {
  const storageKey = IDEMPOTENCY_KEY_PREFIX + "checkout";
  let key = sessionStorage.getItem(storageKey);
  
  if (!key) {
    // Generate a new key: timestamp + random string
    key = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem(storageKey, key);
  }
  
  return key;
};

/**
 * Clear the stored idempotency key after successful checkout
 * Should be called after successful order creation
 */
export const clearIdempotencyKey = () => {
  const storageKey = IDEMPOTENCY_KEY_PREFIX + "checkout";
  sessionStorage.removeItem(storageKey);
};

/**
 * Get the current idempotency key without creating a new one
 * Returns null if no key exists
 */
export const getCurrentIdempotencyKey = () => {
  const storageKey = IDEMPOTENCY_KEY_PREFIX + "checkout";
  return sessionStorage.getItem(storageKey);
};
