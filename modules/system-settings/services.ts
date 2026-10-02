import { apiAuth } from '@/axios';
import type { DefaultResponse } from '@/types/api';
import type { AxiosRequestConfig, AxiosResponse } from 'axios';
import type { ISystemSettingsOut, IUpdateSystemSettingsReq } from './type';

const url = '/system-settings';

export const requestGetSystemSettings = (): Promise<AxiosResponse<DefaultResponse<ISystemSettingsOut>>> => {
  const config: AxiosRequestConfig = {
    method: 'GET',
    url,
  };

  return apiAuth(config);
};

export const requestUpdateSystemSettings = (
  data: IUpdateSystemSettingsReq,
): Promise<AxiosResponse<DefaultResponse<ISystemSettingsOut>>> => {
  const config: AxiosRequestConfig = {
    method: 'PATCH',
    url,
    data,
  };

  return apiAuth(config);
};
