import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { TITLE_PAGE } from '@/utils/consts/title-page.const';
import { requestUpdateBrand } from '../services';
import type { IUpdateBrandReq } from '../type';
import { brandQueryKeys } from './keys';

export const useUpdateBrand = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: IUpdateBrandReq }) => requestUpdateBrand(id, data),
    onSuccess: (_, variables) => {
      toast.success(`Cập nhật ${TITLE_PAGE.BRAND.ROOT.toLowerCase()} thành công.`);
      queryClient.invalidateQueries({ queryKey: brandQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: brandQueryKeys.detail(variables.id) });
    },
  });
};
