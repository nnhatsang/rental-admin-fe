import type { IGetAssetUnitsParams } from '../type';

export const assetUnitQueryKeys = {
  all: ['asset-units'] as const,
  lists: () => [...assetUnitQueryKeys.all, 'list'] as const,
  list: (params: IGetAssetUnitsParams) => [...assetUnitQueryKeys.lists(), params] as const,
  details: () => [...assetUnitQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...assetUnitQueryKeys.details(), id] as const,
};
