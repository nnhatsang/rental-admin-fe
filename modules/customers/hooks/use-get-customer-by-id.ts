import { useQuery } from '@tanstack/react-query';
import { requestGetCustomerById } from '../services';
import { customerQueryKeys } from './keys';

export const useGetCustomerById = (id?: string) => {
  return useQuery({
    queryKey: id ? customerQueryKeys.detail(id) : customerQueryKeys.details(),
    queryFn: async () => {
      if (!id) return null;
      const { data } = await requestGetCustomerById(id);
      return data.data;
    },
    enabled: Boolean(id),
  });
};
