import { apiAuth, apiClient } from '@/axios';
import type { DefaultResponse } from '@/types/api';
import type { AxiosRequestConfig, AxiosResponse } from 'axios';
import { IStoreBussinessHoursOut } from './type';

const url = '/store-business-hours';

export const requestGetStoreBussinessHours = (): Promise<AxiosResponse<DefaultResponse<IStoreBussinessHoursOut[]>>> => {
  const config: AxiosRequestConfig = {
    method: 'GET',
    url,
  };

  return apiAuth(config);
};
