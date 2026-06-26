import { apiAuth } from '@/axios';
import type { DefaultResponse, DefaultResponseWithPagination } from '@/types/api';

import type { AxiosRequestConfig, AxiosResponse } from 'axios';
import { IGetRolesParams, IRole, IRoleRequestAssign, IRoleRequestCreate, IRoleRequestUpdate } from './type';

const url = '/roles';

export const requestGetRoles = (
  params: IGetRolesParams,
): Promise<AxiosResponse<DefaultResponseWithPagination<IRole>>> => {
  const config: AxiosRequestConfig = {
    method: 'GET',
    url,
    params,
  };

  return apiAuth(config);
};

export const requestGetRoleById = (id: string): Promise<AxiosResponse<DefaultResponse<IRole>>> => {
  const config: AxiosRequestConfig = {
    method: 'GET',
    url: `${url}/${id}`,
  };

  return apiAuth(config);
};

export const requestCreateRole = (data: IRoleRequestCreate): Promise<AxiosResponse<DefaultResponse<IRole>>> => {
  const config: AxiosRequestConfig = {
    method: 'POST',
    url,
    data,
  };

  return apiAuth(config);
};

export const requestUpdateRole = (
  id: string,
  data: IRoleRequestUpdate,
): Promise<AxiosResponse<DefaultResponse<IRole>>> => {
  const config: AxiosRequestConfig = {
    method: 'PATCH',
    url: `${url}/${id}`,
    data,
  };

  return apiAuth(config);
};

export const requestAssignRoleUsers = (data: IRoleRequestAssign): Promise<AxiosResponse> => {
  const config: AxiosRequestConfig = {
    method: 'PUT',
    url: `${url}/assign`,
    data,
  };

  return apiAuth(config);
};

export const requestDeleteRole = (data: { roleIds: string[] }): Promise<AxiosResponse> => {
  const config: AxiosRequestConfig = {
    method: 'DELETE',
    data,
  };

  return apiAuth(config);
};
