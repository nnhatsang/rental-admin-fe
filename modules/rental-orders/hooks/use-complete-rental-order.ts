import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { requestCompleteRentalOrder } from '../services';
import type { ICompleteRentalOrderReq } from '../type';
import { rentalOrderQueryKeys } from './keys';

type CompleteRentalOrderParams = {
  id: string;
  data?: ICompleteRentalOrderReq;
};

export const useCompleteRentalOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: CompleteRentalOrderParams) => (await requestCompleteRentalOrder(id, data)).data.data,
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: rentalOrderQueryKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: rentalOrderQueryKeys.detail(variables.id) });
      toast.success('Hoàn tất đơn thuê thành công');
    },
  });
};
