import api from "./api";

const getOverview = async () => {
  const response = await api.get("/analytics/overview");
  return response.data;
};

const logToolUsage = async (toolSlug) => {
  const response = await api.post("/analytics/tool-usage", { tool: toolSlug });
  return response.data;
};

export const analyticsService = {
  getOverview,
  logToolUsage,
};
