import authService from "../services/authService.js";
import ApiResponse from "../utils/apiResponse.js";
import ApiError from "../utils/apiError.js";
import { setAuthCookies, clearAuthCookies } from "../utils/cookieUtils.js";

/**
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = async (req, res, next) => {
  try {
    const { name, username, email, password, phone } = req.body;

    const user = await authService.registerUser({
      name,
      username,
      email,
      password,
      phone,
    });

    return res
      .status(201)
      .json(
        new ApiResponse(
          201,
          "Registration successful. Please verify your email.",
          { user }
        )
      );
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const { user, accessToken, refreshToken } = await authService.loginUser({
      email,
      password,
      userAgent: req.headers["user-agent"],
      ipAddress: req.ip,
    });

    setAuthCookies(res, { accessToken, refreshToken });

    return res
      .status(200)
      .json(new ApiResponse(200, "Login successful", { user }));
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/auth/logout
 * @access  Private
 */
const logout = async (req, res, next) => {
  try {
    const refreshToken = req.cookies?.refreshToken;

    await authService.logoutUser({ refreshToken, userId: req.user?.id });

    clearAuthCookies(res);

    return res.status(200).json(new ApiResponse(200, "Logout successful"));
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/auth/refresh-token
 * @access  Public (requires valid refresh token cookie)
 */
const refreshToken = async (req, res, next) => {
  try {
    const incomingRefreshToken = req.cookies?.refreshToken;

    if (!incomingRefreshToken) {
      throw new ApiError(401, "Refresh token is required");
    }

    const { accessToken, refreshToken: newRefreshToken } =
      await authService.rotateRefreshToken({
        refreshToken: incomingRefreshToken,
        userAgent: req.headers["user-agent"],
        ipAddress: req.ip,
      });

    setAuthCookies(res, { accessToken, refreshToken: newRefreshToken });

    return res
      .status(200)
      .json(new ApiResponse(200, "Token refreshed successfully"));
  } catch (error) {
    clearAuthCookies(res);
    next(error);
  }
};

/**
 * @route   GET /api/auth/me
 * @access  Private
 */
const getCurrentUser = async (req, res, next) => {
  try {
    const user = await authService.getUserById(req.user.id);

    return res
      .status(200)
      .json(new ApiResponse(200, "Current user fetched successfully", { user }));
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/auth/verify-email
 * @access  Public
 */
const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.body;

    if (!token) {
      throw new ApiError(400, "Verification token is required");
    }

    await authService.verifyEmail({ token });

    return res
      .status(200)
      .json(new ApiResponse(200, "Email verified successfully"));
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/auth/resend-verification
 * @access  Public
 */
const resendVerificationEmail = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      throw new ApiError(400, "Email is required");
    }

    await authService.resendVerificationEmail({ email });

   
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          "If an account with that email exists and is unverified, a verification email has been sent."
        )
      );
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/auth/forgot-password
 * @access  Public
 */
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      throw new ApiError(400, "Email is required");
    }

    await authService.forgotPassword({ email });

    // Intentionally identical response whether or not the email exists,
    // so this endpoint can't be used to enumerate registered accounts.
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          "If an account with that email exists, a password reset link has been sent."
        )
      );
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/auth/reset-password
 * @access  Public
 */
const resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      throw new ApiError(400, "Token and new password are required");
    }

    await authService.resetPassword({ token, newPassword });

    return res
      .status(200)
      .json(new ApiResponse(200, "Password reset successfully"));
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/auth/change-password
 * @access  Private
 */
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      throw new ApiError(
        400,
        "Current password and new password are required"
      );
    }

    await authService.changePassword({
      userId: req.user.id,
      currentPassword,
      newPassword,
    });

    return res
      .status(200)
      .json(new ApiResponse(200, "Password changed successfully"));
  } catch (error) {
    next(error);
  }
};

export {
  register,
  login,
  logout,
  refreshToken,
  getCurrentUser,
  verifyEmail,
  resendVerificationEmail,
  forgotPassword,
  resetPassword,
  changePassword,
};