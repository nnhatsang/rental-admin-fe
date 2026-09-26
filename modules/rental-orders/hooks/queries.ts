import { useQuery } from '@tanstack/react-query';
import { requestGetRentalOrderById, requestGetRentalOrders } from '../api';
import type { IGetRentalOrdersParams } from '../model';
import { rentalOrderQueryKeys } from './keys';

export const useGetRentalOrders = (params: IGetRentalOrdersParams) =>
  useQuery({
    queryKey: rentalOrderQueryKeys.list(params),
    queryFn: async () => (await requestGetRentalOrders(params)).data.data,
    placeholderData: (previous) => previous,
  });

export const useGetRentalOrderById = (id: string | null, enabled = true) =>
  useQuery({
    queryKey: id ? rentalOrderQueryKeys.detail(id) : rentalOrderQueryKeys.details(),
    queryFn: async () => (await requestGetRentalOrderById(id as string)).data.data,
    enabled: enabled && Boolean(id),
  });

