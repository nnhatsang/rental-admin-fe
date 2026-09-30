import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { TITLE_PAGE } from '@/utils/consts/title-page.const';
import { requestCreateCategory } from '../services';
import type { ICreateCategoryReq } from '../type';
import { categoryQueryKeys } from './keys';

export const useCreateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ICreateCategoryReq) => requestCreateCategory(data),
    onSuccess: () => {
      toast.success(`Tạo ${TITLE_PAGE.CATEGORY.ROOT.toLowerCase()} thành công.`);
      queryClient.invalidateQueries({ queryKey: categoryQueryKeys.lists() });
    },
  });
};
