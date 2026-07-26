import { useQuery } from '@tanstack/react-query';
import { requestGetAvailabilityTimeline } from '../services';
import type { IGetAvailabilityTimelineParams } from '../type';
import { availabilityQueryKeys } from './keys';

export const useGetAvailabilityTimeline = (params: IGetAvailabilityTimelineParams, enabled: boolean) =>
  useQuery({
    queryKey: availabilityQueryKeys.timelineList(params),
    queryFn: async () => (await requestGetAvailabilityTimeline(params)).data.data,
    enabled,
    placeholderData: (previousData) => previousData,
  });
