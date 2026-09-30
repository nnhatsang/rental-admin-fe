import type { IGetBrandsParams } from '../type';

export const brandQueryKeys = {
  all: ['brands'] as const,
  lists: () => [...brandQueryKeys.all, 'list'] as const,
  list: (params: IGetBrandsParams) => [...brandQueryKeys.lists(), params] as const,
  details: () => [...brandQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...brandQueryKeys.details(), id] as const,
};
