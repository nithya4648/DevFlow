// frontend/src/services/project.service.js
import api from "./api";

export const projectService = {
  getProjects: (params = {}) =>
    api.get("/projects", { params }).then((r) => r.data),

  getProjectById: (id) =>
    api.get(`/projects/${id}`).then((r) => r.data),

  createProject: (data) =>
    api.post("/projects", data).then((r) => r.data),

  updateProject: (id, data) =>
    api.put(`/projects/${id}`, data).then((r) => r.data),

  deleteProject: (id) =>
    api.delete(`/projects/${id}`).then((r) => r.data),
};
