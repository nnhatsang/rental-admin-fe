import { useQuery } from '@tanstack/react-query';
import { requestGetRentalOrderById } from '../services';
import { rentalOrderQueryKeys } from './keys';

export const useGetRentalOrderById = (id?: string) =>
  useQuery({
    queryKey: id ? rentalOrderQueryKeys.detail(id) : [...rentalOrderQueryKeys.all, 'detail'],
    queryFn: async () => {
      if (!id) return null;
      return (await requestGetRentalOrderById(id)).data.data;
    },
    enabled: Boolean(id),
  });
