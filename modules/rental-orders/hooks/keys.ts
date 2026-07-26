import type { IGetCustomersParams, IGetRentalOrdersParams } from '../type';

export const rentalOrderQueryKeys = {
  all: ['rental-orders'] as const,
  lists: () => [...rentalOrderQueryKeys.all, 'list'] as const,
  list: (params: IGetRentalOrdersParams) => [...rentalOrderQueryKeys.lists(), params] as const,
  detail: (id: string) => [...rentalOrderQueryKeys.all, 'detail', id] as const,
};

export const rentalOrderCustomerQueryKeys = {
  all: ['rental-order-customers'] as const,
  list: (params: IGetCustomersParams) => [...rentalOrderCustomerQueryKeys.all, params] as const,
};
