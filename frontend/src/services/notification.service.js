// frontend/src/services/notification.service.js
import api from "./api";

export const notificationService = {
  getNotifications: (params = {}) =>
    api.get("/notifications", { params }).then((r) => r.data),

  markAsRead: (id) =>
    api.patch(`/notifications/${id}/read`).then((r) => r.data),

  markAllAsRead: () =>
    api.patch("/notifications/mark-all-read").then((r) => r.data),
};
