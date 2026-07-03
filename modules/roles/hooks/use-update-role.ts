import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { SUCCESS_MESSAGES } from '@/utils/consts/messages-success.const';
import { requestUpdateRole } from '../services';
import type { IUpdateRoleReq } from '../type';
import { roleQueryKeys } from './keys';

interface UpdateRoleParams {
  id: string;
  data: IUpdateRoleReq;
}

export const useUpdateRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: UpdateRoleParams) => requestUpdateRole(id, data),
    onSuccess: (_, variables) => {
      toast.success(SUCCESS_MESSAGES.ROLES.UPDATE);
      queryClient.invalidateQueries({ queryKey: roleQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: roleQueryKeys.detail(variables.id) });
    },
  });
};
