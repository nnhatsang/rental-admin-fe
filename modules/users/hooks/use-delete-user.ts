import { SUCCESS_MESSAGES } from '@/utils/consts/messages-success.const';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { userQueryKeys } from './keys';
import { requestDeleteMultiUser } from '../services';

export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userIds: string[]) => requestDeleteMultiUser(userIds),
    onSuccess: () => {
      toast.success(SUCCESS_MESSAGES.USERS.DELETE);
      // Cập nhật lại danh sách sau khi xóa
      queryClient.invalidateQueries({ queryKey: userQueryKeys.lists() });
    },
  });
};
