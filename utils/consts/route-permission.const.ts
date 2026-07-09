import { PermissionCode } from './rbac.const';

export type RoutePermissionRule = {
  path: string;
  requiredPermissions: PermissionCode[];
};

export const ADMIN_ROUTE_PERMISSION_RULES: RoutePermissionRule[] = [
  { path: '/rental-orders', requiredPermissions: [PermissionCode.OrdersRead] },
  { path: '/payments', requiredPermissions: [PermissionCode.OrdersRecordPayment, PermissionCode.OrdersRefund] },
  { path: '/returns', requiredPermissions: [PermissionCode.OrdersUpdateStatus] },
  { path: '/customers', requiredPermissions: [PermissionCode.CustomersRead] },
  { path: '/products', requiredPermissions: [PermissionCode.ProductsRead] },
  { path: '/asset-units', requiredPermissions: [PermissionCode.AssetsRead] },
  { path: '/users', requiredPermissions: [PermissionCode.UsersRead] },
  { path: '/permissions', requiredPermissions: [PermissionCode.RolesRead] },
  { path: '/reports', requiredPermissions: [PermissionCode.ReportsRead] },
  { path: '/settings', requiredPermissions: [PermissionCode.SettingsRead] },
];

export const getRoutePermissionRule = (pathname: string) => {
  return ADMIN_ROUTE_PERMISSION_RULES.find((rule) => pathname === rule.path || pathname.startsWith(`${rule.path}/`));
};

export const canAccessRoute = (pathname: string, permissions: string[]) => {
  const rule = getRoutePermissionRule(pathname);

  if (!rule) return true;

  return rule.requiredPermissions.some((permission) => permissions.includes(permission));
};
