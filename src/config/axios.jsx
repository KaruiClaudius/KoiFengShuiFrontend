import axios from "axios";
const baseUrl = "https://localhost:7285";
// const baseUrl = "https://localhost:44389";

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

export const getFengShuiKoiFishPost = () => {
  return api
    .get("/api/Post/GetAllByPostType/1?page=1&pageSize=5")
    .then((response) => response.data);
};

export const getFengShuiKoiDecorationPost = () => {
  return api
    .get("/api/Post/GetAllByPostType/2?page=1&pageSize=5")
    .then((response) => response.data);
};

export const getFengShuiKoiPost = () => {
  return api
    .get("/api/Post/GetAllByPostType/3?page=1&pageSize=5")
    .then((response) => response.data);
};
// New dashboard API calls
export const getNewUsersCount = (days = 30) => {
  return api.get("/api/Dashboard/new-users-count", { params: { days } });
};

export const getNewUsersList = (days = 30) => {
  return api.get("/api/Dashboard/new-users-list", { params: { days } });
};

export const getTrafficDistribution = () => {
  return api.get("/api/Dashboard/traffic-distribution");
};

export const getNewMarketListingsCount = (days = 30) => {
  return api.get(`/api/dashboard/new-market-listings-count?days=${days}`);
};

export const getNewMarketListingsByCategory = (days = 30) => {
  return api.get(`/api/dashboard/new-market-listings-by-category?days=${days}`);
};

export const getMarketListings = (page = 1, pageSize = 10) => {
  return api.get(
    `/api/dashboard/market-listings?page=${page}&pageSize=${pageSize}`
  );
};

export default api;
