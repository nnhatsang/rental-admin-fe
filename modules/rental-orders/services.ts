import { apiAuth } from '@/axios';
import type { DefaultResponse, DefaultResponseWithPagination } from '@/types/api';
import type { AxiosRequestConfig, AxiosResponse } from 'axios';
import type {
  ICheckRentalOrderAvailabilityReq,
  ICancelRentalOrderReq,
  ICompleteRentalOrderReq,
  ICreateCustomerReq,
  ICreateRentalOrderReq,
  ICustomerOut,
  IDeleteRentalOrdersOut,
  IDeleteRentalOrdersReq,
  IGetCustomersParams,
  IGetRentalOrdersParams,
  IHandoverRentalOrderReq,
  IRecordRentalOrderPaymentReq,
  IRefundRentalOrderPaymentReq,
  IRentalOrderAvailabilityOut,
  IRentalOrderAssetUnit,
  IRentalOrderListItemOut,
  IRentalOrderOut,
  IRentalOrderProduct,
  IUpdateRentalOrderReq,
  RentalOrderItemSnapshot,
} from './type';

const rentalOrdersUrl = '/rental-orders';
const availabilityUrl = '/availability';
const customersUrl = '/customers';

const normalizeRentalOrderDetail = (order: IRentalOrderOut): IRentalOrderOut => {
  const rentalPeriod = order.rentalPeriod ?? {
    startDate: order.startDate,
    endDate: order.endDate,
    actualPickupDate: order.actualPickupDate,
    actualReturnDate: order.actualReturnDate,
  };
  const fulfillment = order.fulfillment ?? {
    pickupMethod: order.pickupMethod,
    deliveryAddress: order.deliveryAddress,
    collateralType: 'NONE',
    collateralDescription: null,
  };
  const financials = order.financials ?? {
    deliveryFeeTotal: order.deliveryFeeTotal,
    rentalFeeTotal: order.rentalFeeTotal,
    depositTotal: order.depositTotal,
    bookingHoldTotal: order.bookingHoldTotal,
    lateFeeTotal: order.lateFeeTotal,
    damageFeeTotal: order.damageFeeTotal,
    discountTotal: order.discountTotal,
    compensationFeeTotal: order.compensationFeeTotal,
    chargeTotal: order.chargeTotal,
    paidTotal: order.paidTotal,
    estimatedRefundTotal: order.estimatedRefundTotal,
    actualRefundTotal: order.actualRefundTotal,
    adjustedDepositTotal: order.adjustedDepositTotal ?? 0,
    handoverRequiredTotal: order.handoverRequiredTotal ?? 0,
    handoverAmountDue: order.handoverAmountDue ?? 0,
  };
  const notes = order.notes ?? {
    customerNote: order.note,
    internalNote: order.internalNote,
    cancelReason: order.cancelReason,
  };

  return {
    ...order,
    rentalPeriod,
    fulfillment,
    financials,
    notes,
    startDate: rentalPeriod.startDate,
    endDate: rentalPeriod.endDate,
    actualPickupDate: rentalPeriod.actualPickupDate ?? null,
    actualReturnDate: rentalPeriod.actualReturnDate ?? null,
    pickupMethod: fulfillment.pickupMethod,
    deliveryAddress: fulfillment.deliveryAddress,
    deliveryFeeTotal: financials.deliveryFeeTotal,
    rentalFeeTotal: financials.rentalFeeTotal,
    depositTotal: financials.depositTotal,
    bookingHoldTotal: financials.bookingHoldTotal,
    lateFeeTotal: financials.lateFeeTotal,
    damageFeeTotal: financials.damageFeeTotal,
    discountTotal: financials.discountTotal,
    compensationFeeTotal: financials.compensationFeeTotal,
    chargeTotal: financials.chargeTotal,
    paidTotal: financials.paidTotal,
    estimatedRefundTotal: financials.estimatedRefundTotal,
    actualRefundTotal: financials.actualRefundTotal,
    adjustedDepositTotal: financials.adjustedDepositTotal,
    handoverRequiredTotal: financials.handoverRequiredTotal,
    handoverAmountDue: financials.handoverAmountDue,
    note: notes.customerNote,
    internalNote: notes.internalNote,
    cancelReason: notes.cancelReason,
    customer:
      order.customer ??
      ({
        id: order.customerId,
        name: order.customerSnapshot.name ?? '',
        phone: order.customerSnapshot.phone ?? null,
        email: order.customerSnapshot.email ?? null,
      } satisfies IRentalOrderOut['customer']),
    items: order.items.map((item) => ({
      ...item,
      product:
        item.product ??
        ({
          id: item.productId,
          name: item.productSnapshot?.name ?? '',
          sku: item.productSnapshot?.sku ?? null,
        } satisfies IRentalOrderProduct),
      assetUnit:
        item.assetUnit ??
        ({
          id: item.assetUnitId,
          serialNumber: item.assetUnitSnapshot?.serialNumber ?? '',
        } satisfies IRentalOrderAssetUnit),
      snapshot:
        item.snapshot ??
        ({
          product: item.productSnapshot,
          assetUnit: item.assetUnitSnapshot,
          pricing: item.pricing,
          rentalWindow: item.rentalPeriod,
        } satisfies RentalOrderItemSnapshot),
      unitPrice: item.unitPrice ?? item.pricing.unitPrice,
      depositAmount: item.depositAmount ?? item.pricing.depositAmount,
      bookingHoldAmount: item.bookingHoldAmount ?? item.pricing.bookingHoldAmount,
      lineTotal: item.lineTotal ?? item.pricing.lineTotal,
      startDate: item.startDate ?? item.rentalPeriod.startDate,
      endDate: item.endDate ?? item.rentalPeriod.endDate,
      blockedEndDate: item.blockedEndDate ?? item.rentalPeriod.blockedEndDate,
    })),
  };
};

