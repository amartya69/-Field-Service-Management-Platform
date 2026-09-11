import axios, { AxiosError } from 'axios';
import type { InternalAxiosRequestConfig } from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || (window.location.hostname === '127.0.0.1' ? 'http://127.0.0.1:8080' : 'http://localhost:8080');

export const axiosClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: string | PromiseLike<string>) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (token) {
      prom.resolve(token);
    } else {
      prom.reject(error);
    }
  });
  failedQueue = [];
};

// Request Interceptor: Attach JWT Token
axiosClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('keystone_token');
    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Catch 401 and refresh token dynamically
axiosClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config;
    if (!originalRequest) return Promise.reject(error);

    // Skip refresh token flow for login and refresh endpoints themselves
    if (
      originalRequest.url?.includes('/api/auth/login') ||
      originalRequest.url?.includes('/api/auth/refresh')
    ) {
      return Promise.reject(error);
    }

    // Cast originalRequest to any to write custom retry properties
    const customReq = originalRequest as any;

    if (error.response?.status === 401 && !customReq._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            customReq.headers.Authorization = `Bearer ${token}`;
            return axiosClient(customReq);
          })
          .catch((err) => Promise.reject(err));
      }

      customReq._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem('keystone_refresh_token');
      if (!refreshToken) {
        isRefreshing = false;
        handleLogoutAction();
        return Promise.reject(error);
      }

      try {
        const refreshResponse = await axios.post(`${BASE_URL}/api/auth/refresh`, {
          refreshToken: refreshToken,
        });

        const newAccessToken = refreshResponse.data.data.accessToken;
        const newRefreshToken = refreshResponse.data.data.refreshToken;

        localStorage.setItem('keystone_token', newAccessToken);
        if (newRefreshToken) {
          localStorage.setItem('keystone_refresh_token', newRefreshToken);
        }

        axiosClient.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;
        customReq.headers.Authorization = `Bearer ${newAccessToken}`;

        processQueue(null, newAccessToken);
        isRefreshing = false;

        return axiosClient(customReq);
      } catch (refreshError) {
        processQueue(refreshError, null);
        isRefreshing = false;
        handleLogoutAction();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

function handleLogoutAction() {
  localStorage.removeItem('keystone_token');
  localStorage.removeItem('keystone_refresh_token');
  localStorage.removeItem('keystone_user');
  
  // Dispatch custom event to let React components react immediately
  window.dispatchEvent(new Event('keystone_auth_logout'));
}
export default axiosClient;
