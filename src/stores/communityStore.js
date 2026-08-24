import { create } from "zustand";
import { getFeed, getMyPosts, createPost, uploadImage } from "../api/community.js";
import { POST_TYPES } from "../constants/postTypes.js";
import { extractApiError } from "../api/core.js";

export const useCommunityStore = create((set, get) => ({
  feed: [],
  page: 1,
  pageSize: 10,
  hasMore: false,
  q: "",
  status: "idle",
  error: null,

  myPosts: [],
  myPostsStatus: "idle",

  submitStatus: "idle",
  submitError: null,

  setQ: (q) => set({ q }),

  fetchFeed: async ({ append = false } = {}) => {
    const { page, pageSize, q, feed } = get();
    set({ status: "loading", error: null });
    try {
      const response = await getFeed({
        postTypeId: POST_TYPES.COMMUNITY,
        page: append ? page : 1,
        pageSize,
        q: q || undefined,
      });
      const items = response.data?.data ?? response.data ?? [];
      const nextPage = append ? page + 1 : 2;
      set({
        feed: append ? [...feed, ...items] : items,
        page: nextPage,
        hasMore: items.length === pageSize,
        status: "ready",
      });
    } catch (err) {
      const apiError = extractApiError(err);
      set({ status: "error", error: apiError.message });
    }
  },

  search: async (term) => {
    set({ q: term, page: 1 });
    await get().fetchFeed({ append: false });
  },

  loadMore: async () => {
    if (get().status !== "loading") await get().fetchFeed({ append: true });
  },

  fetchMyPosts: async () => {
    set({ myPostsStatus: "loading" });
    try {
      const posts = await getMyPosts();
      set({ myPosts: posts, myPostsStatus: "ready" });
    } catch (err) {
      const apiError = extractApiError(err);
      set({ myPosts: [], myPostsStatus: "error", error: apiError.message });
    }
  },

  submitPost: async ({ title, content, images }) => {
    set({ submitStatus: "loading", submitError: null });
    try {
      const imageIds = [];
      for (const file of images) {
        const { imageId } = await uploadImage(file);
        if (imageId != null) imageIds.push(imageId);
      }
      await createPost({
        title,
        content,
        categoryId: POST_TYPES.COMMUNITY,
        imageIds,
      });
      set({ submitStatus: "ready" });
      return true;
    } catch (err) {
      const apiError = extractApiError(err);
      set({ submitStatus: "error", submitError: apiError.message });
      return false;
    }
  },
}));
