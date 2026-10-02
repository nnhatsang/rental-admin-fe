import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { requestUpdateStoreBussinessHours } from '../services';
import type { IUpdateStoreBussinessHoursReq } from '../type';
import { storeBussinessHourQueryKeys } from './keys';

export const useUpdateStoreBussinessHours = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: IUpdateStoreBussinessHoursReq) => requestUpdateStoreBussinessHours(data),
    onSuccess: async () => {
      toast.success('Đã cập nhật giờ hoạt động.');
      await queryClient.invalidateQueries({ queryKey: storeBussinessHourQueryKeys.all });
    },
  });
};
