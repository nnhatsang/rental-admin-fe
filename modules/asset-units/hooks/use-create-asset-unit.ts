import { SUCCESS_MESSAGES } from '@/utils/consts/messages-success.const';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { requestCreateAssetUnit } from '../services';
import type { ICreateAssetUnitReq } from '../type';
import { assetUnitQueryKeys } from './keys';

export const useCreateAssetUnit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ICreateAssetUnitReq) => requestCreateAssetUnit(data),
    onSuccess: () => {
      toast.success(SUCCESS_MESSAGES.ASSET_UNITS.CREATE);
      queryClient.invalidateQueries({ queryKey: assetUnitQueryKeys.lists() });
    },
  });
};
