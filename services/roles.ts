import { apiAuth } from '@/axios';
import type { DefaultResponse, DefaultResponseWithPagination } from '@/types/api';
import type {
  IAssignRoleUsersReq,
  ICreateRoleReq,
  IGetRolesParams,
  IRoleActionRes,
  IRoleOut,
  IUpdateRolePermissionsReq,
  IUpdateRoleReq,
} from '@/types/roles';
import type { AxiosRequestConfig, AxiosResponse } from 'axios';

const url = '/roles';

export const requestGetRoles = (params: IGetRolesParams): Promise<AxiosResponse<DefaultResponseWithPagination<IRoleOut>>> => {
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

export const requestUpdateRole = (id: string, data: IUpdateRoleReq): Promise<AxiosResponse<DefaultResponse<IRoleOut>>> => {
  const config: AxiosRequestConfig = {
    method: 'PATCH',
    url: `${url}/${id}`,
    data,
  };

  return apiAuth(config);
};

export const requestUpdateRolePermissions = (
  id: string,
  data: IUpdateRolePermissionsReq,
): Promise<AxiosResponse<DefaultResponse<IRoleOut>>> => {
  const config: AxiosRequestConfig = {
    method: 'PUT',
    url: `${url}/${id}/permissions`,
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

export const requestDeleteRole = (id: string): Promise<AxiosResponse<DefaultResponse<IRoleActionRes>>> => {
  const config: AxiosRequestConfig = {
    method: 'DELETE',
    url: `${url}/${id}`,
  };

  return apiAuth(config);
};
