import { SUCCESS_MESSAGES } from '@/utils/consts/messages-success.const';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { requestCreateProduct } from '../services';
import type { ICreateProductReq } from '../type';
import { productQueryKeys } from './keys';

export const useCreateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ICreateProductReq) => requestCreateProduct(data),
    onSuccess: () => {
      toast.success(SUCCESS_MESSAGES.PRODUCTS.CREATE);
      queryClient.invalidateQueries({ queryKey: productQueryKeys.lists() });
    },
  });
};
