import type {
  IGetAvailabilityAssetsParams,
  IGetAvailabilityProductsParams,
  IGetAvailabilityTimelineParams,
} from '../type';

export const availabilityQueryKeys = {
  all: ['rental-availability'] as const,
  products: () => [...availabilityQueryKeys.all, 'products'] as const,
  productList: (params: IGetAvailabilityProductsParams) => [...availabilityQueryKeys.products(), params] as const,
  assets: () => [...availabilityQueryKeys.all, 'assets'] as const,
  assetList: (params: IGetAvailabilityAssetsParams) => [...availabilityQueryKeys.assets(), params] as const,
  timeline: () => [...availabilityQueryKeys.all, 'timeline'] as const,
  timelineList: (params: IGetAvailabilityTimelineParams) => [...availabilityQueryKeys.timeline(), params] as const,
};
