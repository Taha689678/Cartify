import api from "../services/api.js";

export const authApi = {
  register: (data) => api.post("/auth/register", data),
  login: (data) => api.post("/auth/login", data),
  logout: () => api.post("/auth/logout"),
  refreshToken: () => api.post("/auth/refresh"),
  getCurrentUser: () => api.get("/auth/me"),
  verifyEmail: (token) => api.post("/auth/verify-email", { token }),
  resendVerificationEmail: (data) => api.post("/auth/resend-verification", data),
  forgotPassword: (data) => api.post("/auth/forgot-password", data),
  resetPassword: (data) => api.post("/auth/reset-password", data),
  changePassword: (data) => api.post("/auth/change-password", data),
};

