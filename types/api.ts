export type DefaultParamsRequest = {
  page: number;
  perPage: number;
  search?: string;
  sort?: string;
};

export type DefaultResponse<T = unknown> = {
  data: T;
  message: string;
  success?: boolean;
  code?: string;
};

export type DefaultResponseWithPagination<T> = {
  data: IPaginationResponse<T>;
  message: string;
  success?: boolean;
};

export type IPaginationResponse<T> = {
  items: T[];
  pagination: {
    page: number;
    perPage: number;
    count: number;
    totalPage: number;
    total: number;
  };
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

export class ApiError<TFields = Record<string, unknown>> extends Error {
  readonly status?: number;
  readonly code?: string;
  readonly fieldErrors: ApiFieldError<TFields>[];

  constructor(
    message: string,
    status?: number,
    code?: string,
    fieldErrors: ApiFieldError<TFields>[] = []
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.fieldErrors = fieldErrors;
  }
}

