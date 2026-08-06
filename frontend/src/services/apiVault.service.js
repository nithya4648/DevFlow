// frontend/src/services/apiVault.service.js
import api from "./api";

export const apiVaultService = {
  listVaults: (params = {}) =>
    api.get("/api-vault", { params }).then((r) => r.data),

  createVault: (data) =>
    api.post("/api-vault", data).then((r) => r.data),

  getVault: (id) =>
    api.get(`/api-vault/${id}`).then((r) => r.data),

  updateVault: (id, data) =>
    api.put(`/api-vault/${id}`, data).then((r) => r.data),

  deleteVault: (id) =>
    api.delete(`/api-vault/${id}`).then((r) => r.data),

  revealVault: (id) =>
    api.get(`/api-vault/${id}/reveal`).then((r) => r.data),

  toggleActive: (id) =>
    api.patch(`/api-vault/${id}/toggle`).then((r) => r.data),
};
