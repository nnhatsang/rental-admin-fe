import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { TITLE_PAGE } from '@/utils/consts/title-page.const';
import { requestDeleteCategories } from '../services';
import { categoryQueryKeys } from './keys';

export const useDeleteCategories = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ids: string[]) => requestDeleteCategories(ids),
    onSuccess: () => {
      toast.success(`Xóa ${TITLE_PAGE.CATEGORY.ROOT.toLowerCase()} thành công.`);
      queryClient.invalidateQueries({ queryKey: categoryQueryKeys.lists() });
    },
  });
};
