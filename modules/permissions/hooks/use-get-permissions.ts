import { useQuery } from '@tanstack/react-query';
import { requestGetPermissions } from '../services';
import type { IGetPermissionsParams } from '../type';

export const permissionQueryKeys = {
  all: ['permissions'] as const,
  lists: () => [...permissionQueryKeys.all, 'list'] as const,
  list: (params: IGetPermissionsParams = {}) => [...permissionQueryKeys.lists(), params] as const,
};

export const useGetPermissions = (params: IGetPermissionsParams = {}) => {
  return useQuery({
    queryKey: permissionQueryKeys.list(params),
    queryFn: async () => {
      const { data } = await requestGetPermissions(params);
      return data;
    },
    placeholderData: (previousData) => previousData,
  });
};
