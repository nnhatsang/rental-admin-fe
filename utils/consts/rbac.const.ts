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

  CategoriesRead: 'categories.read',
  CategoriesCreate: 'categories.create',
  CategoriesUpdate: 'categories.update',
  CategoriesDelete: 'categories.delete',

  BrandsRead: 'brands.read',
  BrandsCreate: 'brands.create',
  BrandsUpdate: 'brands.update',
  BrandsDelete: 'brands.delete',

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

  EmailTemplatesRead: 'email_templates.read',
  EmailTemplatesUpdate: 'email_templates.update',
  EmailTemplatesPreview: 'email_templates.preview',
  EmailTemplatesSendTest: 'email_templates.send_test',

  ReportsRead: 'reports.read',
} as const;

export type PermissionCode = (typeof PermissionCode)[keyof typeof PermissionCode];

