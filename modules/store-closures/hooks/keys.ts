import type { IGetStoreClosuresParams } from '../type';

export const storeClosureQueryKeys = {
  all: ['store-closures'] as const,
  list: (params: IGetStoreClosuresParams) => [...storeClosureQueryKeys.all, 'list', params] as const,
};
