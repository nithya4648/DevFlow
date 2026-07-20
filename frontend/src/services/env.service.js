// frontend/src/services/env.service.js
import api from "./api";

export const envService = {
  getEnvVars: (params = {}) =>
    api.get("/env-vars", { params }).then((r) => r.data),

  createEnvVar: (data) =>
    api.post("/env-vars", data).then((r) => r.data),

  updateEnvVar: (id, data) =>
    api.put(`/env-vars/${id}`, data).then((r) => r.data),

  deleteEnvVar: (id) =>
    api.delete(`/env-vars/${id}`).then((r) => r.data),
};
