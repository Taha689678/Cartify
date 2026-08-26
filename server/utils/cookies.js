const NODE_ENV = process.env.NODE_ENV || "development";
const IS_PRODUCTION = NODE_ENV === "production";


const COOKIE_SAME_SITE = process.env.COOKIE_SAME_SITE || (IS_PRODUCTION ? "none" : "lax");

const COOKIE_DOMAIN = process.env.COOKIE_DOMAIN || undefined;


const ACCESS_TOKEN_MAX_AGE_MS =
  Number(process.env.ACCESS_TOKEN_COOKIE_MAX_AGE_MS) || 15 * 60 * 1000;
const REFRESH_TOKEN_MAX_AGE_MS =
  Number(process.env.REFRESH_TOKEN_COOKIE_MAX_AGE_MS) || 7 * 24 * 60 * 60 * 1000;

// Cookie names — overridable via env in case of naming conflicts.
const ACCESS_TOKEN_COOKIE_NAME = process.env.ACCESS_TOKEN_COOKIE_NAME || "accessToken";
const REFRESH_TOKEN_COOKIE_NAME = process.env.REFRESH_TOKEN_COOKIE_NAME || "refreshToken";


const REFRESH_TOKEN_COOKIE_PATH = process.env.REFRESH_TOKEN_COOKIE_PATH || "/api/auth";
const ACCESS_TOKEN_COOKIE_PATH = "/";

// ---- Shared base options ---------------------------------------------

function baseCookieOptions() {
  return {
    httpOnly: true,
    secure: IS_PRODUCTION, // true in production, false for local HTTP dev
    sameSite: COOKIE_SAME_SITE,
    ...(COOKIE_DOMAIN ? { domain: COOKIE_DOMAIN } : {}),
  };
}

// ---- Public API ---------------------------------------------------------

/**
 * Sets the HTTP-only access token cookie.
 * @param {import('express').Response} res
 * @param {string} token - access token value (never logged, never returned)
 */
function setAccessTokenCookie(res, token) {
  res.cookie(ACCESS_TOKEN_COOKIE_NAME, token, {
    ...baseCookieOptions(),
    path: ACCESS_TOKEN_COOKIE_PATH,
    maxAge: ACCESS_TOKEN_MAX_AGE_MS,
  });
}

/**
 * Sets the HTTP-only refresh token cookie.
 * Scoped to a narrower path since only the refresh/logout endpoints
 * need to receive it.
 * @param {import('express').Response} res
 * @param {string} token - refresh token value (never logged, never returned)
 */
function setRefreshTokenCookie(res, token) {
  res.cookie(REFRESH_TOKEN_COOKIE_NAME, token, {
    ...baseCookieOptions(),
    path: REFRESH_TOKEN_COOKIE_PATH,
    maxAge: REFRESH_TOKEN_MAX_AGE_MS,
  });
}

/**
 * Clears both auth cookies. Must use the exact same attributes
 * (path, domain, sameSite, secure, httpOnly) used when the cookies
 * were set, or the browser will not recognize them as the same cookie
 * and will fail to clear them.
 * @param {import('express').Response} res
 */
function clearAuthCookies(res) {
  res.clearCookie(ACCESS_TOKEN_COOKIE_NAME, {
    ...baseCookieOptions(),
    path: ACCESS_TOKEN_COOKIE_PATH,
  });

  res.clearCookie(REFRESH_TOKEN_COOKIE_NAME, {
    ...baseCookieOptions(),
    path: REFRESH_TOKEN_COOKIE_PATH,
  });
}

module.exports = {
  setAccessTokenCookie,
  setRefreshTokenCookie,
  clearAuthCookies,
};