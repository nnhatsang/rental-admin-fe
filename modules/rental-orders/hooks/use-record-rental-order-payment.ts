import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { requestRecordRentalOrderPayment } from '../services';
import type { IRecordRentalOrderPaymentReq } from '../type';
import { rentalOrderQueryKeys } from './keys';

type RecordRentalOrderPaymentParams = {
  id: string;
  data: IRecordRentalOrderPaymentReq;
};

export const useRecordRentalOrderPayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: RecordRentalOrderPaymentParams) =>
      (await requestRecordRentalOrderPayment(id, data)).data.data,
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: rentalOrderQueryKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: rentalOrderQueryKeys.detail(variables.id) });
      toast.success('Ghi nhận thanh toán thành công');
    },
  });
};
