import { useQuery } from '@tanstack/react-query';
import { requestGetProductById } from '../services';
import { productQueryKeys } from './keys';

export const useGetProductById = (id?: string) => {
  return useQuery({
    queryKey: id ? productQueryKeys.detail(id) : productQueryKeys.details(),
    queryFn: async () => {
      if (!id) return null;
      const { data } = await requestGetProductById(id);
      return data.data;
    },
    enabled: !!id,
  });
};
