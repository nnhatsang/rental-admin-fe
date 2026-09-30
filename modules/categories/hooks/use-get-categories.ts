import { useQuery } from '@tanstack/react-query';
import { requestGetCategories } from '../services';
import type { IGetCategoriesParams } from '../type';
import { categoryQueryKeys } from './keys';

export const useGetCategories = (params: IGetCategoriesParams, enabled = true) =>
  useQuery({
    queryKey: categoryQueryKeys.list(params),
    queryFn: async () => {
      const { data } = await requestGetCategories(params);
      return data.data;
    },
    enabled,
    placeholderData: (previousData) => previousData,
  });
