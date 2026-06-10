export interface IPermissionOut {
  id: string;
  code: string;
  name: string;
  description: string | null;
  module: string;
  action: string;
  createdAt: string;
  updatedAt: string;
}

export interface IGetPermissionsParams {
  module?: string;
  search?: string;
}
