const crypto = require("crypto");
const bcrypt = require("bcryptjs");

const User = require("../models/User");
const Session = require("../models/Session");
const Seller = require("../models/Seller");
const tokenService = require("./tokenService");
const emailService = require("./emailService");
const hashToken = require("../utils/hashToken");
const ApiError = require("../utils/apiError");

const BCRYPT_SALT_ROUNDS = Number(process.env.BCRYPT_SALT_ROUNDS) || 12;
const REFRESH_TOKEN_TTL_MS =
  Number(process.env.REFRESH_TOKEN_TTL_MS) || 7 * 24 * 60 * 60 * 1000; // 7 days
const EMAIL_VERIFICATION_TTL_MS =
  Number(process.env.EMAIL_VERIFICATION_TTL_MS) || 24 * 60 * 60 * 1000; // 24 hours
const PASSWORD_RESET_TTL_MS =
  Number(process.env.PASSWORD_RESET_TTL_MS) || 60 * 60 * 1000; // 1 hour
const REQUIRE_EMAIL_VERIFICATION =
  process.env.REQUIRE_EMAIL_VERIFICATION !== "false"; // default: required

// ---------------------------------------------------------------------------
// Internal helpers (not exported — implementation details of this service)
// ---------------------------------------------------------------------------

/** Strips password and any sensitive fields before data ever leaves this service. */
const toSafeUser = (user) => ({
  id: user._id.toString(),
  name: user.name,
  username: user.username,
  email: user.email,
  phone: user.phone,
  avatar: user.avatar,
  role: user.role,
  isVerified: user.isVerified,
  isBlocked: user.isBlocked,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

/** Cryptographically secure random token, returned as hex. */
const generateSecureToken = (bytes = 32) =>
  crypto.randomBytes(bytes).toString("hex");

/**
 * Builds a new refresh token bound to a specific session.
 * Format: "<sessionId>.<secret>" — the sessionId lets refresh/logout look
 * the session up directly by _id (fast, indexed), while only the hash of
 * the secret half is ever stored, so a stolen DB row can't be replayed.
 */
const buildRefreshToken = (sessionId) => {
  const secret = generateSecureToken(40);
  return {
    token: `${sessionId}.${secret}`,
    secretHash: hashToken(secret),
  };
};

/** Parses a "<sessionId>.<secret>" refresh token. Returns null if malformed. */
const parseRefreshToken = (refreshToken) => {
  if (typeof refreshToken !== "string") return null;
  const separatorIndex = refreshToken.indexOf(".");
  if (separatorIndex <= 0) return null;

  const sessionId = refreshToken.slice(0, separatorIndex);
  const secret = refreshToken.slice(separatorIndex + 1);
  if (!sessionId || !secret) return null;

  return { sessionId, secret };
};

const issueAccessToken = (user) =>
  tokenService.generateAccessToken({
    id: user._id.toString(),
    role: user.role,
  });

// ---------------------------------------------------------------------------
// registerUser
// ---------------------------------------------------------------------------
const registerUser = async ({ name, username, email, password, phone }) => {
  // NOTE: this function intentionally does not accept a `role` argument at
  // all, anywhere in its signature — that's what makes self-registration as
  // admin structurally impossible, not just a runtime check. The User model
  // itself defaults role to "customer".
  if (!name || !username || !email || !password) {
    throw new ApiError(400, "Name, username, email, and password are required");
  }

  const normalizedEmail = email.toLowerCase().trim();
  const normalizedUsername = username.toLowerCase().trim();

  const existingUser = await User.findOne({
    $or: [{ email: normalizedEmail }, { username: normalizedUsername }],
  });

  if (existingUser) {
    throw new ApiError(409, "An account with this email or username already exists");
  }

  const passwordHash = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);

  const user = new User({
    name,
    username: normalizedUsername,
    email: normalizedEmail,
    password: passwordHash,
    phone,
    role: "customer",
  });

  const verificationSecret = generateSecureToken(32);
  user.emailVerificationTokenHash = hashToken(verificationSecret);
  user.emailVerificationTokenExpiresAt = new Date(
    Date.now() + EMAIL_VERIFICATION_TTL_MS
  );

  await user.save();

  // Best-effort: registration should still succeed even if the email
  // provider has a transient failure — the user can request a resend.
  try {
    await emailService.sendVerificationEmail({
      to: user.email,
      name: user.name,
      token: verificationSecret,
    });
  } catch (emailError) {
    // Never let email delivery failure leak into the API response or logs
    // with sensitive content; registration itself already succeeded.
  }

  return toSafeUser(user);
};

// ---------------------------------------------------------------------------
// loginUser
// ---------------------------------------------------------------------------
const loginUser = async ({ email, password, userAgent, ipAddress }) => {
  if (!email || !password) {
    throw new ApiError(400, "Email and password are required");
  }

  const normalizedEmail = email.toLowerCase().trim();

  // Generic message on purpose: never reveal whether the email exists or
  // the password was wrong — both fail identically.
  const invalidCredentialsError = new ApiError(401, "Invalid email or password");

  const user = await User.findOne({ email: normalizedEmail }).select("+password");
  if (!user) {
    throw invalidCredentialsError;
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw invalidCredentialsError;
  }

  if (user.isBlocked) {
    throw new ApiError(403, "Your account has been blocked");
  }

  if (REQUIRE_EMAIL_VERIFICATION && !user.isVerified) {
    throw new ApiError(403, "Please verify your email before logging in");
  }

  // Create the session first so Mongoose assigns its _id, which the
  // refresh token is then bound to (see buildRefreshToken).
  const session = new Session({
    user: user._id,
    refreshTokenHash: "pending", // placeholder, overwritten below before save
    expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
    userAgent: userAgent || "",
    ipAddress: ipAddress || "",
  });

  const { token: refreshToken, secretHash } = buildRefreshToken(session._id);
  session.refreshTokenHash = secretHash;
  await session.save();

  const accessToken = issueAccessToken(user);

  return { user: toSafeUser(user), accessToken, refreshToken };
};

// ---------------------------------------------------------------------------
// logoutUser
// ---------------------------------------------------------------------------
const logoutUser = async ({ refreshToken, userId }) => {
  const parsed = parseRefreshToken(refreshToken);

  // Logout is idempotent and never trusts a bare client-supplied session
  // ID — the only thing that identifies "which session" is the refresh
  // token itself (sessionId + secret), optionally scoped further to the
  // currently authenticated user for defense in depth.
  if (!parsed) return;

  const session = await Session.findById(parsed.sessionId);
  if (!session) return;

  if (userId && session.user.toString() !== userId.toString()) return;

  const providedHash = hashToken(parsed.secret);
  if (providedHash !== session.refreshTokenHash) return;

  await Session.deleteOne({ _id: session._id });
};

// ---------------------------------------------------------------------------
// refreshUserToken
// ---------------------------------------------------------------------------
const refreshUserToken = async ({ refreshToken, userAgent, ipAddress }) => {
  const parsed = parseRefreshToken(refreshToken);
  if (!parsed) {
    throw new ApiError(401, "Invalid session, please log in again");
  }

  const session = await Session.findById(parsed.sessionId);
  if (!session || session.expiresAt.getTime() <= Date.now()) {
    throw new ApiError(401, "Session expired, please log in again");
  }

  const providedHash = hashToken(parsed.secret);

  if (providedHash !== session.refreshTokenHash) {
    // The session exists and isn't expired, but the secret doesn't match
    // the currently-valid one — this is the signature of a rotated-out
    // (already-used) refresh token being replayed. Treat the whole
    // session as compromised and revoke it immediately.
    await Session.deleteOne({ _id: session._id });
    throw new ApiError(
      401,
      "This session is no longer valid, please log in again"
    );
  }

  const user = await User.findById(session.user);
  if (!user) {
    await Session.deleteOne({ _id: session._id });
    throw new ApiError(401, "Invalid session, please log in again");
  }

  if (user.isBlocked) {
    await Session.deleteOne({ _id: session._id });
    throw new ApiError(403, "Your account has been blocked");
  }

  // Rotate: issue a brand-new secret bound to the SAME session document,
  // replace the stored hash, and extend expiry.
  const { token: newRefreshToken, secretHash } = buildRefreshToken(session._id);
  session.refreshTokenHash = secretHash;
  session.expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_MS);
  session.userAgent = userAgent || session.userAgent;
  session.ipAddress = ipAddress || session.ipAddress;
  await session.save();

  const accessToken = issueAccessToken(user);

  return { accessToken, refreshToken: newRefreshToken };
};

