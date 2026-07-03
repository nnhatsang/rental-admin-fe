import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { SUCCESS_MESSAGES } from '@/utils/consts/messages-success.const';
import { requestDeleteRole } from '../services';
import { roleQueryKeys } from './keys';

export const useDeleteRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (roleIds: string[]) => requestDeleteRole({ roleIds }),
    onSuccess: () => {
      toast.success(SUCCESS_MESSAGES.ROLES.DELETE);
      queryClient.invalidateQueries({ queryKey: roleQueryKeys.lists() });
    },
  });
};
