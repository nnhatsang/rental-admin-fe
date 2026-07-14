import { useMutation, useQueryClient } from '@tanstack/react-query';
import { requestAssignRoleUsers } from '../services';
import { IAssignRoleUsersReq } from '../type';
import { SUCCESS_MESSAGES } from '@/utils/consts/messages-success.const';
import { toast } from 'sonner';
import { roleQueryKeys } from './keys';
import { userQueryKeys } from '@/modules/users/hooks/keys';

export const useAssgignUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: IAssignRoleUsersReq) => requestAssignRoleUsers(data),
    onSuccess: () => {
      toast.success(SUCCESS_MESSAGES.ROLES.ASSIGN_USERS);
      queryClient.invalidateQueries({ queryKey: roleQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: userQueryKeys.lists() });
    },
  });
};
