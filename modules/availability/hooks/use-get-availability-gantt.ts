import { useInfiniteQuery } from '@tanstack/react-query';
import { requestGetAvailabilityGantt } from '../gantt-services';
import type { IGetAvailabilityGanttParams } from '../gantt-type';
import { availabilityGanttQueryKeys } from './keys';


export const useGetAvailabilityGantt = (params: IGetAvailabilityGanttParams, enabled: boolean) => {
  const { cursor: _cursor, ...queryKeyParams } = params;

  return useInfiniteQuery({
    queryKey: availabilityGanttQueryKeys.list(queryKeyParams),
    initialPageParam: undefined as string | undefined,
    queryFn: async ({ pageParam }) => {
      const response = await requestGetAvailabilityGantt({
        ...params,
        ...(pageParam ? { cursor: pageParam } : {}),
      });
      return response.data.data;
    },
    getNextPageParam: (lastPage) => (lastPage.pagination.hasNext ? lastPage.pagination.nextCursor ?? undefined : undefined),
    enabled,
  });
};
