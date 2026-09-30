import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { TITLE_PAGE } from '@/utils/consts/title-page.const';
import { requestUpdateCategory } from '../services';
import type { IUpdateCategoryReq } from '../type';
import { categoryQueryKeys } from './keys';

export const useUpdateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: IUpdateCategoryReq }) => requestUpdateCategory(id, data),
    onSuccess: (_, variables) => {
      toast.success(`Cập nhật ${TITLE_PAGE.CATEGORY.ROOT.toLowerCase()} thành công.`);
      queryClient.invalidateQueries({ queryKey: categoryQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: categoryQueryKeys.detail(variables.id) });
    },
  });
};
