import { useQuery } from '@tanstack/react-query';
import { requestGetRoles } from '../services';
import { IGetRolesParams } from '../type';

export const roleQueryKeys = {
  all: ['roles'] as const,
  lists: () => [...roleQueryKeys.all, 'list'] as const,
  list: (params: IGetRolesParams) => [...roleQueryKeys.lists(), params] as const,
};

export const useGetRoles = (params: IGetRolesParams) => {
  return useQuery({
    queryKey: roleQueryKeys.list(params),
    queryFn: async () => {
      const { data } = await requestGetRoles(params);
      return data;
    },
    placeholderData: (previousData) => previousData,
  });
};
