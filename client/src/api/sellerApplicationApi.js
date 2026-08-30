import api from "../services/api.js";

export const sellerApplicationApi = {
  submitApplication: (data) => api.post("/seller-applications", data),
  getMyApplication: () => api.get("/seller-applications/me"),
};
