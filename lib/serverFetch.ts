import { ApiError, type ApiErrorResponse } from '@/types/api';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface FetchOptions extends RequestInit {}

export interface ServerFetchResponse<T> {
  data: T;
  status: number;
  statusText: string;
  headers: Headers;
}

export class ApiServerError<TFields = Record<string, unknown>> extends ApiError<TFields> {
  constructor(status: number, body: ApiErrorResponse<TFields> | null) {
    super(body?.message || `API Error: ${status}`, status, body?.code, body?.error ?? []);
    this.name = 'ApiServerError';
  }
}

export async function serverFetch<T>(endpoint: string, options: FetchOptions = {}): Promise<ServerFetchResponse<T>> {
  // 1. Tự động gắn Base URL (VD: Endpoint của backend)
  const baseUrl = process.env.API_BASE_URL || 'http://localhost:3000/api';
  const url = `${baseUrl}${endpoint}`;

  // 2. Thiết lập Headers mặc định
  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };

  const config: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);

    // 3. Xử lý lỗi tập trung
    if (!response.ok) {
      const errorData = (await response.json().catch(() => null)) as ApiErrorResponse | null;
      throw new ApiServerError(response.status, errorData);
    }

    // 4. Trả về dữ liệu đã được parse dưới dạng chuẩn AxiosResponse-like
    let data: T;
    if (response.status === 204) {
      data = {} as T;
    } else {
      data = (await response.json()) as T;
    }

    return {
      data,
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    };
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    // Log lỗi hệ thống hoặc gửi lên Sentry tại đây
    console.error(`[Fetch Error] ${endpoint}:`, error);
    throw error;
  }
}
