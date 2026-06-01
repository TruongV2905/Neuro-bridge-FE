/* eslint-disable @typescript-eslint/no-explicit-any */
import axios, { AxiosError } from "axios";
import type { InternalAxiosRequestConfig } from "axios";
import { toast } from "react-toastify";

// Đối tượng chứa các hàm tiện ích để tránh dùng hook trực tiếp
const authUtils = {
  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    window.location.href = "/auth/login";
  },
};

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});
// Quản lý trạng thái refresh token
let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

// 1. Request Interceptor
api.interceptors.request.use(
  (config: any) => {
    const token = localStorage.getItem("accessToken");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: any) => Promise.reject(error),
);

// 2. Response Interceptor
api.interceptors.response.use(
  (response: any) => response,
  async (error: AxiosError<any>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Kiểm tra mã lỗi 401 (Unauthorized)
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Nếu là lỗi "Expired token!" cụ thể từ server của bạn
      if (error.response.data?.message === "Expired token!") {
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then((token) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              return api(originalRequest);
            })
            .catch((err) => Promise.reject(err));
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          const refreshToken = localStorage.getItem("refreshToken");
          if (!refreshToken) throw new Error("No refresh token");

          // Gọi API refresh token (Dùng axios instance mới để tránh loop interceptor)
          const { data } = await axios.post(
            `${process.env.NEXT_PUBLIC_API_URL}/identity/auth/refresh`,
            {
              token: refreshToken,
            },
          );

          const { token: newToken, refreshToken: newRefreshToken } =
            data.result;

          localStorage.setItem("accessToken", newToken);
          localStorage.setItem("refreshToken", newRefreshToken);

          processQueue(null, newToken);

          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        } catch (refreshError) {
          processQueue(refreshError, null);
          toast.error("Session has expired!");
          authUtils.logout();
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }
    }

    return Promise.reject(error);
  },
);

export default api;
