import api from "./core.js";

const unwrapLegacy = (response) => response?.data?.data ?? response?.data;

export const getFeed = ({ postTypeId, page = 1, pageSize = 10, q } = {}) =>
  api.get(`/api/Post/GetAllByPostType/${postTypeId}`, {
    params: { page, pageSize, ...(q ? { q } : {}) },
  });

export const getPostById = async (id) => {
  const response = await api.get(`/api/Post/Details/${id}`);
  return unwrapLegacy(response);
};

export const getCategories = async () => {
  const response = await api.get("/api/Post/categories");
  return response.data;
};

export const getMyPosts = async () => {
  const response = await api.get("/api/Post/my-posts");
  return unwrapLegacy(response) ?? [];
};

export const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  const response = await api.post("/api/UploadImage/UploadFile", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  const data = unwrapLegacy(response) ?? {};
  return { imageId: data.imageId ?? null, url: data.url ?? null };
};

export const createPost = (body) => api.post("/api/Post/Create", body);

export const deletePost = (id) => api.delete(`/api/Post/Delete/${id}`);
