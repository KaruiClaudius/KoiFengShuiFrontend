import api from "./core";

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

export const getActivePostById = async (id) => {
  const res = await getAllPosts();
  return (
    (res.data || []).find(
      (p) =>
        String(p.postId ?? p.id) === String(id) && p.status === "active"
    ) || null
  );
};
