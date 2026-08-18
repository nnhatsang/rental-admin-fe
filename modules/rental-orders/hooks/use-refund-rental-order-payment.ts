import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { requestRefundRentalOrderPayment } from '../services';
import type { IRefundRentalOrderPaymentReq } from '../type';
import { rentalOrderQueryKeys } from './keys';

type RefundRentalOrderPaymentParams = {
  id: string;
  data: IRefundRentalOrderPaymentReq;
};

export const useRefundRentalOrderPayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: RefundRentalOrderPaymentParams) =>
      (await requestRefundRentalOrderPayment(id, data)).data.data,
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: rentalOrderQueryKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: rentalOrderQueryKeys.detail(variables.id) });
      toast.success('Ghi nhận hoàn tiền thành công');
    },
  });
};
