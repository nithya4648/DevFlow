import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "https://devflow-vfnd.onrender.com/api",
  withCredentials: true,
  timeout: 60000,
});


// Handle global HTTP errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Log structured diagnostic message in console to avoid raw minified stack traces
    if (error.response) {
      console.warn(
        `[API Error] ${error.config?.method?.toUpperCase()} ${error.config?.url} returned ${error.response.status}:`,
        error.response.data
      );
    } else if (error.request) {
      console.error(
        `[API Network Error] ${error.config?.method?.toUpperCase()} ${error.config?.url} - Server unreachable. Check CORS configuration, Render spin-up/cold-start, or network status:`,
        error.message
      );
    } else {
      console.error("[API Error] Request configuration failure:", error.message);
    }

    if (error.response && error.response.status === 401) {
      // Optional: redirect to login if we are in browser and not already on an auth page
      if (
        typeof window !== "undefined" &&
        !window.location.pathname.includes("/login") &&
        !window.location.pathname.includes("/register") &&
        !window.location.pathname.includes("/verify-email") &&
        !window.location.pathname.includes("/reset-password") &&
        !window.location.pathname.includes("/forgot-password")
      ) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
