import { apiAuth } from '@/axios';
import type { DefaultResponse, DefaultResponseWithPagination } from '@/types/api';

import type { AxiosRequestConfig, AxiosResponse } from 'axios';
import type { IAssignRoleUsersReq, ICreateRoleReq, IDeleteRolesReq, IGetRolesParams, IRoleOut, IUpdateRoleReq } from './type';

const url = '/roles';

export const requestGetRoles = (
  params: IGetRolesParams,
): Promise<AxiosResponse<DefaultResponseWithPagination<IRoleOut>>> => {
  const config: AxiosRequestConfig = {
    method: 'GET',
    url,
    params,
  };

  return apiAuth(config);
};

export const requestGetRoleById = (id: string): Promise<AxiosResponse<DefaultResponse<IRoleOut>>> => {
  const config: AxiosRequestConfig = {
    method: 'GET',
    url: `${url}/${id}`,
  };

  return apiAuth(config);
};

export const requestCreateRole = (data: ICreateRoleReq): Promise<AxiosResponse<DefaultResponse<IRoleOut>>> => {
  const config: AxiosRequestConfig = {
    method: 'POST',
    url,
    data,
  };

  return apiAuth(config);
};

export const requestUpdateRole = (
  id: string,
  data: IUpdateRoleReq,
): Promise<AxiosResponse<DefaultResponse<IRoleOut>>> => {
  const config: AxiosRequestConfig = {
    method: 'PATCH',
    url: `${url}/${id}`,
    data,
  };

  return apiAuth(config);
};

export const requestAssignRoleUsers = (data: IAssignRoleUsersReq): Promise<AxiosResponse<DefaultResponse<IRoleOut>>> => {
  const config: AxiosRequestConfig = {
    method: 'PUT',
    url: `${url}/assign`,
    data,
  };

  return apiAuth(config);
};

export const requestDeleteRole = (data: IDeleteRolesReq): Promise<AxiosResponse<DefaultResponse<null>>> => {
  const config: AxiosRequestConfig = {
    method: 'DELETE',
    url,
    data,
  };

  return apiAuth(config);
};
