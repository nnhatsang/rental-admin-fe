import { apiAuth } from '@/axios';
import type { DefaultResponse, DefaultResponseWithPagination } from '@/types/api';
import type { AxiosRequestConfig, AxiosResponse } from 'axios';
import type {
  ICreateStoreClosureReq,
  IDeleteStoreClosuresReq,
  IGetStoreClosuresParams,
  IStoreClosureOut,
  IUpdateStoreClosureReq,
} from './type';

const url = '/store-closures';

export const requestGetStoreClosures = (
  params: IGetStoreClosuresParams,
): Promise<AxiosResponse<DefaultResponseWithPagination<IStoreClosureOut>>> => {
  const config: AxiosRequestConfig = {
    method: 'GET',
    url,
    params,
  };

  return apiAuth(config);
};

export const requestCreateStoreClosure = (
  data: ICreateStoreClosureReq,
): Promise<AxiosResponse<DefaultResponse<IStoreClosureOut>>> => {
  const config: AxiosRequestConfig = {
    method: 'POST',
    url,
    data,
  };

  return apiAuth(config);
};

export const requestUpdateStoreClosure = (
  id: string,
  data: IUpdateStoreClosureReq,
): Promise<AxiosResponse<DefaultResponse<IStoreClosureOut>>> => {
  const config: AxiosRequestConfig = {
    method: 'PATCH',
    url: url + '/' + id,
    data,
  };

  return apiAuth(config);
};

export const requestDeleteStoreClosures = (
  data: IDeleteStoreClosuresReq,
): Promise<AxiosResponse<DefaultResponse<{ success: boolean }>>> => {
  const config: AxiosRequestConfig = {
    method: 'DELETE',
    url,
    data,
  };

  return apiAuth(config);
};
