const {
  setAccessTokenCookie,
  setRefreshTokenCookie,
  clearAuthCookies: clearCookies,
} = require("./cookies");


const setAuthCookies = (res, { accessToken, refreshToken }) => {
  if (accessToken) {
    setAccessTokenCookie(res, accessToken);
  }

  if (refreshToken) {
    setRefreshTokenCookie(res, refreshToken);
  }
};


const clearAuthCookies = (res) => {
  clearCookies(res);
};

module.exports = {
  setAuthCookies,
  clearAuthCookies,
};
