import { DefaultParamsRequest } from '@/types/api';
import type { RoleCode } from '@/utils/consts/rbac.const';

export const UserActivityStatus = {
  Active: 'ACTIVE',
  Banned: 'BANNED',
  Locked: 'LOCKED',
  Inactive: 'INACTIVE',
} as const;

export type UserActivityStatus = (typeof UserActivityStatus)[keyof typeof UserActivityStatus];


export interface IUserRoleOut {
  id: string;
  code: string;
  name: string;
}

export interface IUserOut {
  id: string;
  email: string;
  fullName: string;
  phone: string | null;
  activityStatus: UserActivityStatus;
  roles: IUserRoleOut[];
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface IGetUsersParams extends DefaultParamsRequest {
  status?: UserActivityStatus;
  roleCode?: string;
}

export interface ICreateUserReq {
  email: string;
  fullName: string;
  phone?: string;
  password: string;
  roleCodes?: string[];
}

export interface IUpdateUserReq {
  email?: string;
  fullName?: string;
  phone?: string;
}

export interface IUpdateUserActivityStatusReq {
  activityStatus: UserActivityStatus;
}

export interface IUpdateUserRolesReq {
  roleCodes: RoleCode[] | string[];
}

export interface IResetUserPasswordReq {
  newPassword: string;
  confirmPassword: string;
}

export interface IUserActionRes {
  success: true;
}
