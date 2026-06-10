import { apiAuth } from '@/axios';
import type { DefaultResponse, DefaultResponseWithPagination } from '@/types/api';
import type {
  ICreateCustomerReq,
  ICustomerActionRes,
  ICustomerOut,
  IGetCustomersParams,
  IUpdateCustomerReq,
  IUpdateCustomerStatusReq,
} from '@/types/customers';
import type { AxiosRequestConfig, AxiosResponse } from 'axios';

const url = '/customers';

export const requestGetCustomers = (
  params: IGetCustomersParams,
): Promise<AxiosResponse<DefaultResponseWithPagination<ICustomerOut>>> => {
  const config: AxiosRequestConfig = {
    method: 'GET',
    url,
    params,
  };

  return apiAuth(config);
};

export const requestGetCustomerById = (id: string): Promise<AxiosResponse<DefaultResponse<ICustomerOut>>> => {
  const config: AxiosRequestConfig = {
    method: 'GET',
    url: `${url}/${id}`,
  };

  return apiAuth(config);
};

export const requestCreateCustomer = (data: ICreateCustomerReq): Promise<AxiosResponse<DefaultResponse<ICustomerOut>>> => {
  const config: AxiosRequestConfig = {
    method: 'POST',
    url,
    data,
  };

  return apiAuth(config);
};

export const requestUpdateCustomer = (
  id: string,
  data: IUpdateCustomerReq,
): Promise<AxiosResponse<DefaultResponse<ICustomerOut>>> => {
  const config: AxiosRequestConfig = {
    method: 'PATCH',
    url: `${url}/${id}`,
    data,
  };

  return apiAuth(config);
};

export const requestUpdateCustomerStatus = (
  id: string,
  data: IUpdateCustomerStatusReq,
): Promise<AxiosResponse<DefaultResponse<ICustomerOut>>> => {
  const config: AxiosRequestConfig = {
    method: 'PATCH',
    url: `${url}/${id}/status`,
    data,
  };

  return apiAuth(config);
};

export const requestDeleteCustomer = (id: string): Promise<AxiosResponse<DefaultResponse<ICustomerActionRes>>> => {
  const config: AxiosRequestConfig = {
    method: 'DELETE',
    url: `${url}/${id}`,
  };

  return apiAuth(config);
};
