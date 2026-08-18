import { SUCCESS_MESSAGES } from '@/utils/consts/messages-success.const';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { requestCreateCustomer } from '../services';
import type { ICreateCustomerReq } from '../type';
import { customerQueryKeys } from './keys';

export const useCreateCustomer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ICreateCustomerReq) => {
      const response = await requestCreateCustomer(data);
      return response.data.data;
    },
    onSuccess: () => {
      toast.success(SUCCESS_MESSAGES.CUSTOMERS.CREATE);
      queryClient.invalidateQueries({ queryKey: customerQueryKeys.lists() });
    },
  });
};
