import { apiAuth } from '@/axios';
import type { DefaultResponse, DefaultResponseWithPagination } from '@/types/api';
import type { AxiosRequestConfig, AxiosResponse } from 'axios';
import type {
  ICreateProductReq,
  IGetProductsParams,
  IProductActionRes,
  IProductOut,
  IUpdateProductReq,
  IUpdateProductStatusReq,
} from './type';

const url = '/products';

export const requestGetProducts = (
  params: IGetProductsParams,
): Promise<AxiosResponse<DefaultResponseWithPagination<IProductOut>>> => {
  const config: AxiosRequestConfig = { method: 'GET', url, params };
  return apiAuth(config);
};

export const requestGetProductById = (id: string): Promise<AxiosResponse<DefaultResponse<IProductOut>>> => {
  const config: AxiosRequestConfig = { method: 'GET', url: `${url}/${id}` };
  return apiAuth(config);
};

export const requestCreateProduct = (
  data: ICreateProductReq,
): Promise<AxiosResponse<DefaultResponse<IProductOut>>> => {
  const config: AxiosRequestConfig = { method: 'POST', url, data };
  return apiAuth(config);
};

export const requestUpdateProduct = (
  id: string,
  data: IUpdateProductReq,
): Promise<AxiosResponse<DefaultResponse<IProductOut>>> => {
  const config: AxiosRequestConfig = { method: 'PATCH', url: `${url}/${id}`, data };
  return apiAuth(config);
};

export const requestUpdateProductStatus = (
  id: string,
  data: IUpdateProductStatusReq,
): Promise<AxiosResponse<DefaultResponse<IProductOut>>> => {
  const config: AxiosRequestConfig = { method: 'PATCH', url: `${url}/${id}/status`, data };
  return apiAuth(config);
};

export const requestDeleteProducts = (
  productIds: string[],
): Promise<AxiosResponse<DefaultResponse<IProductActionRes>>> => {
  const config: AxiosRequestConfig = { method: 'DELETE', url, data: { productIds } };
  return apiAuth(config);
};
