import jwt from "jsonwebtoken";
import crypto from "crypto";
import ApiError from "../utils/apiError.js";

const JWT_ALGORITHM = "HS256";

const ACCESS_TOKEN_EXPIRES_IN = process.env.JWT_ACCESS_EXPIRES_IN || "15m";
const REFRESH_TOKEN_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || "7d";


const getRequiredSecret = (envVarName) => {
  const value = process.env[envVarName];
  if (!value) {
    console.error(
      `tokenService: missing required environment variable ${envVarName}`
    );
    throw new ApiError(500, "Server authentication configuration error");
  }
  return value;
};


const getAccessTokenSecret = () => getRequiredSecret("JWT_SECRET");


const getRefreshTokenSecret = () => getRequiredSecret("JWT_REFRESH_SECRET");


const generateAccessToken = (user) => {
  const id = user?._id ? user._id.toString() : user?.id;
  if (!id) {
    throw new ApiError(500, "Cannot generate access token without a user id");
  }

  const payload = { id, role: user.role };

  return jwt.sign(payload, getAccessTokenSecret(), {
    algorithm: JWT_ALGORITHM,
    expiresIn: ACCESS_TOKEN_EXPIRES_IN,
  });
};


const generateRefreshToken = (user, sessionId) => {
  const id = user?._id ? user._id.toString() : user?.id;
  if (!id || !sessionId) {
    throw new ApiError(
      500,
      "Cannot generate refresh token without a user id and session id"
    );
  }

  const payload = { id, sessionId: sessionId.toString() };

  return jwt.sign(payload, getRefreshTokenSecret(), {
    algorithm: JWT_ALGORITHM,
    expiresIn: REFRESH_TOKEN_EXPIRES_IN,
  });
};


const verifyAccessToken = (token) => {
  if (!token || typeof token !== "string") {
    throw new ApiError(401, "Invalid access token");
  }

  try {
    return jwt.verify(token, getAccessTokenSecret(), {
      algorithms: [JWT_ALGORITHM],
    });
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      throw new ApiError(401, "Access token expired");
    }
    throw new ApiError(401, "Invalid access token");
  }
};


const verifyRefreshToken = (token) => {
  if (!token || typeof token !== "string") {
    throw new ApiError(401, "Invalid refresh token");
  }

  try {
    return jwt.verify(token, getRefreshTokenSecret(), {
      algorithms: [JWT_ALGORITHM],
    });
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      throw new ApiError(401, "Refresh token expired");
    }
    throw new ApiError(401, "Invalid refresh token");
  }
};


const generateRandomToken = (bytes = 32) =>
  crypto.randomBytes(bytes).toString("hex");

export default {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  generateRandomToken,
};