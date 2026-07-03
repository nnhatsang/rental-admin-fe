import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { SUCCESS_MESSAGES } from '@/utils/consts/messages-success.const';
import { requestCreateRole } from '../services';
import type { ICreateRoleReq } from '../type';
import { roleQueryKeys } from './keys';

export const useCreateRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ICreateRoleReq) => requestCreateRole(data),
    onSuccess: () => {
      toast.success(SUCCESS_MESSAGES.ROLES.CREATE);
      queryClient.invalidateQueries({ queryKey: roleQueryKeys.lists() });
    },
  });
};