// ---------------------------------------------------------------------------
// getCurrentUser
// ---------------------------------------------------------------------------
const getCurrentUser = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const safeUser = toSafeUser(user);

  if (user.role === "seller") {
    const seller = await Seller.findOne({ user: user._id }).select(
      "storeName storeSlug status"
    );
    if (seller) {
      safeUser.seller = {
        id: seller._id.toString(),
        storeName: seller.storeName,
        storeSlug: seller.storeSlug,
        status: seller.status,
      };
    }
  }

  return safeUser;
};

// ---------------------------------------------------------------------------
// verifyUserEmail
// ---------------------------------------------------------------------------
const verifyUserEmail = async ({ token }) => {
  if (!token) {
    throw new ApiError(400, "Verification token is required");
  }

  const tokenHash = hashToken(token);

  const user = await User.findOne({ emailVerificationTokenHash: tokenHash }).select(
    "+emailVerificationTokenHash +emailVerificationTokenExpiresAt"
  );

  if (
    !user ||
    !user.emailVerificationTokenExpiresAt ||
    user.emailVerificationTokenExpiresAt.getTime() <= Date.now()
  ) {
    throw new ApiError(400, "Invalid or expired verification token");
  }

  user.isVerified = true;
  // Single-use: clear the token immediately so it can never be replayed.
  user.emailVerificationTokenHash = undefined;
  user.emailVerificationTokenExpiresAt = undefined;
  await user.save();
};

