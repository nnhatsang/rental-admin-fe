import { useMutation, useQueryClient } from '@tanstack/react-query';
import { requestUpdateUser } from '../services';
import { IUpdateUserReq } from '../type';
import { userQueryKeys } from './keys';
import { toast } from 'sonner';
import { SUCCESS_MESSAGES } from '@/utils/consts/messages-success.const';

interface UpdateUserParams {
  id: string;
  data: IUpdateUserReq;
}

export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: UpdateUserParams) => requestUpdateUser(id, data),
    onSuccess: (_, variables) => {
      toast.success(SUCCESS_MESSAGES.USERS.UPDATE);
      // Làm mới danh sách và chi tiết của chính user vừa sửa
      queryClient.invalidateQueries({ queryKey: userQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: userQueryKeys.detail(variables.id) });
    },
  });
};
