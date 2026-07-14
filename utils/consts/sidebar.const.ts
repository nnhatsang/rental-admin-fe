import { NavGroup } from '@/components/layout/types';
import { PermissionCode, PermissionCode as Permission } from '@/utils/consts/rbac.const';

import {
  IconCamera,
  IconClipboardList,
  IconCreditCard,
  IconDashboard,
  IconDevices,
  IconReportAnalytics,
  IconSettings,
  IconShieldLock,
  IconTruckReturn,
  IconUsers,
} from '@tabler/icons-react';

export const sidebarItems: NavGroup[] = [
  {
    id: 1,
    label: 'Tổng quan',
    items: [
      {
        title: 'Dashboard',
        url: '/',
        icon: IconDashboard,
      },
      {
        title: 'Báo cáo',
        url: '/reports',
        icon: IconReportAnalytics,
        requiredPermissions: [Permission.ReportsRead],
      },
    ],
  },
  {
    id: 2,
    label: 'Vận hành thuê',
    items: [
      {
        title: 'Đơn thuê',
        url: '/rental-orders',
        icon: IconClipboardList,
        requiredPermissions: [Permission.OrdersRead],
      },
      {
        title: 'Thanh toán',
        url: '/payments',
        icon: IconCreditCard,
        requiredPermissions: [Permission.OrdersRecordPayment, Permission.OrdersRefund],
      },
      {
        title: 'Trả thiết bị',
        url: '/returns',
        icon: IconTruckReturn,
        requiredPermissions: [Permission.OrdersUpdateStatus],
      },
      {
        title: 'Khách hàng',
        url: '/customers',
        icon: IconUsers,
        requiredPermissions: [Permission.CustomersRead],
      },
    ],
  },
  {
    id: 3,
    label: 'Kho thiết bị',
    items: [
      {
        title: 'Sản phẩm',
        url: '/products',
        icon: IconCamera,
        requiredPermissions: [Permission.ProductsRead],
      },
      {
        title: 'Thiết bị vật lý',
        url: '/asset-units',
        icon: IconDevices,
        requiredPermissions: [Permission.AssetsRead],
      },
    ],
  },
  {
    id: 4,
    label: 'Quản trị',
    items: [
      {
        title: 'Người dùng',
        url: '/users',
        icon: IconUsers,
        requiredPermissions: [Permission.UsersRead],
      },
      {
        title: 'Vai trò',
        url: '/roles',
        icon: IconShieldLock,
        requiredPermissions: [Permission.RolesRead],
      },

      {
        title: 'Cài đặt',
        url: '/settings',
        icon: IconSettings,
        requiredPermissions: [Permission.SettingsRead],
      },
    ],
  },
];

export const canAccessPermissions = (requiredPermissions: PermissionCode[] | undefined, userPermissions: string[]) => {
  if (!requiredPermissions?.length) return true;

  return requiredPermissions.some((permission) => userPermissions.includes(permission));
};

const isPathnameMatch = (pathname: string, url: string) => pathname === url || pathname.startsWith(`${url}/`);

export const findSidebarItemByPathname = (pathname: string) => {
  const allItems = sidebarItems.flatMap((group) =>
    group.items.flatMap((item) => [item, ...(item.subItems ?? [])]),
  );

  return allItems
    .filter((item) => isPathnameMatch(pathname, item.url))
    .sort((a, b) => b.url.length - a.url.length)[0];
};

export const canAccessSidebarRoute = (pathname: string, userPermissions: string[]) => {
  const sidebarItem = findSidebarItemByPathname(pathname);

  if (!sidebarItem) return true;

  return canAccessPermissions(sidebarItem.requiredPermissions, userPermissions);
};
