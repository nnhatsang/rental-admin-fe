import { SUCCESS_MESSAGES } from '@/utils/consts/messages-success.const';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { requestUpdateCustomer } from '../services';
import type { IUpdateCustomerReq } from '../type';
import { customerQueryKeys } from './keys';

type UpdateCustomerParams = {
  id: string;
  data: IUpdateCustomerReq;
};

export const useUpdateCustomer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: UpdateCustomerParams) => requestUpdateCustomer(id, data),
    onSuccess: (_, variables) => {
      toast.success(SUCCESS_MESSAGES.CUSTOMERS.UPDATE);
      queryClient.invalidateQueries({ queryKey: customerQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: customerQueryKeys.detail(variables.id) });
    },
  });
};
