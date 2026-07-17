import { SUCCESS_MESSAGES } from '@/utils/consts/messages-success.const';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { requestUpdateAssetUnitStatus } from '../services';
import type { IUpdateAssetUnitStatusReq } from '../type';
import { assetUnitQueryKeys } from './keys';

type UpdateAssetUnitStatusParams = {
  id: string;
  data: IUpdateAssetUnitStatusReq;
};

export const useUpdateAssetUnitStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: UpdateAssetUnitStatusParams) => requestUpdateAssetUnitStatus(id, data),
    onSuccess: (_, variables) => {
      toast.success(SUCCESS_MESSAGES.ASSET_UNITS.UPDATE_STATUS);
      queryClient.invalidateQueries({ queryKey: assetUnitQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: assetUnitQueryKeys.detail(variables.id) });
    },
  });
};
