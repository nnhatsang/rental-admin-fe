import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { requestCancelRentalOrder } from '../services';
import type { ICancelRentalOrderReq } from '../type';
import { rentalOrderQueryKeys } from './keys';

type CancelRentalOrderParams = {
  id: string;
  data: ICancelRentalOrderReq;
};

export const useCancelRentalOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: CancelRentalOrderParams) => (await requestCancelRentalOrder(id, data)).data.data,
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: rentalOrderQueryKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: rentalOrderQueryKeys.detail(variables.id) });
      toast.success('Hủy đơn thuê thành công');
    },
  });
};
