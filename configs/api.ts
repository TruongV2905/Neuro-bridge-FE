import axios, { AxiosError, AxiosResponse } from "axios";
import type { InternalAxiosRequestConfig } from "axios";
import { toast } from "react-toastify";
import { STORAGE_KEYS } from "@/constants/storage";
import { ROUTES } from "@/constants/routes";

type RetryableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

type ApiErrorPayload = {
  message?: string;
};

type RefreshTokenResponse = {
  result: {
    token: string;
    refreshToken: string;
  };
};

type QueueItem = {
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
};

const authUtils = {
  logout: () => {
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    window.location.href = ROUTES.LOGIN;
  },
};

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
});

let isRefreshing = false;
let failedQueue: QueueItem[] = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else if (token) resolve(token);
  });
  failedQueue = [];
};

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError<ApiErrorPayload>) => {
    const originalRequest = error.config as RetryableRequestConfig;

    const isExpiredToken =
      error.response?.status === 401 &&
      !originalRequest._retry;

    if (!isExpiredToken) return Promise.reject(error);

    if (isRefreshing) {
      return new Promise<string>((resolve, reject) => {
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
      const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
      if (!refreshToken) throw new Error("No refresh token");

      const { data } = await axios.post<RefreshTokenResponse>(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/identity/auth/refresh`,
        { token: refreshToken },
      );

      const { token: newToken, refreshToken: newRefreshToken } = data.result;

      localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, newToken);
      localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, newRefreshToken);

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
  },
);

export default api;
