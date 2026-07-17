import { SUCCESS_MESSAGES } from '@/utils/consts/messages-success.const';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { requestUpdateProductStatus } from '../services';
import type { IUpdateProductStatusReq } from '../type';
import { productQueryKeys } from './keys';

type UpdateProductStatusParams = {
  id: string;
  data: IUpdateProductStatusReq;
};

export const useUpdateProductStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: UpdateProductStatusParams) => requestUpdateProductStatus(id, data),
    onSuccess: (_, variables) => {
      toast.success(SUCCESS_MESSAGES.PRODUCTS.UPDATE_STATUS);
      queryClient.invalidateQueries({ queryKey: productQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: productQueryKeys.detail(variables.id) });
    },
  });
};
