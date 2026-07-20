// frontend/src/services/note.service.js
import api from "./api";

export const noteService = {
  getNotes: (params = {}) =>
    api.get("/notes", { params }).then((r) => r.data),

  createNote: (data) =>
    api.post("/notes", data).then((r) => r.data),

  updateNote: (id, data) =>
    api.put(`/notes/${id}`, data).then((r) => r.data),

  deleteNote: (id) =>
    api.delete(`/notes/${id}`).then((r) => r.data),
};
