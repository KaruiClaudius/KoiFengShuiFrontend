import api from "./core";

export const getFengShuiKoiFishPost = (categoryId, page = 1, pageSize = 10) => {
  return api
    .get(
      `/api/MarketplaceListings/GetAllByCategoryType/${categoryId}?page=${page}&pageSize=${pageSize}`
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

export const getFengShuiKoiDecorationPost = (page = 1, pageSize = 10) => {
  return api
    .get(`/api/MarketplaceListings/GetAllByCategoryType/2?page=${page}&pageSize=${pageSize}`)
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
