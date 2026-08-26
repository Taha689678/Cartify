import express from "express";
const router = express.Router();

import authMiddleware from "../middleware/authMiddleware.js";
import {
  loginLimiter,
  registerLimiter,
  forgotPasswordLimiter,
  resetPasswordLimiter,
  verificationLimiter,
  refreshTokenLimiter,
} from "../middleware/rateLimitMiddleware.js";
import validateMiddleware from "../middleware/validateMiddleware.js";
import {
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
} from "../controllers/authController.js";
import {
  register as registerValidator,
  login as loginValidator,
  forgotPassword as forgotPasswordValidator,
  resetPassword as resetPasswordValidator,
  verifyEmail as verifyEmailValidator,
  resendVerificationEmail as resendVerificationValidator,
  changePassword as changePasswordValidator,
} from "../validators/authValidator.js";

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

export default router;
