import { SUCCESS_MESSAGES } from '@/utils/consts/messages-success.const';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { requestDeleteCustomers } from '../services';
import { customerQueryKeys } from './keys';

export const useDeleteCustomers = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (customerIds: string[]) => requestDeleteCustomers(customerIds),
    onSuccess: () => {
      toast.success(SUCCESS_MESSAGES.CUSTOMERS.DELETE);
      queryClient.invalidateQueries({ queryKey: customerQueryKeys.lists() });
    },
  });
};
