import { apiAuth, apiClient } from '@/axios';
import { DefaultResponse } from '@/types/api';
import {
    IAuthRes,
    IChangePasswordReq,
    IForgotPasswordReq,
    ILoginReq,
    IResetPasswordReq,
    IUpdateProfileReq,
    IUser,
} from '@/types/aurh';
import { AxiosRequestConfig, AxiosResponse } from 'axios';

const url = '/admin/auth';
const requestLogin = (data: ILoginReq): Promise<AxiosResponse<DefaultResponse<IAuthRes>>> => {
  const config: AxiosRequestConfig = {
    method: 'POST',
    url: `${url}/login`,
    data,
  };
  return apiClient(config);
};

const requestLogout = (): Promise<AxiosResponse<DefaultResponse<{ success: true }>>> => {
  const config: AxiosRequestConfig = {
    method: 'POST',
    url: `${url}/logout`,
  };
  return apiAuth(config);
};

const requestForgotPassword = (data: IForgotPasswordReq): Promise<AxiosResponse<DefaultResponse<{ success: true }>>> => {
  const config: AxiosRequestConfig = {
    method: 'POST',
    url: `${url}/forgot-password`,
    data,
  };
  return apiClient(config);
};

const requestResetPassword = (data: IResetPasswordReq): Promise<AxiosResponse<DefaultResponse<{ success: true }>>> => {
  const config: AxiosRequestConfig = {
    method: 'POST',
    url: `${url}/reset-password`,
    data,
  };
  return apiClient(config);
};

const requestRefreshToken = (): Promise<AxiosResponse<DefaultResponse<IAuthRes>>> => {
  const config: AxiosRequestConfig = {
    method: 'POST',
    url: `${url}/refresh`,
  };
  return apiAuth(config);
};

const requestGetProfile = (): Promise<AxiosResponse<DefaultResponse<IUser>>> => {
  const config: AxiosRequestConfig = {
    method: 'GET',
    url: `${url}/me`,
  };
  return apiAuth(config);
};

const requestUpdateProfile = (data: Partial<IUpdateProfileReq>): Promise<AxiosResponse<DefaultResponse<IUser>>> => {
  const config: AxiosRequestConfig = {
    method: 'PATCH',
    url: `${url}/me`,
    data,
  };
  return apiAuth(config);
};

const requestChangePassword = (data: IChangePasswordReq): Promise<AxiosResponse<DefaultResponse<{ success: true }>>> => {
  const config: AxiosRequestConfig = {
    method: 'PATCH',
    url: `${url}/me/password`,
    data,
  };
  return apiAuth(config);
};

export {
    requestChangePassword,
    requestForgotPassword,
    requestGetProfile,
    requestLogin,
    requestLogout,
    requestRefreshToken,
    requestResetPassword,
    requestUpdateProfile
};
