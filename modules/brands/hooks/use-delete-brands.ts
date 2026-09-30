import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { TITLE_PAGE } from '@/utils/consts/title-page.const';
import { requestDeleteBrands } from '../services';
import { brandQueryKeys } from './keys';

export const useDeleteBrands = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ids: string[]) => requestDeleteBrands(ids),
    onSuccess: () => {
      toast.success(`Xóa ${TITLE_PAGE.BRAND.ROOT.toLowerCase()} thành công.`);
      queryClient.invalidateQueries({ queryKey: brandQueryKeys.lists() });
    },
  });
};
