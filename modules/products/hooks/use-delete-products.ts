import { SUCCESS_MESSAGES } from '@/utils/consts/messages-success.const';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { requestDeleteProducts } from '../services';
import { productQueryKeys } from './keys';

export const useDeleteProducts = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productIds: string[]) => requestDeleteProducts(productIds),
    onSuccess: () => {
      toast.success(SUCCESS_MESSAGES.PRODUCTS.DELETE);
      queryClient.invalidateQueries({ queryKey: productQueryKeys.lists() });
    },
  });
};
