import { useQuery } from '@tanstack/react-query';
import { requestGetAvailabilityAssets } from '../services';
import type { IGetAvailabilityAssetsParams } from '../type';
import { availabilityQueryKeys } from './keys';

export const useGetAvailabilityAssets = (params: IGetAvailabilityAssetsParams, enabled: boolean) =>
  useQuery({
    queryKey: availabilityQueryKeys.assetList(params),
    queryFn: async () => (await requestGetAvailabilityAssets(params)).data.data,
    enabled,
    placeholderData: (previousData) => previousData,
    
  });
