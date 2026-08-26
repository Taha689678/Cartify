/**
 * ApiError
 *
 * The single error type thrown by every layer of the auth stack
 * (controllers, services, middleware). It carries an HTTP status code
 * alongside a message that is SAFE to send to the client, so the global
 * error handler can respond without having to guess whether an error was
 * deliberate or an unexpected crash.
 *
 * Usage — the calling convention already used across the codebase:
 *
 *   throw new ApiError(401, "Invalid email or password");
 *   return next(new ApiError(403, "Your account has been blocked"));
 *
 * Structured field errors (set by validateMiddleware.js):
 *
 *   const err = new ApiError(400, "Validation failed");
 *   err.errors = [{ field: "email", message: "must be a valid email" }];
 *
 * Security note: `isOperational` marks an error as one we raised on
 * purpose. The error handler should return `message` verbatim only when
 * this flag is true; for anything else (a genuine bug, a driver failure)
 * it must send a generic message instead, so internals, stack traces, and
 * secrets can never leak through an API response.
 */
class ApiError extends Error {
  /**
   * @param {number} statusCode HTTP status to respond with (e.g. 401, 403).
   * @param {string} message Client-safe message. Never put a password,
   *   token, secret, or raw DB error text in here.
   * @param {Array<{field?: string, message: string}>} [errors] Optional
   *   per-field details, mainly for 400 validation responses.
   */
  constructor(statusCode, message, errors = []) {
    super(message);

    this.name = "ApiError";
    this.statusCode = Number(statusCode) || 500;
    this.errors = Array.isArray(errors) ? errors : [];

    // Distinguishes "we threw this deliberately" from "something broke".
    this.isOperational = true;

    // Omit this constructor from the stack trace so the trace points at
    // the real throw site.
    Error.captureStackTrace(this, this.constructor);
  }
}

export default ApiError;
