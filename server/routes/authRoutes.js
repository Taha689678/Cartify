const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const {
  loginLimiter,
  registerLimiter,
  forgotPasswordLimiter,
  resetPasswordLimiter,
  verificationLimiter,
  refreshTokenLimiter,
} = require("../middleware/rateLimitMiddleware");
const validateMiddleware = require("../middleware/validateMiddleware");
const {
  register,
  login,
  forgotPassword,
  resetPassword,
  verifyEmail,
  resendVerificationEmail,
  logout,
  refreshToken,
  getCurrentUser,
  changePassword,
} = require("../controllers/authController");
const {
  register: registerValidator,
  login: loginValidator,
  forgotPassword: forgotPasswordValidator,
  resetPassword: resetPasswordValidator,
  verifyEmail: verifyEmailValidator,
  resendVerificationEmail: resendVerificationValidator,
  changePassword: changePasswordValidator,
} = require("../validators/authValidator");

const attachVerifyTokenToBody = (req, res, next) => {
  if (req.query && req.query.token && !req.body?.token) {
    req.body = {
      ...(req.body || {}),
      token: req.query.token,
    };
  }
  return next();
};

router.post("/register", registerLimiter, validateMiddleware(registerValidator), register);
router.post("/login", loginLimiter, validateMiddleware(loginValidator), login);
router.post(
  "/forgot-password",
  forgotPasswordLimiter,
  validateMiddleware(forgotPasswordValidator),
  forgotPassword
);
router.post(
  "/reset-password",
  resetPasswordLimiter,
  validateMiddleware(resetPasswordValidator),
  resetPassword
);
router.get(
  "/verify-email",
  verificationLimiter,
  validateMiddleware({ query: verifyEmailValidator }),
  attachVerifyTokenToBody,
  verifyEmail
);
router.post(
  "/resend-verification",
  verificationLimiter,
  validateMiddleware(resendVerificationValidator),
  resendVerificationEmail
);

router.post("/logout", authMiddleware, logout);
router.post("/refresh", refreshTokenLimiter, refreshToken);
router.get("/me", authMiddleware, getCurrentUser);
router.post(
  "/change-password",
  authMiddleware,
  validateMiddleware(changePasswordValidator),
  changePassword
);

module.exports = router;
