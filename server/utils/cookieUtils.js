const {
  setAccessTokenCookie,
  setRefreshTokenCookie,
  clearAuthCookies: clearCookies,
} = require("./cookies");

/**
 * Sets both auth cookies using the project's existing secure cookie configuration.
 * This keeps the controller API simple while reusing the established cookie logic.
 */
const setAuthCookies = (res, { accessToken, refreshToken }) => {
  if (accessToken) {
    setAccessTokenCookie(res, accessToken);
  }

  if (refreshToken) {
    setRefreshTokenCookie(res, refreshToken);
  }
};

/**
 * Clears both auth cookies using the same path/domain settings as the project.
 */
const clearAuthCookies = (res) => {
  clearCookies(res);
};

module.exports = {
  setAuthCookies,
  clearAuthCookies,
};
