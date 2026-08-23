import axios from "axios";
import { getAccessToken, getRefreshToken, setTokens, clearAuth, getRefreshPromise, setRefreshPromise, clearRefreshPromise } from "./tokenManager.js";
const baseUrl = import.meta.env.VITE_API_URL || "";
const api = axios.create({ baseURL: baseUrl });

const stringToCode = (s) => {
  const t = String(s || "").trim();
  if (/email not found/i.test(t)) return "ACCOUNT_NOT_FOUND";
  if (/incorrect password/i.test(t)) return "INVALID_PASSWORD";
  if (/already exists|taken/i.test(t)) return "EMAIL_TAKEN";
  return "UNKNOWN_ERROR";
};

export function extractApiError(err) {
  const res = err?.response;
  const data = res?.data;
  if (typeof data === "string") return { code: stringToCode(data), message: data, status: res.status };
  if (data?.code) return { code: data.code, message: data.message || data.code, status: res.status };
  if (data?.errors && typeof data.errors === "object") {
    const msgs = Object.values(data.errors).flat().join("; ");
    return { code: data.code || "VALIDATION_ERROR", message: msgs || data.title || "Validation failed", status: res.status };
  }
  if (data?.title) return { code: "PROBLEM_JSON", message: data.title, status: res.status };
  if (data?.message) return { code: stringToCode(data.message), message: data.message, status: res.status };
  if (err?.message === "Network Error") return { code: "NETWORK_ERROR", message: "Không thể kết nối máy chủ", status: 0 };
  if (res?.status === 429) return { code: "RATE_LIMITED", message: "Thao tác quá nhanh, vui lòng thử lại sau", status: 429 };
  return { code: "UNKNOWN_ERROR", message: err?.message || "Đã xảy ra lỗi", status: res?.status || 0 };
}

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (r) => r,
  async (error) => {
    const original = error.config;
    if (!original) return Promise.reject(error);
    if (error.response?.status === 401 && !original._retry && getRefreshToken()) {
      original._retry = true;
      original.headers ??= {};
      try {
        if (!getRefreshPromise()) {
          const p = (async () => {
            const { data } = await axios.post(`${baseUrl}/api/Auth/refresh`, { refreshToken: getRefreshToken() });
            setTokens({ token: data.token, refreshToken: data.refreshToken, expiresInMinutes: data.expiresInMinutes, id: data.id, fullName: data.fullName, email: data.email });
            return data.token;
          })();
          setRefreshPromise(p);
          p.finally(clearRefreshPromise);
        }
        const newToken = await getRefreshPromise();
        original.headers.Authorization = `Bearer ${newToken}`;
        return api(original);
      } catch (e) {
        clearAuth();
        if (window.location.pathname !== "/auth") window.location.href = "/auth";
        return Promise.reject(e);
      }
    }
    if (error.response?.status === 401) {
      clearAuth();
      if (window.location.pathname !== "/auth") window.location.href = "/auth";
    }
    return Promise.reject(error);
  }
);

export default api;
