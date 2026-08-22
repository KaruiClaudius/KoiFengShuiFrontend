import api from "./core";

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
