import { useQuery } from '@tanstack/react-query';
import { requestGetAvailabilityProducts } from '../services';
import type { IGetAvailabilityProductsParams } from '../type';
import { availabilityQueryKeys } from './keys';

export const useGetAvailabilityProducts = (params: IGetAvailabilityProductsParams, enabled: boolean) =>
  useQuery({
    queryKey: availabilityQueryKeys.productList(params),
    queryFn: async () => (await requestGetAvailabilityProducts(params)).data.data,
    enabled,
    placeholderData: (previousData) => previousData,
  });