const withNormalizedRentalOrderDetail = (response: AxiosResponse<DefaultResponse<IRentalOrderOut>>) => ({
  ...response,
  data: {
    ...response.data,
    data: normalizeRentalOrderDetail(response.data.data),
  },
});

export const requestGetRentalOrders = (
  params: IGetRentalOrdersParams,
): Promise<AxiosResponse<DefaultResponseWithPagination<IRentalOrderListItemOut>>> =>
  apiAuth({ method: 'GET', url: rentalOrdersUrl, params } satisfies AxiosRequestConfig);

export const requestGetRentalOrderById = (
  id: string,
): Promise<AxiosResponse<DefaultResponse<IRentalOrderOut>>> =>
  apiAuth({ method: 'GET', url: `${rentalOrdersUrl}/${id}` } satisfies AxiosRequestConfig).then(withNormalizedRentalOrderDetail);

export const requestCheckRentalOrderAvailability = (
  data: ICheckRentalOrderAvailabilityReq,
): Promise<AxiosResponse<DefaultResponse<IRentalOrderAvailabilityOut>>> =>
  apiAuth({ method: 'POST', url: `${availabilityUrl}/check`, data } satisfies AxiosRequestConfig);

export const requestCreateRentalOrder = (
  data: ICreateRentalOrderReq,
): Promise<AxiosResponse<DefaultResponse<IRentalOrderOut>>> =>
  apiAuth({ method: 'POST', url: rentalOrdersUrl, data } satisfies AxiosRequestConfig).then(withNormalizedRentalOrderDetail);

export const requestUpdateRentalOrder = (
  id: string,
  data: IUpdateRentalOrderReq,
): Promise<AxiosResponse<DefaultResponse<IRentalOrderOut>>> =>
  apiAuth({ method: 'PATCH', url: `${rentalOrdersUrl}/${id}`, data } satisfies AxiosRequestConfig).then(withNormalizedRentalOrderDetail);

export const requestDeleteRentalOrders = (
  data: IDeleteRentalOrdersReq,
): Promise<AxiosResponse<DefaultResponse<IDeleteRentalOrdersOut>>> => {
  const config: AxiosRequestConfig = {
    method: 'DELETE',
    url: rentalOrdersUrl,
    data,
  };

  return apiAuth(config);
};

export const requestCancelRentalOrder = (
  id: string,
  data: ICancelRentalOrderReq,
): Promise<AxiosResponse<DefaultResponse<IRentalOrderOut>>> => {
  const config: AxiosRequestConfig = {
    method: 'POST',
    url: `${rentalOrdersUrl}/${id}/cancel`,
    data,
  };

  return apiAuth(config).then(withNormalizedRentalOrderDetail);
};

export const requestMarkRentalOrderRenting = (
  id: string,
  data?: { actualPickupDate?: string; note?: string },
): Promise<AxiosResponse<DefaultResponse<IRentalOrderOut>>> =>
  apiAuth({ method: 'POST', url: `${rentalOrdersUrl}/${id}/renting`, data } satisfies AxiosRequestConfig).then(withNormalizedRentalOrderDetail);

export const requestHandoverRentalOrder = (
  id: string,
  data?: IHandoverRentalOrderReq,
): Promise<AxiosResponse<DefaultResponse<IRentalOrderOut>>> =>
  apiAuth({ method: 'POST', url: `${rentalOrdersUrl}/${id}/handover`, data } satisfies AxiosRequestConfig).then(withNormalizedRentalOrderDetail);

export const requestCompleteRentalOrder = (
  id: string,
  data?: ICompleteRentalOrderReq,
): Promise<AxiosResponse<DefaultResponse<IRentalOrderOut>>> =>
  apiAuth({ method: 'POST', url: `${rentalOrdersUrl}/${id}/complete`, data } satisfies AxiosRequestConfig).then(withNormalizedRentalOrderDetail);

export const requestRecordRentalOrderPayment = (
  id: string,
  data: IRecordRentalOrderPaymentReq,
): Promise<AxiosResponse<DefaultResponse<IRentalOrderOut>>> =>
  apiAuth({ method: 'POST', url: `${rentalOrdersUrl}/${id}/payments`, data } satisfies AxiosRequestConfig).then(withNormalizedRentalOrderDetail);

export const requestRefundRentalOrderPayment = (
  id: string,
  data: IRefundRentalOrderPaymentReq,
): Promise<AxiosResponse<DefaultResponse<IRentalOrderOut>>> =>
  apiAuth({ method: 'POST', url: `${rentalOrdersUrl}/${id}/refunds`, data } satisfies AxiosRequestConfig).then(withNormalizedRentalOrderDetail);

export const requestGetCustomers = (
  params: IGetCustomersParams,
): Promise<AxiosResponse<DefaultResponseWithPagination<ICustomerOut>>> =>
  apiAuth({ method: 'GET', url: customersUrl, params } satisfies AxiosRequestConfig);

export const requestCreateCustomer = (
  data: ICreateCustomerReq,
): Promise<AxiosResponse<DefaultResponse<ICustomerOut>>> =>
  apiAuth({ method: 'POST', url: customersUrl, data } satisfies AxiosRequestConfig);
