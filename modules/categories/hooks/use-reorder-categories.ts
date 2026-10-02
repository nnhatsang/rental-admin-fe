import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { TITLE_PAGE } from '@/utils/consts/title-page.const';
import { requestReorderCategories } from '../services';
import type { IReorderCategoriesReq } from '../type';
import { categoryQueryKeys } from './keys';

export const useReorderCategories = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: IReorderCategoriesReq) => requestReorderCategories(data),
    onSuccess: () => {
      toast.success(`Cập nhật thứ tự ${TITLE_PAGE.CATEGORY.ROOT.toLowerCase()} thành công.`);
      queryClient.invalidateQueries({ queryKey: categoryQueryKeys.lists() });
    },
    onError: () => {
      toast.error(`Không thể cập nhật thứ tự ${TITLE_PAGE.CATEGORY.ROOT.toLowerCase()}.`);
    },
  });
};
