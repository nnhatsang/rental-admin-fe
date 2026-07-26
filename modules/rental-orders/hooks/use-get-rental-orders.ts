import { useQuery } from '@tanstack/react-query';
import { requestGetRentalOrders } from '../services';
import type { IGetRentalOrdersParams } from '../type';
import { rentalOrderQueryKeys } from './keys';

export const useGetRentalOrders = (params: IGetRentalOrdersParams) =>
  useQuery({
    queryKey: rentalOrderQueryKeys.list(params),
    queryFn: async () => (await requestGetRentalOrders(params)).data.data,
    placeholderData: (previousData) => previousData,
  });
