// frontend/src/services/bookmark.service.js
import api from "./api";

export const bookmarkService = {
  getBookmarks: (params = {}) =>
    api.get("/bookmarks", { params }).then((r) => r.data),

  createBookmark: (data) =>
    api.post("/bookmarks", data).then((r) => r.data),

  updateBookmark: (id, data) =>
    api.put(`/bookmarks/${id}`, data).then((r) => r.data),

  deleteBookmark: (id) =>
    api.delete(`/bookmarks/${id}`).then((r) => r.data),
};
