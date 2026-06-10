import type { DefaultParamsRequest } from './api';

export interface IPermissionInRoleOut {
  id: string;
  code: string;
  name: string;
  description: string | null;
  module: string;
  action: string;
}

export interface IUserInRoleOut {
  id: string;
  email: string;
  fullName: string;
}

export interface IRoleOut {
  id: string;
  code: string;
  name: string;
  description: string | null;
  isSystem: boolean;
  permissions: IPermissionInRoleOut[];
  usersCount: number;
  users?: IUserInRoleOut[];
  createdAt: string;
  updatedAt: string;
}

export interface IGetRolesParams extends DefaultParamsRequest {
  isSystem?: boolean;
}

export interface ICreateRoleReq {
  code: string;
  name: string;
  description?: string;
  permissionCodes: string[];
}

export interface IUpdateRoleReq {
  name?: string;
  description?: string;
}

export interface IUpdateRolePermissionsReq {
  permissionCodes: string[];
}

export interface IAssignRoleUsersReq {
  roleId: string;
  userIds: string[];
}

export interface IRoleActionRes {
  success: true;
}
