import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "https://devflow-vfnd.onrender.com/api",
  withCredentials: true,
  timeout: 60000,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      console.error(`[API Error] ${error.config?.method?.toUpperCase()} ${error.config?.url} → ${error.response.status}`);
    } else if (error.request) {
      console.error(`[API Network Error] ${error.config?.method?.toUpperCase()} ${error.config?.url} - Check CORS, Render cold-start`);
    } else {
      console.error("[API Error]", error.message);
    }

    if (error.response && error.response.status === 401) {
      if (typeof window !== "undefined" && !window.location.pathname.includes("/login") && !window.location.pathname.includes("/register")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
