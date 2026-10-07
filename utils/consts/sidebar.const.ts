import { NavGroup } from '@/components/layout/types';
import { PermissionCode as Permission, PermissionCode } from '@/utils/consts/rbac.const';

import {
  IconAddressBook,
  IconCalendarTime,
  IconClipboardList,
  IconDashboard,
  IconDevices,
  IconMail,
  IconPackages,
  IconReportAnalytics,
  IconSettings,
  IconShieldLock,
  IconListTree,
  IconTrademark,
  IconUserShield,
} from '@tabler/icons-react';

export const sidebarItems: NavGroup[] = [
  {
    id: 1,
    label: 'Tổng quan',
    items: [
      {
        title: 'Dashboard',
        url: '/dashboard',
        icon: IconDashboard,
        requiredPermissions: [Permission.OrdersRead],
      },
    ],
  },

  {
    id: 2,
    label: 'Phân tích',
    items: [
      {
        title: 'Báo cáo',
        url: '/reports',
        icon: IconReportAnalytics,
        requiredPermissions: [Permission.ReportsRead],
        comingSoon: true,
      },
    ],
  },

  {
    id: 3,
    label: 'Vận hành thuê',
    items: [
      {
        title: 'Đơn thuê',
        url: '/rental-orders',
        icon: IconClipboardList,
        requiredPermissions: [Permission.OrdersRead],
      },
      {
        title: 'Lịch & đặt thuê',
        url: '/availability',
        icon: IconCalendarTime,
        requiredPermissions: [Permission.OrdersRead],
      },

      {
        title: 'Khách hàng',
        url: '/customers',
        icon: IconAddressBook,
        requiredPermissions: [Permission.CustomersRead],
      },
    ],
  },
  {
    id: 4,
    label: 'Danh mục & kho',
    items: [
      {
        title: 'Danh mục',
        url: '/categories',
        icon: IconListTree,
        requiredPermissions: [Permission.CategoriesRead],
      },
      {
        title: 'Thương hiệu',
        url: '/brands',
        icon: IconTrademark,
        requiredPermissions: [Permission.BrandsRead],
      },
      {
        title: 'Sản phẩm',
        url: '/products',
        icon: IconPackages,
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
    id: 5,
    label: 'Quản trị hệ thống',
    items: [
      {
        title: 'Người dùng',
        url: '/users',
        icon: IconUserShield,
        requiredPermissions: [Permission.UsersRead],
      },
      {
        title: 'Vai trò & quyền',
        url: '/roles',
        icon: IconShieldLock,
        requiredPermissions: [Permission.RolesRead],
      },
      {
        title: 'Mẫu email',
        url: '/mail-templates',
        icon: IconMail,
        requiredPermissions: [Permission.EmailTemplatesRead],
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
  const allItems = sidebarItems.flatMap((group) => group.items.flatMap((item) => [item, ...(item.subItems ?? [])]));

  return allItems.filter((item) => isPathnameMatch(pathname, item.url)).sort((a, b) => b.url.length - a.url.length)[0];
};

export const canAccessSidebarRoute = (pathname: string, userPermissions: string[]) => {
  const sidebarItem = findSidebarItemByPathname(pathname);

  if (!sidebarItem) return true;

  return canAccessPermissions(sidebarItem.requiredPermissions, userPermissions);
};
