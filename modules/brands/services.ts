import { apiAuth } from '@/axios';
import type { DefaultResponse, DefaultResponseWithPagination } from '@/types/api';
import type { AxiosRequestConfig, AxiosResponse } from 'axios';
import type {
  IBrandActionRes,
  IBrandOut,
  ICreateBrandReq,
  IGetBrandsParams,
  IUpdateBrandReq,
  IUpdateBrandStatusReq,
} from './type';

const url = '/brands';

export const requestGetBrands = (
  params: IGetBrandsParams,
): Promise<AxiosResponse<DefaultResponseWithPagination<IBrandOut>>> => {
  const config: AxiosRequestConfig = { method: 'GET', url, params };
  return apiAuth(config);
};

export const requestGetBrandById = (id: string): Promise<AxiosResponse<DefaultResponse<IBrandOut>>> => {
  const config: AxiosRequestConfig = { method: 'GET', url: `${url}/${id}` };
  return apiAuth(config);
};

export const requestCreateBrand = (data: ICreateBrandReq): Promise<AxiosResponse<DefaultResponse<IBrandOut>>> => {
  const config: AxiosRequestConfig = { method: 'POST', url, data };
  return apiAuth(config);
};

export const requestUpdateBrand = (
  id: string,
  data: IUpdateBrandReq,
): Promise<AxiosResponse<DefaultResponse<IBrandOut>>> => {
  const config: AxiosRequestConfig = { method: 'PATCH', url: `${url}/${id}`, data };
  return apiAuth(config);
};

export const requestUpdateBrandStatus = (
  id: string,
  data: IUpdateBrandStatusReq,
): Promise<AxiosResponse<DefaultResponse<IBrandOut>>> => {
  const config: AxiosRequestConfig = {
    method: 'PATCH',
    url: `${url}/${id}/status`,
    data,
  };
  return apiAuth(config);
};

export const requestDeleteBrands = (
  ids: string[],
): Promise<AxiosResponse<DefaultResponse<IBrandActionRes>>> => {
  const config: AxiosRequestConfig = {
    method: 'DELETE',
    url,
    data: { brandIds: ids },
  };
  return apiAuth(config);
};
