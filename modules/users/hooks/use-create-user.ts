import { useMutation, useQueryClient } from '@tanstack/react-query';
import { requestCreateUser } from '../services';
import { ICreateUserReq } from '../type';
import { userQueryKeys } from './keys';
import { toast } from 'sonner';
import { SUCCESS_MESSAGES } from '@/utils/consts/messages-success.const';

export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ICreateUserReq) => requestCreateUser(data),
    onSuccess: () => {
      toast.success(SUCCESS_MESSAGES.USERS.CREATE);
      queryClient.invalidateQueries({ queryKey: userQueryKeys.lists() });
    },
  });
};
