import { useQuery } from '@tanstack/react-query';
import { requestGetStoreBussinessHours } from '../services';
import { PERSISTED_QUERY_CONFIG } from '@/lib/react-query-persist-config';
export const storeBussinessHourQueryKeys = {
  all: ['store-business-hour'] as const,
  lists: () => [...storeBussinessHourQueryKeys.all, 'list'] as const,
};

const cacheConfig = PERSISTED_QUERY_CONFIG['store-business-hour'];

export const useGetStoreBussinessHours = (enabled = true) => {
  return useQuery({
    queryKey: storeBussinessHourQueryKeys.lists(),
    queryFn: async () => {
      const { data } = await requestGetStoreBussinessHours();
      return data;
    },
    enabled,
    staleTime: cacheConfig.staleTime,
    gcTime: cacheConfig.gcTime,
  });
};
