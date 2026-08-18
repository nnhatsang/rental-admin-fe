import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { requestDeleteRentalOrders } from '../services';
import type { IDeleteRentalOrdersReq } from '../type';
import { rentalOrderQueryKeys } from './keys';

export const useDeleteRentalOrders = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: IDeleteRentalOrdersReq) => (await requestDeleteRentalOrders(data)).data.data,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: rentalOrderQueryKeys.lists() });
      toast.success('Xóa đơn thuê thành công');
    },
  });
};
