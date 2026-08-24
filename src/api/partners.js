import api from "./core.js";

export const getPartners = () => api.get("/api/partner-shops");

export const getPartner = (id) => api.get(`/api/partner-shops/${id}`);

export const createPartner = (body) => api.post("/api/partner-shops", body);

export const updatePartner = (id, body) => api.put(`/api/partner-shops/${id}`, body);

export const deletePartner = (id) => api.delete(`/api/partner-shops/${id}`);
