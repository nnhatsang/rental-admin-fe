import { useQuery } from '@tanstack/react-query';
import { requestGetProducts } from '../services';
import type { IGetProductsParams } from '../type';
import { productQueryKeys } from './keys';

export const useGetProducts = (params: IGetProductsParams) => {
  return useQuery({
    queryKey: productQueryKeys.list(params),
    queryFn: async () => {
      const { data } = await requestGetProducts(params);
      return data.data;
    },
    placeholderData: (previousData) => previousData,
  });
};
