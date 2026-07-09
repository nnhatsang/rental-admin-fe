import { requestRefreshToken } from '@/modules/auth/services';
import { useAuthStore } from '@/modules/auth/store';
import axios, { AxiosError, type AxiosInstance, type InternalAxiosRequestConfig } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_SERVER_URL ?? 'http://localhost:3000/api';
const AUTH_REFRESH_URL = '/admin/auth/refresh';

type RetryableAxiosRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

export type ApiFieldError<TFields = Record<string, unknown>> = {
  property: keyof TFields & string;
  message: string;
};
export type ApiErrorResponse<TFields = Record<string, unknown>> = {
  message: string;
  code?: string;
  error?: ApiFieldError<TFields>[];
};

export class ApiClientError<TFields = Record<string, unknown>> extends Error {
  readonly status?: number;
  readonly code?: string;
  readonly fieldErrors: ApiFieldError<TFields>[];

  constructor(error: AxiosError<ApiErrorResponse<TFields>>) {
    const body = error.response?.data;

    super(body?.message ?? error.message);

    this.name = 'ApiClientError';
    this.status = error.response?.status;
    this.code = body?.code;
    this.fieldErrors = body?.error ?? [];
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

apiAuth.interceptors.request.use((config) => {
  return config;
});

apiAuth.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiErrorResponse>) => {
    const originalRequest = error.config as RetryableAxiosRequestConfig | undefined;
    const isRefreshRequest = originalRequest?.url?.includes(AUTH_REFRESH_URL);

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry && !isRefreshRequest) {
      originalRequest._retry = true;
      try {
        await requestRefreshToken();
        return apiAuth(originalRequest);
      } catch {
        const { clearAuth } = useAuthStore.getState();
        clearAuth();
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
