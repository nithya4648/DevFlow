import api from "./api";

const getApiKeys = async () => {
  const response = await api.get("/api-keys");
  return response.data;
};

const createApiKey = async (data) => {
  const response = await api.post("/api-keys", data);
  return response.data;
};

const revokeApiKey = async (id) => {
  const response = await api.delete(`/api-keys/${id}`);
  return response.data;
};

export const apiKeyService = {
  getApiKeys,
  createApiKey,
  revokeApiKey,
};
