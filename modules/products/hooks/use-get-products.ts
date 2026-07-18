import { useQuery } from '@tanstack/react-query';
import { requestGetProducts } from '../services';
import type { IGetProductsParams } from '../type';
import { productQueryKeys } from './keys';

type UseGetProductsOptions = {
  enabled?: boolean;
};

export const useGetProducts = (params: IGetProductsParams, options: UseGetProductsOptions = {}) => {
  return useQuery({
    queryKey: productQueryKeys.list(params),
    queryFn: async () => {
      const { data } = await requestGetProducts(params);
      return data.data;
    },
    enabled: options.enabled ?? true,
    placeholderData: (previousData) => previousData,
  });
};
