import { useQuery } from '@tanstack/react-query';
import { requestGetStoreBussinessHours } from '../services';
export const storeBussinessHourQueryKeys = {
  all: ['store-business-hour'] as const,
  lists: () => [...storeBussinessHourQueryKeys.all, 'list'] as const,
};

export const useGetStoreBussinessHours = (enabled = true) => {
  return useQuery({
    queryKey: storeBussinessHourQueryKeys.lists(),
    queryFn: async () => {
      const { data } = await requestGetStoreBussinessHours();
      return data;
    },
    enabled,
    staleTime: 'static',
    gcTime: Infinity, // không bị garbage collect
  });
};
