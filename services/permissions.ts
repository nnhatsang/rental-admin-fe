import { apiAuth } from '@/axios';
import type { DefaultResponse } from '@/types/api';
import type { IGetPermissionsParams, IPermissionOut } from '@/types/permissions';
import type { AxiosRequestConfig, AxiosResponse } from 'axios';

const url = '/permissions';

export const requestGetPermissions = (params?: IGetPermissionsParams): Promise<AxiosResponse<DefaultResponse<IPermissionOut[]>>> => {
  const config: AxiosRequestConfig = {
    method: 'GET',
    url,
    params,
  };

  return apiAuth(config);
};
