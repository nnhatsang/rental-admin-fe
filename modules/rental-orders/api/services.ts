import { apiAuth } from '@/axios';
import type { DefaultResponse, DefaultResponseWithPagination } from '@/types/api';
import type { AxiosRequestConfig, AxiosResponse } from 'axios';
import type {
  CreateRentalOrderInput,
  CreateRentalQuoteInput,
  IGetRentalOrdersParams,
  RentalOrderDetail,
  RentalOrderListItem,
  RentalOrderQuote,
  UpdateRentalOrderInput,
} from '../model';

const rentalOrdersUrl = '/rental-orders';

const request = <T>(config: AxiosRequestConfig): Promise<AxiosResponse<T>> => apiAuth(config);

export const requestGetRentalOrders = (params: IGetRentalOrdersParams) =>
  request<DefaultResponseWithPagination<RentalOrderListItem>>({ method: 'GET', url: rentalOrdersUrl, params });

export const requestGetRentalOrderById = (id: string) =>
  request<DefaultResponse<RentalOrderDetail>>({ method: 'GET', url: `${rentalOrdersUrl}/${id}` });

export const requestCreateRentalQuote = (data: CreateRentalQuoteInput) =>
  request<DefaultResponse<RentalOrderQuote>>({ method: 'POST', url: `${rentalOrdersUrl}/quote`, data });

export const requestCreateRentalOrder = (data: CreateRentalOrderInput) =>
  request<DefaultResponse<RentalOrderDetail>>({ method: 'POST', url: rentalOrdersUrl, data });

export const requestUpdateRentalOrder = (id: string, data: UpdateRentalOrderInput) =>
  request<DefaultResponse<RentalOrderDetail>>({ method: 'PATCH', url: `${rentalOrdersUrl}/${id}`, data });

export const requestDeleteRentalOrders = (rentalOrderIds: string[]) =>
  request<DefaultResponse<{ success: true }>>({ method: 'DELETE', url: rentalOrdersUrl, data: { rentalOrderIds } });

export const requestCancelRentalOrder = (id: string, data: { reason: string; allowRefund?: boolean; refundAmount?: number; note?: string }) =>
  request<DefaultResponse<RentalOrderDetail>>({ method: 'POST', url: `${rentalOrdersUrl}/${id}/cancel`, data });

export const requestRecordRentalOrderPayment = (id: string, data: { amount: number; method: string; status: string; referenceCode?: string; note?: string; idempotencyKey?: string }) =>
  request<DefaultResponse<RentalOrderDetail>>({ method: 'POST', url: `${rentalOrdersUrl}/${id}/payments`, data });

export const requestConfirmRentalOrderPayment = (id: string, paymentId: string) =>
  request<DefaultResponse<RentalOrderDetail>>({ method: 'POST', url: `${rentalOrdersUrl}/${id}/payments/${paymentId}/confirm` });

export const requestRejectRentalOrderPayment = (id: string, paymentId: string, data: { note?: string }) =>
  request<DefaultResponse<RentalOrderDetail>>({ method: 'POST', url: `${rentalOrdersUrl}/${id}/payments/${paymentId}/reject`, data });

export const requestCreateRentalOrderRefund = (id: string, data: { amount: number; method: string; referenceCode?: string; note?: string }) =>
  request<DefaultResponse<RentalOrderDetail>>({ method: 'POST', url: `${rentalOrdersUrl}/${id}/refunds`, data });

export const requestConfirmRentalOrderRefund = (id: string, refundId: string) =>
  request<DefaultResponse<RentalOrderDetail>>({ method: 'POST', url: `${rentalOrdersUrl}/${id}/refunds/${refundId}/confirm` });

export const requestHandoverRentalOrder = (id: string, data: { actualPickupDate?: string; note?: string }) =>
  request<DefaultResponse<RentalOrderDetail>>({ method: 'POST', url: `${rentalOrdersUrl}/${id}/handover`, data });

export const requestReturnRentalOrder = (id: string, data: { actualReturnDate?: string; note?: string }) =>
  request<DefaultResponse<RentalOrderDetail>>({ method: 'POST', url: `${rentalOrdersUrl}/${id}/return`, data });

export const requestInspectRentalOrder = (id: string, data: unknown) =>
  request<DefaultResponse<RentalOrderDetail>>({ method: 'POST', url: `${rentalOrdersUrl}/${id}/inspections`, data });

export const requestSettleRentalOrder = (id: string, data: { note?: string }) =>
  request<DefaultResponse<RentalOrderDetail>>({ method: 'POST', url: `${rentalOrdersUrl}/${id}/settle`, data });
