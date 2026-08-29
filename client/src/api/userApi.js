import api from "../services/api.js";

export const userApi = {
  getProfile: () => api.get("/users/me"),
  updateProfile: (data) => api.patch("/users/me", data),
};
