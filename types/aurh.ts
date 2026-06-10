import { IUser } from './user';

export interface ILoginReq {
  email: string;
  password: string;
}

export interface IAuthRes {
  user: IUser;
}

export interface IUpdateProfileReq {
  fullName?: string;
  phone?: string;
}

export interface IForgotPasswordReq {
  email: string;
}

export interface IResetPasswordReq {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

export interface IChangePasswordReq {
  oldPassword: string;
  newPassword: string;
}
