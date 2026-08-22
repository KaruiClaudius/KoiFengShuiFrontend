import axios from "axios";

const baseUrl = import.meta.env.VITE_API_URL || "https://localhost:7285";

const api = axios.create({
  baseURL: baseUrl,
});

// Attach the auth token to every request
const handleBefore = (config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  return config;
};

api.interceptors.request.use(handleBefore, null);

// Clear the session when the API reports an expired/invalid token
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("token");
      if (window.location.pathname !== "/auth") {
        window.location.href = "/auth";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