// ---------------------------------------------------------------------------
// resendVerificationEmail
// ---------------------------------------------------------------------------
const resendVerificationEmail = async ({ email }) => {
  if (!email) return; // controller already returns a generic response either way

  const user = await User.findOne({ email: email.toLowerCase().trim() });

  // Silently do nothing if the account doesn't exist or is already
  // verified — the controller returns the same generic message regardless.
  if (!user || user.isVerified) return;

  const verificationSecret = generateSecureToken(32);
  user.emailVerificationTokenHash = hashToken(verificationSecret);
  user.emailVerificationTokenExpiresAt = new Date(
    Date.now() + EMAIL_VERIFICATION_TTL_MS
  );
  await user.save();

  try {
    await emailService.sendVerificationEmail({
      to: user.email,
      name: user.name,
      token: verificationSecret,
    });
  } catch (emailError) {
    // Swallow: don't leak delivery failures to the client or logs.
  }
};

// ---------------------------------------------------------------------------
// requestPasswordReset
// ---------------------------------------------------------------------------
const requestPasswordReset = async ({ email }) => {
  if (!email) return; // controller returns the same generic message regardless

  const user = await User.findOne({ email: email.toLowerCase().trim() });

  // Deliberately silent no-op if the account doesn't exist — this is what
  // prevents forgot-password from being used to enumerate accounts.
  if (!user) return;

  const resetSecret = generateSecureToken(32);
  user.passwordResetTokenHash = hashToken(resetSecret);
  user.passwordResetTokenExpiresAt = new Date(Date.now() + PASSWORD_RESET_TTL_MS);
  await user.save();

  try {
    await emailService.sendPasswordResetEmail({
      to: user.email,
      name: user.name,
      token: resetSecret,
    });
  } catch (emailError) {
    // Swallow: don't leak delivery failures to the client or logs.
  }
};

// ---------------------------------------------------------------------------
// resetUserPassword
// ---------------------------------------------------------------------------
const resetUserPassword = async ({ token, newPassword }) => {
  if (!token || !newPassword) {
    throw new ApiError(400, "Token and new password are required");
  }

  const tokenHash = hashToken(token);

  const user = await User.findOne({ passwordResetTokenHash: tokenHash });

  if (
    !user ||
    !user.passwordResetTokenExpiresAt ||
    user.passwordResetTokenExpiresAt.getTime() <= Date.now()
  ) {
    throw new ApiError(400, "Invalid or expired reset token");
  }

  user.password = await bcrypt.hash(newPassword, BCRYPT_SALT_ROUNDS);
  // Single-use: clear the reset token immediately.
  user.passwordResetTokenHash = undefined;
  user.passwordResetTokenExpiresAt = undefined;
  await user.save();

  // A password reset is a strong signal the account may have been
  // compromised — log every existing session out, everywhere.
  await Session.deleteMany({ user: user._id });
};

// ---------------------------------------------------------------------------
// changeUserPassword
// ---------------------------------------------------------------------------
const changeUserPassword = async ({ userId, currentPassword, newPassword }) => {
  if (!currentPassword || !newPassword) {
    throw new ApiError(400, "Current password and new password are required");
  }

  const user = await User.findById(userId).select("+password");
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const isCurrentPasswordValid = await bcrypt.compare(
    currentPassword,
    user.password
  );
  if (!isCurrentPasswordValid) {
    throw new ApiError(401, "Current password is incorrect");
  }

  user.password = await bcrypt.hash(newPassword, BCRYPT_SALT_ROUNDS);
  await user.save();


  await Session.deleteMany({ user: user._id });
};

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  refreshUserToken,
  getCurrentUser,
  verifyUserEmail,
  resendVerificationEmail,
  requestPasswordReset,
  resetUserPassword,
  changeUserPassword,


  rotateRefreshToken: refreshUserToken,
  getUserById: getCurrentUser,
  verifyEmail: verifyUserEmail,
  forgotPassword: requestPasswordReset,
  resetPassword: resetUserPassword,
  changePassword: changeUserPassword,
};