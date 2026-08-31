import api from "../services/api.js";

export const newsletterApi = {
  subscribe: (email) => api.post("/newsletter/subscribe", { email }),
};
