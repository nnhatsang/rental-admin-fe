import { useQuery } from '@tanstack/react-query';
import { requestGetRoles } from '../services';
import { IGetRolesParams } from '../type';
import { roleQueryKeys } from './keys';

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
