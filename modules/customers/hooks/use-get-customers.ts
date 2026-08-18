import { useQuery } from '@tanstack/react-query';
import { requestGetCustomers } from '../services';
import type { IGetCustomersParams } from '../type';
import { customerQueryKeys } from './keys';

export const useGetCustomers = (params: IGetCustomersParams, enabled = true) => {
  return useQuery({
    queryKey: customerQueryKeys.list(params),
    queryFn: async () => {
      const { data } = await requestGetCustomers(params);
      return data.data;
    },
    enabled,
    placeholderData: (previousData) => previousData,
  });
};
