import {
  setAccessTokenCookie,
  setRefreshTokenCookie,
  clearAuthCookies as clearCookies,
} from "./cookies.js";


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

export {
  setAuthCookies,
  clearAuthCookies,
};
