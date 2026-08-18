import {
  IconKeyOff,
  IconLock,
  IconLockOpen,
  type Icon,
} from '@tabler/icons-react';
import type { DisplayConfig } from '@/types/display-config';
import type { UserActivityStatus } from './type';

type UserStatusDisplayConfig = DisplayConfig & {
  icon: Icon;
  filterClassName: string;
};

export const userActivityStatusConfig = {
  ACTIVE: {
    label: 'Hoạt động',
    className:
      'bg-teal-100/30 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 hover:bg-emerald-500/15 border-transparent',
    filterClassName: 'text-emerald-600 dark:text-emerald-400',
    icon: IconLockOpen,
  },
  BANNED: {
    label: 'Bị cấm',
    className: 'bg-red-500/10 text-red-600 dark:bg-red-500/20 dark:text-red-400 hover:bg-red-500/15 border-transparent',
    filterClassName: 'text-red-600 dark:text-red-400',
    icon: IconLock,
  },
  LOCKED: {
    label: 'Bị khóa',
    className:
      'bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400 hover:bg-amber-500/15 border-transparent',
    filterClassName: 'text-amber-600 dark:text-amber-400',
    icon: IconLock,
  },
  INACTIVE: {
    label: 'Chưa kích hoạt',
    className:
      'bg-zinc-500/10 text-zinc-600 dark:bg-zinc-500/20 dark:text-zinc-400 hover:bg-zinc-500/15 border-transparent',
    filterClassName: 'text-zinc-600 dark:text-zinc-400',
    icon: IconKeyOff,
  },
} satisfies Record<UserActivityStatus, UserStatusDisplayConfig>;

export const userActivityStatusOptions = (Object.entries(userActivityStatusConfig) as [
  UserActivityStatus,
  UserStatusDisplayConfig,
][]).map(([value, item]) => ({
  value,
  label: item.label,
  icon: item.icon,
  filterClassName: item.filterClassName,
}));
