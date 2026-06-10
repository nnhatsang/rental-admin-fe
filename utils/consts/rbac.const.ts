export const PermissionCode = {
  OrdersRead: 'orders.read',
  OrdersCreate: 'orders.create',
  OrdersUpdate: 'orders.update',
  OrdersUpdateStatus: 'orders.update_status',
  OrdersCancel: 'orders.cancel',
  OrdersRecordPayment: 'orders.record_payment',
  OrdersRefund: 'orders.refund',

  CustomersRead: 'customers.read',
  CustomersCreate: 'customers.create',
  CustomersUpdate: 'customers.update',
  CustomersDelete: 'customers.delete',

  ProductsRead: 'products.read',
  ProductsCreate: 'products.create',
  ProductsUpdate: 'products.update',
  ProductsDelete: 'products.delete',

  AssetsRead: 'assets.read',
  AssetsCreate: 'assets.create',
  AssetsUpdate: 'assets.update',
  AssetsDelete: 'assets.delete',

  UsersRead: 'users.read',
  UsersCreate: 'users.create',
  UsersUpdate: 'users.update',
  UsersDelete: 'users.delete',

  RolesRead: 'roles.read',
  RolesCreate: 'roles.create',
  RolesUpdate: 'roles.update',
  RolesDelete: 'roles.delete',
  RolesAssign: 'roles.assign',

  SettingsRead: 'settings.read',
  SettingsUpdate: 'settings.update',

  ReportsRead: 'reports.read',
} as const;

export type PermissionCode = (typeof PermissionCode)[keyof typeof PermissionCode];

export const RoleCode = {
  Admin: 'ADMIN',
  Manager: 'MANAGER',
  Staff: 'STAFF',
  Viewer: 'VIEWER',
} as const;

export type RoleCode = (typeof RoleCode)[keyof typeof RoleCode];

export const PERMISSION_CODES = Object.values(PermissionCode);
export const ROLE_CODES = Object.values(RoleCode);
