import { apiAuth } from '@/axios';
import type { DefaultResponse, DefaultResponseWithPagination } from '@/types/api';
import type {
  ICreateUserReq,
  IGetUsersParams,
  IResetUserPasswordReq,
  IUpdateUserActivityStatusReq,
  IUpdateUserReq,
  IUpdateUserRolesReq,
  IUserActionRes,
  IUserOut,
} from '@/types/users';
import type { AxiosRequestConfig, AxiosResponse } from 'axios';

const url = '/users';

export const requestGetUsers = (params: IGetUsersParams): Promise<AxiosResponse<DefaultResponseWithPagination<IUserOut>>> => {
  const config: AxiosRequestConfig = {
    method: 'GET',
    url,
    params,
  };

  return apiAuth(config);
};

export const requestGetUserById = (id: string): Promise<AxiosResponse<DefaultResponse<IUserOut>>> => {
  const config: AxiosRequestConfig = {
    method: 'GET',
    url: `${url}/${id}`,
  };

  return apiAuth(config);
};

export const requestCreateUser = (data: ICreateUserReq): Promise<AxiosResponse<DefaultResponse<IUserOut>>> => {
  const config: AxiosRequestConfig = {
    method: 'POST',
    url,
    data,
  };

  return apiAuth(config);
};

export const requestUpdateUser = (id: string, data: IUpdateUserReq): Promise<AxiosResponse<DefaultResponse<IUserOut>>> => {
  const config: AxiosRequestConfig = {
    method: 'PATCH',
    url: `${url}/${id}`,
    data,
  };

  return apiAuth(config);
};

export const requestUpdateUserActivityStatus = (
  id: string,
  data: IUpdateUserActivityStatusReq,
): Promise<AxiosResponse<DefaultResponse<IUserOut>>> => {
  const config: AxiosRequestConfig = {
    method: 'PATCH',
    url: `${url}/${id}/activity-status`,
    data,
  };

  return apiAuth(config);
};

export const requestUpdateUserRoles = (id: string, data: IUpdateUserRolesReq): Promise<AxiosResponse<DefaultResponse<IUserOut>>> => {
  const config: AxiosRequestConfig = {
    method: 'PATCH',
    url: `${url}/${id}/roles`,
    data,
  };

  return apiAuth(config);
};

export const requestResetUserPassword = (
  id: string,
  data: IResetUserPasswordReq,
): Promise<AxiosResponse<DefaultResponse<IUserActionRes>>> => {
  const config: AxiosRequestConfig = {
    method: 'PATCH',
    url: `${url}/${id}/password`,
    data,
  };

  return apiAuth(config);
};

export const requestDeleteUser = (id: string): Promise<AxiosResponse<DefaultResponse<IUserActionRes | null>>> => {
  const config: AxiosRequestConfig = {
    method: 'DELETE',
    url: `${url}/${id}`,
  };

  return apiAuth(config);
};
