import axios from "axios";
const baseUrl = "https://localhost:7285";

const config = {
  baseUrl: baseUrl,
};

const api = axios.create(config);

api.defaults.baseURL = baseUrl;

// handle before call api
const handleBefore = (config) => {
  // Handle actions before the API call

  // Retrieve the token and attach it to the request headers
  const token = localStorage.getItem("token")?.replaceAll("", "");
  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`; // Use backticks for token interpolation
  }
  return config;
};

api.interceptors.request.use(handleBefore, null);

export const assessCompatibility = (data) => {
  return api.post("/api/Compatibility/lookup", data);
};

export const getFengShuiConsultation = (data) => {
  return api.post("/api/Consultation/fengshui", data);
};

export const getFengShuiKoiFishPost = (data) => {
  return api.post("/api/Post", data);
};

export default api;
