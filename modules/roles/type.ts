/* eslint-disable @typescript-eslint/no-empty-object-type */
import { DefaultParamsRequest } from '@/types/api';

export interface IPermission {
  id: string;
  code: string;
  name: string;
  description: string | null;
  module: string;
  action: string;
}
export interface User {
  id: string;
  email: string;
  fullName: string;
}

export interface IRole {
  id: string;
  code: string;
  name: string;
  description: string | null;
  isSystem: boolean;
  permissions: IPermission[];
  usersCount: number;
  users?: User[];
  createdAt: string;
  updatedAt: string;
}

export interface IGetRolesParams extends DefaultParamsRequest {
  isSystem?: boolean;
}

export interface IRoleRequestCreate {
  code: string;
  name: string;
  description?: string;
  permissionCodes: string[];
}
export interface IRoleRequestUpdate extends Partial<IRoleRequestCreate> {
  //
}
export interface IRoleRequestAssign {
  roleId: string;
  userIds: string[];
}
