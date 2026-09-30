import { useQuery } from '@tanstack/react-query';
import { requestGetBrands } from '../services';
import type { IGetBrandsParams } from '../type';
import { brandQueryKeys } from './keys';

export const useGetBrands = (params: IGetBrandsParams, enabled = true) =>
  useQuery({
    queryKey: brandQueryKeys.list(params),
    queryFn: async () => {
      const { data } = await requestGetBrands(params);
      return data.data;
    },
    enabled,
    placeholderData: (previousData) => previousData,
  });
