import { apiAuth } from '@/axios';
import type { DefaultResponse } from '@/types/api';
import type { AxiosRequestConfig, AxiosResponse } from 'axios';
import type { IStoreBussinessHoursOut, IUpdateStoreBussinessHoursReq } from './type';

const url = '/store-business-hours';

export const requestGetStoreBussinessHours = (): Promise<AxiosResponse<DefaultResponse<IStoreBussinessHoursOut[]>>> => {
  const config: AxiosRequestConfig = {
    method: 'GET',
    url,
  };

  return apiAuth(config);
};

export const requestUpdateStoreBussinessHours = (
  data: IUpdateStoreBussinessHoursReq,
): Promise<AxiosResponse<DefaultResponse<IStoreBussinessHoursOut[]>>> => {
  const config: AxiosRequestConfig = {
    method: 'PUT',
    url,
    data,
  };

  return apiAuth(config);
};
