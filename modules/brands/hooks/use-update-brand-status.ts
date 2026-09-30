import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { TITLE_PAGE } from '@/utils/consts/title-page.const';
import { requestUpdateBrandStatus } from '../services';
import type { IUpdateBrandStatusReq } from '../type';
import { brandQueryKeys } from './keys';

export const useUpdateBrandStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: IUpdateBrandStatusReq }) => requestUpdateBrandStatus(id, data),
    onSuccess: (_, variables) => {
      toast.success(`Cập nhật trạng thái ${TITLE_PAGE.BRAND.ROOT.toLowerCase()} thành công.`);
      queryClient.invalidateQueries({ queryKey: brandQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: brandQueryKeys.detail(variables.id) });
    },
  });
};
