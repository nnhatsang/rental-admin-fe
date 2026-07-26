import { apiAuth } from '@/axios';
import type { DefaultResponse, DefaultResponseWithPagination } from '@/types/api';
import type { AxiosRequestConfig, AxiosResponse } from 'axios';
import type {
  ICheckRentalOrderAvailabilityReq,
  ICreateCustomerReq,
  ICreateRentalOrderReq,
  ICustomerOut,
  IGetCustomersParams,
  IGetRentalOrdersParams,
  IRentalOrderAvailabilityOut,
  IRentalOrderOut,
} from './type';

const rentalOrdersUrl = '/rental-orders';
const customersUrl = '/customers';

export const requestGetRentalOrders = (
  params: IGetRentalOrdersParams,
): Promise<AxiosResponse<DefaultResponseWithPagination<IRentalOrderOut>>> =>
  apiAuth({ method: 'GET', url: rentalOrdersUrl, params } satisfies AxiosRequestConfig);

export const requestGetRentalOrderById = (
  id: string,
): Promise<AxiosResponse<DefaultResponse<IRentalOrderOut>>> =>
  apiAuth({ method: 'GET', url: `${rentalOrdersUrl}/${id}` } satisfies AxiosRequestConfig);

export const requestCheckRentalOrderAvailability = (
  data: ICheckRentalOrderAvailabilityReq,
): Promise<AxiosResponse<DefaultResponse<IRentalOrderAvailabilityOut>>> =>
  apiAuth({ method: 'POST', url: `${rentalOrdersUrl}/check-availability`, data } satisfies AxiosRequestConfig);

export const requestCreateRentalOrder = (
  data: ICreateRentalOrderReq,
): Promise<AxiosResponse<DefaultResponse<IRentalOrderOut>>> =>
  apiAuth({ method: 'POST', url: rentalOrdersUrl, data } satisfies AxiosRequestConfig);

export const requestGetCustomers = (
  params: IGetCustomersParams,
): Promise<AxiosResponse<DefaultResponseWithPagination<ICustomerOut>>> =>
  apiAuth({ method: 'GET', url: customersUrl, params } satisfies AxiosRequestConfig);

export const requestCreateCustomer = (
  data: ICreateCustomerReq,
): Promise<AxiosResponse<DefaultResponse<ICustomerOut>>> =>
  apiAuth({ method: 'POST', url: customersUrl, data } satisfies AxiosRequestConfig);
