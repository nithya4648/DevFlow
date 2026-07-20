// frontend/src/services/snippet.service.js
import api from "./api";

export const snippetService = {
  getSnippets: (params = {}) =>
    api.get("/snippets", { params }).then((r) => r.data),

  getSnippetById: (id) =>
    api.get(`/snippets/${id}`).then((r) => r.data),

  createSnippet: (data) =>
    api.post("/snippets", data).then((r) => r.data),

  updateSnippet: (id, data) =>
    api.put(`/snippets/${id}`, data).then((r) => r.data),

  deleteSnippet: (id) =>
    api.delete(`/snippets/${id}`).then((r) => r.data),
};
