import {
  requestCreateAssetUnit,
  requestDeleteAssetUnit,
  requestGetAssetUnitById,
  requestGetAssetUnits,
  requestUpdateAssetUnit,
  requestUpdateAssetUnitStatus,
} from '@/services/asset-units';
import type {
  ICreateAssetUnitReq,
  IGetAssetUnitsParams,
  IUpdateAssetUnitReq,
  IUpdateAssetUnitStatusReq,
} from '@/types/asset-units';
import { ERROR_MESSAGES } from '@/utils/consts/message-error.const';
import { QUERY_KEYS } from '@/utils/consts/query-key.const';
import { SUCCESS_MESSAGES } from '@/utils/consts/messages-success.const';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export const useAssetUnits = (params: IGetAssetUnitsParams) => {
  return useQuery({
    queryKey: [QUERY_KEYS.assetUnits, params],
    queryFn: async () => {
      const response = await requestGetAssetUnits(params);
      return response.data.data;
    },
  });
};

export const useAssetUnit = (id?: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.assetUnits, id],
    queryFn: async () => {
      const response = await requestGetAssetUnitById(id!);
      return response.data.data;
    },
    enabled: Boolean(id),
  });
};

export const useCreateAssetUnit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ICreateAssetUnitReq) => requestCreateAssetUnit(data),
    onError: () => toast.error(ERROR_MESSAGES.ASSET_UNITS.CREATE),
    onSuccess: () => {
      toast.success(SUCCESS_MESSAGES.ASSET_UNITS.CREATE);
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.assetUnits] });
    },
  });
};

export const useUpdateAssetUnit = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: IUpdateAssetUnitReq) => requestUpdateAssetUnit(id, data),
    onError: () => toast.error(ERROR_MESSAGES.ASSET_UNITS.UPDATE),
    onSuccess: () => {
      toast.success(SUCCESS_MESSAGES.ASSET_UNITS.UPDATE);
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.assetUnits] });
    },
  });
};

export const useUpdateAssetUnitStatus = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: IUpdateAssetUnitStatusReq) => requestUpdateAssetUnitStatus(id, data),
    onError: () => toast.error(ERROR_MESSAGES.ASSET_UNITS.UPDATE_STATUS),
    onSuccess: () => {
      toast.success(SUCCESS_MESSAGES.ASSET_UNITS.UPDATE_STATUS);
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.assetUnits] });
    },
  });
};

export const useDeleteAssetUnit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => requestDeleteAssetUnit(id),
    onError: () => toast.error(ERROR_MESSAGES.ASSET_UNITS.DELETE),
    onSuccess: () => {
      toast.success(SUCCESS_MESSAGES.ASSET_UNITS.DELETE);
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.assetUnits] });
    },
  });
};
