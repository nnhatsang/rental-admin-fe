import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { requestCreateCustomer } from '../services';
import type { ICreateCustomerReq } from '../type';
import { rentalOrderCustomerQueryKeys } from './keys';

export const useCreateCustomer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ICreateCustomerReq) => (await requestCreateCustomer(data)).data.data,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: rentalOrderCustomerQueryKeys.all });
      toast.success('Tạo khách hàng thành công');
    },
  });
};
