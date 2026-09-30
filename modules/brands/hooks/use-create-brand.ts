import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { TITLE_PAGE } from '@/utils/consts/title-page.const';
import { requestCreateBrand } from '../services';
import type { ICreateBrandReq } from '../type';
import { brandQueryKeys } from './keys';

export const useCreateBrand = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ICreateBrandReq) => requestCreateBrand(data),
    onSuccess: () => {
      toast.success(`Tạo ${TITLE_PAGE.BRAND.ROOT.toLowerCase()} thành công.`);
      queryClient.invalidateQueries({ queryKey: brandQueryKeys.lists() });
    },
  });
};
