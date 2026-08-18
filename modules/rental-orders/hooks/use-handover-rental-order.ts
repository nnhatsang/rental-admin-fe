import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { requestHandoverRentalOrder } from '../services';
import type { IHandoverRentalOrderReq } from '../type';
import { rentalOrderQueryKeys } from './keys';

type HandoverRentalOrderParams = {
  id: string;
  data?: IHandoverRentalOrderReq;
};

export const useHandoverRentalOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: HandoverRentalOrderParams) => (await requestHandoverRentalOrder(id, data)).data.data,
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: rentalOrderQueryKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: rentalOrderQueryKeys.detail(variables.id) });
      toast.success('Bàn giao đơn thuê thành công');
    },
  });
};
