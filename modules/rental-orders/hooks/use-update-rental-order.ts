import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { requestUpdateRentalOrder } from '../services';
import type { IUpdateRentalOrderReq } from '../type';
import { rentalOrderQueryKeys } from './keys';

type UpdateRentalOrderParams = {
  id: string;
  data: IUpdateRentalOrderReq;
};

export const useUpdateRentalOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: UpdateRentalOrderParams) => (await requestUpdateRentalOrder(id, data)).data.data,
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: rentalOrderQueryKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: rentalOrderQueryKeys.detail(variables.id) });
      toast.success('Cập nhật đơn thuê thành công');
    },
  });
};
