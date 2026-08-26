import rateLimit from "express-rate-limit";


const rateLimitHandler = (req, res) => {
  res.status(429).json({
    success: false,
    message: "Too many requests. Please try again later.",
  });
};

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


const loginLimiter = buildLimiter({
  windowMs: Number(process.env.LOGIN_RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: Number(process.env.LOGIN_RATE_LIMIT_MAX) || 10,
});


const isDevelopment = (process.env.NODE_ENV || "development") !== "production";

const registerLimiter = buildLimiter({
  windowMs:
    Number(process.env.REGISTER_RATE_LIMIT_WINDOW_MS) || 60 * 60 * 1000,
  max:
    Number(process.env.REGISTER_RATE_LIMIT_MAX) ||
    (isDevelopment ? 20 : 5),
});


const forgotPasswordLimiter = buildLimiter({
  windowMs:
    Number(process.env.FORGOT_PASSWORD_RATE_LIMIT_WINDOW_MS) || 60 * 60 * 1000,
  max: Number(process.env.FORGOT_PASSWORD_RATE_LIMIT_MAX) || 3,
});


const resetPasswordLimiter = buildLimiter({
  windowMs:
    Number(process.env.RESET_PASSWORD_RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: Number(process.env.RESET_PASSWORD_RATE_LIMIT_MAX) || 5,
});


const verificationLimiter = buildLimiter({
  windowMs:
    Number(process.env.VERIFICATION_RATE_LIMIT_WINDOW_MS) || 60 * 60 * 1000,
  max: Number(process.env.VERIFICATION_RATE_LIMIT_MAX) ||10,
});


const refreshTokenLimiter = buildLimiter({
  windowMs:
    Number(process.env.REFRESH_TOKEN_RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: Number(process.env.REFRESH_TOKEN_RATE_LIMIT_MAX) || 30,
});

export {
  loginLimiter,
  registerLimiter,
  forgotPasswordLimiter,
  resetPasswordLimiter,
  verificationLimiter,
  refreshTokenLimiter,
};