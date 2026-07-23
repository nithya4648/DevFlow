import api from "./api";

const updateProfile = async (formData) => {
  const response = await api.put("/users/profile", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

const updatePassword = async (data) => {
  const response = await api.put("/users/password", data);
  return response.data;
};

const updatePreferences = async (data) => {
  const response = await api.put("/users/preferences", data);
  return response.data;
};

const getSessions = async () => {
  const response = await api.get("/users/sessions");
  return response.data;
};

const revokeSession = async (id) => {
  const response = await api.delete(`/users/sessions/${id}`);
  return response.data;
};

export const userService = {
  updateProfile,
  updatePassword,
  updatePreferences,
  getSessions,
  revokeSession,
};
