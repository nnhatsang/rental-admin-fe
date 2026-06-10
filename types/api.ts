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
