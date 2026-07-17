import { useQuery } from '@tanstack/react-query';
import { requestGetAssetUnits } from '../services';
import type { IGetAssetUnitsParams } from '../type';
import { assetUnitQueryKeys } from './keys';

export const useGetAssetUnits = (params: IGetAssetUnitsParams) => {
  return useQuery({
    queryKey: assetUnitQueryKeys.list(params),
    queryFn: async () => {
      const { data } = await requestGetAssetUnits(params);
      return data.data;
    },
    placeholderData: (previousData) => previousData,
  });
};
