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

// Xuất các hàm API cần thiết
export const assessCompatibility = (data) => {
  return api.post("/api/Compatibility/lookup", data);
};

export const getFengShuiConsultation = (data) => {
  return api.post("/api/Consultation/fengshui", data);
};

export const getFengShuiKoiFishPost = (page = 1, pageSize = 10) => {
  return api
    .get(
      `/api/MarketplaceListings/GetAllByCategoryType/1?page=${page}&pageSize=${pageSize}`
    )
    .then((response) => response.data);
};

export const getKoiElement = (elementId, page = 1, pageSize = 10) => {
  if (elementId != null) {
    return api
      .get(
        `/api/MarketplaceListings/GetAllByElementId/${elementId}/Category/1?page=${page}&pageSize=${pageSize}`
      )
      .then((response) => response.data);
  } else {
    return null;
  }
};

export const getFengShuiKoiDecorationPost = (page = 1, pageSize = 5) => {
  return api
    .get(
      `/api/MarketplaceListings/GetAllByCategoryType/2?page=${page}&pageSize=${pageSize}`
    )
    .then((response) => response.data);
};

export const getFengShuiKoiPost = (page = 1, pageSize = 5) => {
  return api
    .get(`/api/Post/GetAllByPostType/3?page=${page}&pageSize=${pageSize}`)
    .then((response) => response.data);
};

export const getFengShuiKoiDetail = (id) => {
  return api
    .get(`/api/MarketplaceListings/Details/${id}`)
    .then((response) => response.data);
};

export const postMarketplaceListings = (formData) => {
  return api
    .post("/api/MarketplaceListings/Create", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
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

export const getTransactionListing = (page = 1, pageSize = 10) => {
  return api.get(
    `/api/dashboard/transaction-listing?page=${page}&pageSize=${pageSize}`
  );
};
export const getTotalTransaction = () => {
  return api.get("/api/Dashboard/total-amount");
};
export const getAllFAQs = () => {
  return api.get("/api/FAQ/GetAll");
};

export const createFAQ = (data) => {
  return api.post("/api/FAQ/Create", data);
};
export const updateFAQ = (faqId, data) => {
  return api.put(`/api/FAQ/Update/${faqId}`, data);
};

export const deleteFAQ = (faqId) => {
  return api.delete(`/api/FAQ/Delete/${faqId}`);
};
//Admin post

export const getAllPosts = () => {
  return api.get("/api/AdminPost/GetAllPosts");
};

export const createPost = (data) => {
  return api.post("/api/AdminPost/CreatePostWithImages", data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const updatePost = (postId, data) => {
  return api.put(`/api/AdminPost/UpdatePost/${postId}`, data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const deletePost = (postId) => {
  return api.delete(`/api/AdminPost/DeletePostWithAllRelated/${postId}`);
};

export const getTotalTransactionCount = () => {
  return api.get("/api/Dashboard/transactions/count");
};

export default api;
