import { useQuery } from '@tanstack/react-query';
import { requestGetCustomers } from '../services';
import type { IGetCustomersParams } from '../type';
import { rentalOrderCustomerQueryKeys } from './keys';

export const useGetCustomers = (params: IGetCustomersParams, enabled = true) =>
  useQuery({
    queryKey: rentalOrderCustomerQueryKeys.list(params),
    queryFn: async () => (await requestGetCustomers(params)).data.data,
    enabled,
    placeholderData: (previousData) => previousData,
  });
