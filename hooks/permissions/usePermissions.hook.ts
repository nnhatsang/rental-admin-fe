import { requestGetPermissions } from '@/services/permissions';
import type { IGetPermissionsParams } from '@/types/permissions';
import { QUERY_KEYS } from '@/utils/consts/query-key.const';
import { useQuery } from '@tanstack/react-query';

export const usePermissions = (params?: IGetPermissionsParams) => {
  return useQuery({
    queryKey: [QUERY_KEYS.permissions, params],
    queryFn: async () => {
      const response = await requestGetPermissions(params);
      return response.data.data;
    },
  });
};
