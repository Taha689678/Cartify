'use strict';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USERNAME_REGEX = /^[a-zA-Z0-9_]+$/;
const PHONE_REGEX = /^[0-9+\-\s()]{7,20}$/;

const normalizeEmail = (value) =>
  typeof value === "string" ? value.trim().toLowerCase() : value;

const trimString = (value) =>
  typeof value === "string" ? value.trim() : value;

const makeError = (field, message) => ({ field, message });

const rejectUnexpectedFields = (payload, allowedFields, fieldName = "body") => {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return [makeError(fieldName, "Request data must be an object")];
  }

  const allowed = new Set(allowedFields);
  const unexpected = Object.keys(payload).filter((key) => !allowed.has(key));

  return unexpected.map((key) => {
    if (key === "role") {
      return makeError(
        key,
        "Role is not allowed during self-registration. Only customer accounts can be created here."
      );
    }

    return makeError(key, `Unexpected field "${key}" is not allowed`);
  });
};

const validatePasswordPolicy = (password, context = {}) => {
  const errors = [];

  if (typeof password !== "string") {
    return ["Password must be a string"];
  }

  const trimmedPassword = password.trim();

  if (trimmedPassword.length < 8 || trimmedPassword.length > 128) {
    errors.push("Password must be between 8 and 128 characters long");
  }

  if (/\s/.test(password)) {
    errors.push("Password cannot contain spaces");
  }

  if (!/[a-z]/.test(password)) {
    errors.push("Password must include at least one lowercase letter");
  }

  if (!/[A-Z]/.test(password)) {
    errors.push("Password must include at least one uppercase letter");
  }

  if (!/\d/.test(password)) {
    errors.push("Password must include at least one number");
  }

  if (!/[^A-Za-z0-9]/.test(password)) {
    errors.push("Password must include at least one special character");
  }

  const lowerPassword = password.toLowerCase();
  const bannedFragments = [
    String(context.name || "").trim().toLowerCase(),
    String(context.username || "").trim().toLowerCase(),
    String(context.email || "").split("@")[0].trim().toLowerCase(),
  ].filter((part) => part && part.length > 2);

  for (const fragment of new Set(bannedFragments)) {
    if (lowerPassword.includes(fragment)) {
      errors.push("Password cannot contain your name, username, or email");
      break;
    }
  }

  return errors;
};

const validateRequestObject = (payload, allowedFields) => {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return { errors: [makeError("body", "Request data must be an object")], value: undefined };
  }

  const errors = rejectUnexpectedFields(payload, allowedFields);
  return { errors, value: payload };
};

const register = (data = {}) => {
  const { errors: baseErrors, value: payload } = validateRequestObject(data, [
    "name",
    "username",
    "email",
    "password",
    "phone",
  ]);

  const errors = [...baseErrors];

  if (errors.length > 0) {
    return { errors, value: undefined };
  }

  const name = trimString(payload.name);
  const username = trimString(payload.username);
  const email = normalizeEmail(payload.email);
  const password = typeof payload.password === "string" ? payload.password : "";
  const phone = trimString(payload.phone);

  if (!name) {
    errors.push(makeError("name", "Name is required"));
  } else if (name.length < 2 || name.length > 50) {
    errors.push(makeError("name", "Name must be between 2 and 50 characters long"));
  }

  if (!username) {
    errors.push(makeError("username", "Username is required"));
  } else if (username.length < 3 || username.length > 30) {
    errors.push(makeError("username", "Username must be between 3 and 30 characters long"));
  } else if (!USERNAME_REGEX.test(username)) {
    errors.push(makeError("username", "Username can only contain letters, numbers, and underscores"));
  }

  if (!email) {
    errors.push(makeError("email", "Email is required"));
  } else if (!EMAIL_REGEX.test(email)) {
    errors.push(makeError("email", "Please enter a valid email address"));
  }

  const passwordErrors = validatePasswordPolicy(password, { name, username, email });
  passwordErrors.forEach((message) => errors.push(makeError("password", message)));

  if (payload.phone !== undefined && payload.phone !== null && payload.phone !== "") {
    if (typeof phone !== "string" || !PHONE_REGEX.test(phone) || phone.length < 7) {
      errors.push(makeError("phone", "Please enter a valid phone number"));
    }
  }

  if (Object.prototype.hasOwnProperty.call(payload, "role")) {
    errors.push(
      makeError(
        "role",
        "Role is not allowed during self-registration. Registration is restricted to customer accounts."
      )
    );
  }

  if (errors.length > 0) {
    return { errors, value: undefined };
  }

  const sanitized = {
    name,
    username: username.toLowerCase(),
    email,
    password,
  };

  if (phone) {
    sanitized.phone = phone;
  }

  return { errors: null, value: sanitized };
};

const login = (data = {}) => {
  const { errors: baseErrors, value: payload } = validateRequestObject(data, [
    "email",
    "password",
  ]);

  const errors = [...baseErrors];

  if (errors.length > 0) {
    return { errors, value: undefined };
  }

  const email = normalizeEmail(payload.email);
  const password = typeof payload.password === "string" ? payload.password : "";

  if (!email) {
    errors.push(makeError("email", "Email is required"));
  } else if (!EMAIL_REGEX.test(email)) {
    errors.push(makeError("email", "Please enter a valid email address"));
  }

  if (!password) {
    errors.push(makeError("password", "Password is required"));
  }

  if (errors.length > 0) {
    return { errors, value: undefined };
  }

  return {
    errors: null,
    value: {
      email,
      password,
    },
  };
};

