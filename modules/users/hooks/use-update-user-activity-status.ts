import { useMutation, useQueryClient } from '@tanstack/react-query';
import { requestUpdateUserActivityStatus } from '../services';
import { IUpdateUserActivityStatusReq } from '../type';
import { userQueryKeys } from './keys';
import { toast } from 'sonner';
import { SUCCESS_MESSAGES } from '@/utils/consts/messages-success.const';

interface UpdateStatusParams {
  id: string;
  data: IUpdateUserActivityStatusReq;
}

export const useUpdateUserActivityStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: UpdateStatusParams) => requestUpdateUserActivityStatus(id, data),
    onSuccess: (_, variables) => {
      // toast.success(SUCCESS_MESSAGES.USERS.ACTIVITY_STATUS_UPDATE);
      // queryClient.invalidateQueries({ queryKey: userQueryKeys.lists() });
      // queryClient.invalidateQueries({ queryKey: userQueryKeys.detail(variables.id) });
    },
  });
};
