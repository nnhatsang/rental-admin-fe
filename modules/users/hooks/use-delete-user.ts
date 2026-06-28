import { useMutation, useQueryClient } from '@tanstack/react-query';
import { requestDeleteUser } from '../services';
import { userQueryKeys } from './keys';
import { toast } from 'sonner';
import { SUCCESS_MESSAGES } from '@/utils/consts/messages-success.const';

export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => requestDeleteUser(id),
    onSuccess: () => {
      toast.success(SUCCESS_MESSAGES.USERS.DELETE);
      // Cập nhật lại danh sách sau khi xóa
      queryClient.invalidateQueries({ queryKey: userQueryKeys.lists() });
    },
  });
};
