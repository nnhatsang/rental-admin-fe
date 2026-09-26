import type { IGetRentalOrdersParams } from '../model';

export const rentalOrderQueryKeys = {
  all: ['rental-orders'] as const,
  lists: () => [...rentalOrderQueryKeys.all, 'list'] as const,
  list: (params: IGetRentalOrdersParams) => [...rentalOrderQueryKeys.lists(), params] as const,
  details: () => [...rentalOrderQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...rentalOrderQueryKeys.details(), id] as const,
};
