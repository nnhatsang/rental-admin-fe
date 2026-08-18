import { SUCCESS_MESSAGES } from '@/utils/consts/messages-success.const';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { requestUpdateCustomerStatus } from '../services';
import type { IUpdateCustomerStatusReq } from '../type';
import { customerQueryKeys } from './keys';

type UpdateCustomerStatusParams = {
  id: string;
  data: IUpdateCustomerStatusReq;
};

export const useUpdateCustomerStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: UpdateCustomerStatusParams) => requestUpdateCustomerStatus(id, data),
    onSuccess: (_, variables) => {
      toast.success(SUCCESS_MESSAGES.CUSTOMERS.UPDATE_STATUS);
      queryClient.invalidateQueries({ queryKey: customerQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: customerQueryKeys.detail(variables.id) });
    },
  });
};
