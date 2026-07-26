import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { requestCreateRentalOrder } from '../services';
import type { ICreateRentalOrderReq } from '../type';
import { rentalOrderQueryKeys } from './keys';

export const useCreateRentalOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ICreateRentalOrderReq) => (await requestCreateRentalOrder(data)).data.data,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: rentalOrderQueryKeys.lists() });
      toast.success('Tạo đơn thuê thành công');
    },
  });
};
