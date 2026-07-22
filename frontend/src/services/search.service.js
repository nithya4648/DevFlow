// frontend/src/services/search.service.js
import api from "./api";

const search = async (q, type = "all") => {
  const params = new URLSearchParams({ q });
  if (type && type !== "all") params.set("type", type);
  const res = await api.get(`/search?${params.toString()}`);
  return res.data;
};

export const searchService = { search };
