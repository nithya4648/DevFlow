// frontend/src/services/comment.service.js
import api from "./api";

export const commentService = {
  getComments: (targetType, targetId) =>
    api.get(`/comments?targetType=${targetType}&targetId=${targetId}`).then((r) => r.data),
  createComment: (data) =>
    api.post("/comments", data).then((r) => r.data),
  deleteComment: (id) =>
    api.delete(`/comments/${id}`).then((r) => r.data),
};
