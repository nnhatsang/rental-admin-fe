import { apiAuth } from '@/axios';
import type { DefaultResponse } from '@/types/api';
import type { AxiosRequestConfig, AxiosResponse } from 'axios';
import type { IGetPermissionsParams, IPermissionOut } from './type';

const url = '/permissions';

export const requestGetPermissions = (
  params: IGetPermissionsParams = {},
): Promise<AxiosResponse<DefaultResponse<IPermissionOut[]>>> => {
  const config: AxiosRequestConfig = {
    method: 'GET',
    url,
    params,
  };

  return apiAuth(config);
};
