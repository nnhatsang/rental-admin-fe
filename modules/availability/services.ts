import { apiAuth } from '@/axios';
import type { DefaultResponse } from '@/types/api';
import type { AxiosRequestConfig, AxiosResponse } from 'axios';
import type {
  IAvailabilityAssetsData,
  IAvailabilityProductsData,
  IAvailabilityTimelineData,
  IGetAvailabilityAssetsParams,
  IGetAvailabilityProductsParams,
  IGetAvailabilityTimelineParams,
} from './type';

const url = '/availability';

export const requestGetAvailabilityProducts = (
  params: IGetAvailabilityProductsParams,
): Promise<AxiosResponse<DefaultResponse<IAvailabilityProductsData>>> =>
  apiAuth({ method: 'GET', url: `${url}/products`, params } satisfies AxiosRequestConfig);

export const requestGetAvailabilityAssets = (
  params: IGetAvailabilityAssetsParams,
): Promise<AxiosResponse<DefaultResponse<IAvailabilityAssetsData>>> => {
  return apiAuth({ method: 'GET', url: `${url}/assets`, params } satisfies AxiosRequestConfig);
};

export const requestGetAvailabilityTimeline = (
  params: IGetAvailabilityTimelineParams,
): Promise<AxiosResponse<DefaultResponse<IAvailabilityTimelineData>>> =>
  apiAuth({ method: 'GET', url: `${url}/timeline`, params } satisfies AxiosRequestConfig);
