import { useAuthStore } from "@/store/useAuthStore";
import axios from "axios";

const api = axios.create({
  // khi chua deploy thi dung localhost, khi deploy thi chung domain voi be
  baseURL: import.meta.env.VITE_API_URL || "/api",

  withCredentials: true,
});

// gan access token vao header cua req
api.interceptors.request.use((config) => {
  // chi lay access token tai thoi diem dong code nay chay
  //neu sau do access token trong store bi cap nhat thi gia tri trong ham nay van giu nguyen
  const { accessToken } = useAuthStore.getState();

  console.log("Request interceptor - URL:", config.url);
  console.log(
    "Request interceptor - Access Token:",
    accessToken ? "Present" : "Missing",
  );

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

//tu dong goi refresh api khi access token het han
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;

    // bo qua nhung api khong can kiem tra access token
    if (
      originalRequest.url.includes("/auth/signin") ||
      originalRequest.url.includes("/auth/signup") ||
      originalRequest.url.includes("/auth/refresh")
    ) {
      return Promise.reject(error);
    }

    originalRequest._retryCount = originalRequest._retryCount || 0;

    if (error.response?.status === 403 && originalRequest._retryCount < 4) {
      originalRequest._retryCount += 1;
      console.log("refresh", originalRequest._retryCount);

      try {
        const res = await api.post("/auth/refresh", { withCredentials: true });
        const newAccessToken = res.data.accessToken;

        useAuthStore.getState().setAccessToken(newAccessToken);
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        useAuthStore.getState().clearState();
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  },
);

export default api;
