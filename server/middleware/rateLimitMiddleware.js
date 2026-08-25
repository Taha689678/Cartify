const rateLimit = require("express-rate-limit");

/**
 * Generic 429 handler shared by every limiter below.
 * Returns a safe, generic message — no IP, no counters, no internals.
 */
const rateLimitHandler = (req, res) => {
  res.status(429).json({
    success: false,
    message: "Too many requests. Please try again later.",
  });
};

/**
 * Shared factory for building a limiter with sensible, overridable defaults.
 *
 * IMPORTANT (reverse proxy / IP spoofing note):
 * This middleware keys on req.ip. Express only reports the real client IP
 * from the X-Forwarded-For header when `app.set("trust proxy", <hops>)` is
 * configured correctly in app.js for your actual deployment (e.g. 1 behind
 * a single trusted load balancer/reverse proxy). That setting is NOT part
 * of this file — it must be configured once in app.js. If trust proxy is
 * left unset (or wrongly set to `true`, trusting every hop), a client can
 * spoof X-Forwarded-For and each request will appear to come from a
 * different IP, bypassing these limits entirely. This file assumes that
 * configuration is handled correctly elsewhere and does not attempt to
 * duplicate or override it.
 */
const buildLimiter = ({ windowMs, max, message }) =>
  rateLimit({
    windowMs,
    max,
    standardHeaders: true, // return RateLimit-* headers
    legacyHeaders: false, // disable deprecated X-RateLimit-* headers
    handler: rateLimitHandler,
    message,
    skipSuccessfulRequests: false,
  });

/**
 * loginLimiter
 * Endpoint: POST /api/auth/login
 * Brute-force protection: 10 attempts per 15 minutes per IP.
 * Loose enough that a user who mistypes their password a few times
 * isn't locked out, tight enough to make credential-stuffing impractical.
 */
const loginLimiter = buildLimiter({
  windowMs: Number(process.env.LOGIN_RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: Number(process.env.LOGIN_RATE_LIMIT_MAX) || 10,
});

/**
 * registerLimiter
 * Endpoint: POST /api/auth/register
 * Anti-automation: 5 accounts per hour per IP.
 * Registration is inherently rarer per real user than login, so a tighter
 * cap here doesn't hurt legitimate traffic while blocking mass sign-up bots.
 */
const registerLimiter = buildLimiter({
  windowMs: Number(process.env.REGISTER_RATE_LIMIT_WINDOW_MS) || 60 * 60 * 1000,
  max: Number(process.env.REGISTER_RATE_LIMIT_MAX) || 5,
});

/**
 * forgotPasswordLimiter
 * Endpoint: POST /api/auth/forgot-password
 * Abuse protection: 3 requests per hour per IP.
 * Kept tight since this endpoint sends real emails — without a limit it
 * can be used to spam a victim's inbox or enumerate registered accounts
 * via timing, even though the controller itself returns a generic message.
 */
const forgotPasswordLimiter = buildLimiter({
  windowMs:
    Number(process.env.FORGOT_PASSWORD_RATE_LIMIT_WINDOW_MS) || 60 * 60 * 1000,
  max: Number(process.env.FORGOT_PASSWORD_RATE_LIMIT_MAX) || 3,
});

/**
 * resetPasswordLimiter
 * Endpoint: POST /api/auth/reset-password
 * Brute-force protection: 5 attempts per 15 minutes per IP.
 * Prevents guessing/brute-forcing a valid reset token.
 */
const resetPasswordLimiter = buildLimiter({
  windowMs:
    Number(process.env.RESET_PASSWORD_RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: Number(process.env.RESET_PASSWORD_RATE_LIMIT_MAX) || 5,
});

/**
 * verificationLimiter
 * Endpoints: POST /api/auth/verify-email, POST /api/auth/resend-verification
 * Abuse protection: 5 requests per hour per IP.
 * Stops repeated verification-email spam and token brute-forcing, while
 * still allowing a real user a couple of retries if an email gets lost.
 */
const verificationLimiter = buildLimiter({
  windowMs:
    Number(process.env.VERIFICATION_RATE_LIMIT_WINDOW_MS) || 60 * 60 * 1000,
  max: Number(process.env.VERIFICATION_RATE_LIMIT_MAX) || 5,
});

/**
 * refreshTokenLimiter
 * Endpoint: POST /api/auth/refresh-token
 * Highest limit of the group: 30 requests per 15 minutes per IP.
 * Legitimate clients call this automatically and fairly often to keep a
 * session alive, so the limit here exists mainly to catch runaway retry
 * loops or refresh-token brute-forcing, not normal usage.
 */
const refreshTokenLimiter = buildLimiter({
  windowMs:
    Number(process.env.REFRESH_TOKEN_RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: Number(process.env.REFRESH_TOKEN_RATE_LIMIT_MAX) || 30,
});

module.exports = {
  loginLimiter,
  registerLimiter,
  forgotPasswordLimiter,
  resetPasswordLimiter,
  verificationLimiter,
  refreshTokenLimiter,
};