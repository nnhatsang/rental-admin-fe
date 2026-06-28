import { useQuery } from '@tanstack/react-query';
import { requestGetUserById } from '../services';
import { userQueryKeys } from './keys';

export const useGetUserById = (id: string, enabled = true) => {
  return useQuery({
    queryKey: userQueryKeys.detail(id),
    queryFn: async () => {
      const { data } = await requestGetUserById(id);
      return data;
    },
    enabled: !!id && enabled, // Chỉ gọi API khi có ID hợp lệ
  });
};
