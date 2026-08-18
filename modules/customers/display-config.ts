import { toOptions, type DisplayConfig } from '@/types/display-config';
import { IconBan, IconCircleCheck, IconMoon } from '@tabler/icons-react';
import { CustomerStatus } from './type';

export const customerStatusConfig = {
  [CustomerStatus.Active]: {
    label: 'Hoạt động',
    icon: IconCircleCheck,
    className: 'border-transparent bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/15 dark:text-emerald-400',
  },
  [CustomerStatus.Inactive]: {
    label: 'Ngưng hoạt động',
    icon: IconMoon,
    className: 'border-transparent bg-zinc-500/10 text-zinc-600 hover:bg-zinc-500/15 dark:text-zinc-400',
  },
  [CustomerStatus.Blocked]: {
    label: 'Blacklist',
    icon: IconBan,
    className: 'border-transparent bg-red-500/10 text-red-600 hover:bg-red-500/15 dark:text-red-400',
  },
} satisfies Record<CustomerStatus, DisplayConfig>;

export const customerStatusOptions = toOptions(customerStatusConfig);
