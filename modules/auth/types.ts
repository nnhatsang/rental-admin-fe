export interface ILoginReq {
  email: string;
  password: string;
}

export interface IAuthRes {
  user: IUser;
}
export interface IUser {
  id: string;
  email: string;
  fullName: string;
  phone: string | null;
  avatar: string | null;
  sessionId: string;
  roles: string[];
  permissions: string[];
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
