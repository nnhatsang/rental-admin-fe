import { useQuery } from '@tanstack/react-query';
import { requestGetUsers } from '../services';
import { IGetUsersParams } from '../type';
import { userQueryKeys } from './keys';

export const useGetUsers = (params: IGetUsersParams) => {
  return useQuery({
    queryKey: userQueryKeys.list(params),
    queryFn: async () => {
      const { data } = await requestGetUsers(params);
      return data;
    },
    placeholderData: (previousData) => previousData, // Giữ UI mượt khi đổi trang
  });
};
