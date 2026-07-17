import { SUCCESS_MESSAGES } from '@/utils/consts/messages-success.const';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { requestUpdateProduct } from '../services';
import type { IUpdateProductReq } from '../type';
import { productQueryKeys } from './keys';

type UpdateProductParams = {
  id: string;
  data: IUpdateProductReq;
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: UpdateProductParams) => requestUpdateProduct(id, data),
    onSuccess: (_, variables) => {
      toast.success(SUCCESS_MESSAGES.PRODUCTS.UPDATE);
      queryClient.invalidateQueries({ queryKey: productQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: productQueryKeys.detail(variables.id) });
    },
  });
};
