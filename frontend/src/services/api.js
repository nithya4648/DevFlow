import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || process.env.VITE_API_URL || "/api",
  withCredentials: true,
  timeout: 15000,
});

// Attach JWT token to every request if present
api.interceptors.request.use((config) => {
  const token = typeof window !== "undefined" ? localStorage.getItem("devflow_token") : null;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle global HTTP errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("devflow_token");
      // Optional: redirect to login if we are in browser and not already on login page
      if (typeof window !== "undefined" && !window.location.pathname.includes("/login") && !window.location.pathname.includes("/register") && !window.location.pathname.includes("/verify-email") && !window.location.pathname.includes("/reset-password") && !window.location.pathname.includes("/forgot-password")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
