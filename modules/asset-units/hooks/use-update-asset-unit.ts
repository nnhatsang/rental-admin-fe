import { SUCCESS_MESSAGES } from '@/utils/consts/messages-success.const';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { requestUpdateAssetUnit } from '../services';
import type { IUpdateAssetUnitReq } from '../type';
import { assetUnitQueryKeys } from './keys';

type UpdateAssetUnitParams = {
  id: string;
  data: IUpdateAssetUnitReq;
};

export const useUpdateAssetUnit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: UpdateAssetUnitParams) => requestUpdateAssetUnit(id, data),
    onSuccess: (_, variables) => {
      toast.success(SUCCESS_MESSAGES.ASSET_UNITS.UPDATE);
      queryClient.invalidateQueries({ queryKey: assetUnitQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: assetUnitQueryKeys.detail(variables.id) });
    },
  });
};
