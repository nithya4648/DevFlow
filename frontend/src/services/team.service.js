// frontend/src/services/team.service.js
import api from "./api";

export const teamService = {
  getTeams: () => api.get("/teams").then((r) => r.data),
  getTeamById: (id) => api.get(`/teams/${id}`).then((r) => r.data),
  createTeam: (name) => api.post("/teams", { name }).then((r) => r.data),
  inviteMember: (id, email, role) => api.post(`/teams/${id}/members`, { email, role }).then((r) => r.data),
  changeRole: (id, userId, role) => api.put(`/teams/${id}/members/${userId}`, { role }).then((r) => r.data),
  removeMember: (id, userId) => api.delete(`/teams/${id}/members/${userId}`).then((r) => r.data),
  deleteTeam: (id) => api.delete(`/teams/${id}`).then((r) => r.data),
  getActivity: (id) => api.get(`/teams/${id}/activity`).then((r) => r.data),
};

