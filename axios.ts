import axios, { AxiosError, type AxiosInstance, type InternalAxiosRequestConfig } from 'axios';
import { getCookie } from 'cookies-next/client';
import { requestRefreshToken } from './services/auth';
import { useAuthStore } from './stores/auth.store';
import { CSRF_COOKIE_NAME, CSRF_HEADER_NAME } from './utils/consts/token.const';

const API_BASE_URL = process.env.NEXT_PUBLIC_SERVER_URL ?? 'http://localhost:3000/api';

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
  const csrfToken = getCookie(CSRF_COOKIE_NAME);

  if (typeof csrfToken === 'string' && csrfToken) {
    config.headers.set(CSRF_HEADER_NAME, csrfToken);
  }

  return config;
});

apiAuth.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiErrorResponse>) => {
    const originalRequest = error.config as RetryableAxiosRequestConfig | undefined;

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        return await requestRefreshToken();
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
