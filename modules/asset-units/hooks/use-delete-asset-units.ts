import { SUCCESS_MESSAGES } from '@/utils/consts/messages-success.const';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { requestDeleteAssetUnits } from '../services';
import { assetUnitQueryKeys } from './keys';

export const useDeleteAssetUnits = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (assetUnitIds: string[]) => requestDeleteAssetUnits(assetUnitIds),
    onSuccess: () => {
      toast.success(SUCCESS_MESSAGES.ASSET_UNITS.DELETE);
      queryClient.invalidateQueries({ queryKey: assetUnitQueryKeys.lists() });
    },
  });
};
