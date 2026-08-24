import api from "./core.js";

export const signIn = (body) => api.post("/api/Auth/SignIn", body);
export const signUp = (body) => api.post("/api/Auth/SignUp", body);
export const forgotPassword = (email) => api.post("/api/Auth/ForgotPassword", { email });
export const resetPassword = (body) => api.post("/api/Auth/ResetPassword", body);
export const googleLogin = (idToken) => api.post("/api/Auth/google-login", { idToken });
export const getProfileStatus = () => api.get("/api/Auth/profile-status");
export const refreshToken = (refreshToken) => api.post("/api/Auth/refresh", { refreshToken });
export const logout = () => api.post("/api/Auth/logout");
export const getAccountById = (id) => api.get(`/api/Account/${id}`);
export const updateAccount = (id, body) => api.put(`/api/Account/${id}`, body);
