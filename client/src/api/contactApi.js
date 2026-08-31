import api from "../services/api.js";

export const contactApi = {
  submit: (data) => api.post("/contact", data),
};
