import axios, { AxiosError, type AxiosInstance, type InternalAxiosRequestConfig } from 'axios';
import { requestRefreshToken } from '@/modules/auth/service';
import { useAuthStore } from '@/stores/auth.store';
import { ApiError, type ApiErrorResponse } from '@/types/api';

const API_BASE_URL = process.env.NEXT_PUBLIC_SERVER_URL ?? 'http://localhost:3000/api';
const AUTH_REFRESH_URL = '/admin/auth/refresh';

type RetryableAxiosRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

export class ApiClientError<TFields = Record<string, unknown>> extends ApiError<TFields> {
  constructor(error: AxiosError<ApiErrorResponse<TFields>>) {
    const body = error.response?.data;

    super(
      body?.message ?? error.message,
      error.response?.status,
      body?.code,
      body?.error ?? []
    );

    this.name = 'ApiClientError';
  }
}

const normalizeApiError = (error: unknown) => {
  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    return new ApiClientError(error);
  }

  return error;
};

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

const apiAuth: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

apiAuth.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiErrorResponse>) => {
    const originalRequest = error.config as RetryableAxiosRequestConfig | undefined;
    const isRefreshRequest = originalRequest?.url?.includes(AUTH_REFRESH_URL);

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry && !isRefreshRequest) {
      originalRequest._retry = true;

      try {
        const refreshResponse = await requestRefreshToken();
        useAuthStore.getState().setUser(refreshResponse.data.data.user);

        return apiAuth(originalRequest);
      } catch (refreshError) {
        const { clearAuth } = useAuthStore.getState();
        clearAuth();

        return Promise.reject(
          axios.isAxiosError<ApiErrorResponse>(refreshError) ? new ApiClientError(refreshError) : refreshError,
        );
      }
    }

    if (axios.isAxiosError<ApiErrorResponse>(error)) {
      return Promise.reject(new ApiClientError(error));
    }

    return Promise.reject(error);
  },
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(normalizeApiError(error)),
);

export { apiAuth, apiClient };
