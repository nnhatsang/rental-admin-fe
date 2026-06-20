import { NavGroup } from '@/components/layout/types';
import { PermissionCode as Permission } from '@/utils/consts/rbac.const';

import {
  IconCamera,
  IconClipboardList,
  IconCreditCard,
  IconDashboard,
  IconDevices,
  IconKey,
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
        title: 'Quyền',
        url: '/permissions',
        icon: IconKey,
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