const forgotPassword = (data = {}) => {
  const { errors: baseErrors, value: payload } = validateRequestObject(data, ["email"]);

  const errors = [...baseErrors];

  if (errors.length > 0) {
    return { errors, value: undefined };
  }

  const email = normalizeEmail(payload.email);

  if (!email) {
    errors.push(makeError("email", "Email is required"));
  } else if (!EMAIL_REGEX.test(email)) {
    errors.push(makeError("email", "Please enter a valid email address"));
  }

  if (errors.length > 0) {
    return { errors, value: undefined };
  }

  return { errors: null, value: { email } };
};

const resetPassword = (data = {}) => {
  const { errors: baseErrors, value: payload } = validateRequestObject(data, [
    "token",
    "newPassword",
    "confirmPassword",
  ]);

  const errors = [...baseErrors];

  if (errors.length > 0) {
    return { errors, value: undefined };
  }

  const token = trimString(payload.token);
  const newPassword = typeof payload.newPassword === "string" ? payload.newPassword : "";
  const confirmPassword = typeof payload.confirmPassword === "string" ? payload.confirmPassword : "";

  if (!token) {
    errors.push(makeError("token", "Password reset token is required"));
  }

  const passwordErrors = validatePasswordPolicy(newPassword);
  passwordErrors.forEach((message) => errors.push(makeError("newPassword", message)));

  if (confirmPassword !== "" && newPassword !== confirmPassword) {
    errors.push(makeError("confirmPassword", "Passwords do not match"));
  }

  if (errors.length > 0) {
    return { errors, value: undefined };
  }

  return {
    errors: null,
    value: {
      token,
      newPassword,
      ...(confirmPassword ? { confirmPassword } : {}),
    },
  };
};

const changePassword = (data = {}) => {
  const { errors: baseErrors, value: payload } = validateRequestObject(data, [
    "currentPassword",
    "newPassword",
    "confirmPassword",
  ]);

  const errors = [...baseErrors];

  if (errors.length > 0) {
    return { errors, value: undefined };
  }

  const currentPassword = typeof payload.currentPassword === "string" ? payload.currentPassword : "";
  const newPassword = typeof payload.newPassword === "string" ? payload.newPassword : "";
  const confirmPassword = typeof payload.confirmPassword === "string" ? payload.confirmPassword : "";

  if (!currentPassword) {
    errors.push(makeError("currentPassword", "Current password is required"));
  }

  if (!newPassword) {
    errors.push(makeError("newPassword", "New password is required"));
  } else if (newPassword === currentPassword) {
    errors.push(makeError("newPassword", "New password must be different from the current password"));
  } else {
    const passwordErrors = validatePasswordPolicy(newPassword);
    passwordErrors.forEach((message) => errors.push(makeError("newPassword", message)));
  }

  if (confirmPassword !== "" && newPassword !== confirmPassword) {
    errors.push(makeError("confirmPassword", "Passwords do not match"));
  }

  if (errors.length > 0) {
    return { errors, value: undefined };
  }

  return {
    errors: null,
    value: {
      currentPassword,
      newPassword,
      ...(confirmPassword ? { confirmPassword } : {}),
    },
  };
};

const verifyEmail = (data = {}) => {
  const { errors: baseErrors, value: payload } = validateRequestObject(data, ["token"]);

  const errors = [...baseErrors];

  if (errors.length > 0) {
    return { errors, value: undefined };
  }

  const token = trimString(payload.token);

  if (!token) {
    errors.push(makeError("token", "Verification token is required"));
  }

  if (errors.length > 0) {
    return { errors, value: undefined };
  }

  return {
    errors: null,
    value: { token },
  };
};

const resendVerificationEmail = (data = {}) => {
  const { errors: baseErrors, value: payload } = validateRequestObject(data, ["email"]);

  const errors = [...baseErrors];

  if (errors.length > 0) {
    return { errors, value: undefined };
  }

  const email = normalizeEmail(payload.email);

  if (!email) {
    errors.push(makeError("email", "Email is required"));
  } else if (!EMAIL_REGEX.test(email)) {
    errors.push(makeError("email", "Please enter a valid email address"));
  }

  if (errors.length > 0) {
    return { errors, value: undefined };
  }

  return {
    errors: null,
    value: { email },
  };
};

const refreshToken = (data = {}) => {
  const payload =
    data && typeof data === "object" && !Array.isArray(data)
      ? data
      : { refreshToken: data };

  const { errors: baseErrors, value: request } = validateRequestObject(payload, [
    "refreshToken",
  ]);

  const errors = [...baseErrors];

  if (errors.length > 0) {
    return { errors, value: undefined };
  }

  const refreshTokenValue = trimString(request.refreshToken);

  if (!refreshTokenValue) {
    errors.push(makeError("refreshToken", "Refresh token is required"));
  }

  if (errors.length > 0) {
    return { errors, value: undefined };
  }

  return {
    errors: null,
    value: { refreshToken: refreshTokenValue },
  };
};

module.exports = {
  register,
  login,
  forgotPassword,
  resetPassword,
  changePassword,
  verifyEmail,
  resendVerificationEmail,
  refreshToken,
};
