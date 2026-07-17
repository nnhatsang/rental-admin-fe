import { useQuery } from '@tanstack/react-query';
import { requestGetAssetUnitById } from '../services';
import { assetUnitQueryKeys } from './keys';

export const useGetAssetUnitById = (id?: string) => {
  return useQuery({
    queryKey: id ? assetUnitQueryKeys.detail(id) : assetUnitQueryKeys.details(),
    queryFn: async () => {
      if (!id) return null;
      const { data } = await requestGetAssetUnitById(id);
      return data.data;
    },
    enabled: !!id,
  });
};
