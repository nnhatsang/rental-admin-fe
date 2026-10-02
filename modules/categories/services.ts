import { apiAuth } from '@/axios';
import type { DefaultResponse, DefaultResponseWithPagination } from '@/types/api';
import type { AxiosRequestConfig, AxiosResponse } from 'axios';
import type {
  ICategoryActionRes,
  ICategoryOut,
  ICreateCategoryReq,
  IGetCategoriesParams,
  IReorderCategoriesReq,
  IUpdateCategoryReq,
  IUpdateCategoryStatusReq,
} from './type';

const url = '/categories';

export const requestGetCategories = (
  params: IGetCategoriesParams,
): Promise<AxiosResponse<DefaultResponseWithPagination<ICategoryOut>>> => {
  const config: AxiosRequestConfig = { method: 'GET', url, params };
  return apiAuth(config);
};

export const requestGetCategoryById = (
  id: string,
): Promise<AxiosResponse<DefaultResponse<ICategoryOut>>> => {
  const config: AxiosRequestConfig = { method: 'GET', url: `${url}/${id}` };
  return apiAuth(config);
};

export const requestCreateCategory = (
  data: ICreateCategoryReq,
): Promise<AxiosResponse<DefaultResponse<ICategoryOut>>> => {
  const config: AxiosRequestConfig = { method: 'POST', url, data };
  return apiAuth(config);
};

export const requestUpdateCategory = (
  id: string,
  data: IUpdateCategoryReq,
): Promise<AxiosResponse<DefaultResponse<ICategoryOut>>> => {
  const config: AxiosRequestConfig = { method: 'PATCH', url: `${url}/${id}`, data };
  return apiAuth(config);
};

export const requestUpdateCategoryStatus = (
  id: string,
  data: IUpdateCategoryStatusReq,
): Promise<AxiosResponse<DefaultResponse<ICategoryOut>>> => {
  const config: AxiosRequestConfig = {
    method: 'PATCH',
    url: `${url}/${id}/status`,
    data,
  };
  return apiAuth(config);
};

export const requestDeleteCategories = (
  ids: string[],
): Promise<AxiosResponse<DefaultResponse<ICategoryActionRes>>> => {
  const config: AxiosRequestConfig = {
    method: 'DELETE',
    url,
    data: { categoryIds: ids },
  };
  return apiAuth(config);
};

export const requestReorderCategories = (
  data: IReorderCategoriesReq,
): Promise<AxiosResponse<DefaultResponse<ICategoryActionRes>>> => {
  const config: AxiosRequestConfig = {
    method: 'PATCH',
    url: `${url}/order`,
    data,
  };
  return apiAuth(config);
};
