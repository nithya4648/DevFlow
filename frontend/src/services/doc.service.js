// frontend/src/services/doc.service.js
import api from "./api";

export const docService = {
  getDocs: (params = {}) =>
    api.get("/docs", { params }).then((r) => r.data),

  getDocById: (id) =>
    api.get(`/docs/${id}`).then((r) => r.data),

  createDoc: (data) =>
    api.post("/docs", data).then((r) => r.data),

  updateDoc: (id, data) =>
    api.put(`/docs/${id}`, data).then((r) => r.data),

  deleteDoc: (id) =>
    api.delete(`/docs/${id}`).then((r) => r.data),

  getVersions: (docId) =>
    api.get(`/docs/${docId}/versions`).then((r) => r.data),

  getVersionById: (docId, versionId) =>
    api.get(`/docs/${docId}/versions/${versionId}`).then((r) => r.data),
};
