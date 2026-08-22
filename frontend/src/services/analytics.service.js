import api from "./api";

const getOverview = async () => {
  const response = await api.get("/analytics/overview");
  return response.data;
};

const logToolUsage = async (toolSlug) => {
  const response = await api.post("/analytics/tool-usage", { tool: toolSlug });
  return response.data;
};

const getContributions = async (days = 365) => {
  const response = await api.get(`/analytics/contributions?days=${days}`);
  return response.data;
};

const getMyActivity = async () => {
  const response = await api.get("/analytics/my-activity");
  return response.data;
};

export const analyticsService = {
  getOverview,
  logToolUsage,
  getContributions,
  getMyActivity,
};
