import api from "../services/api.js";

export const categoryApi = {
  getAll: () => api.get("/categories"),
  getBySlug: (slug) => api.get(`/categories/${slug}`),
};

