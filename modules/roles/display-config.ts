import { toOptions, type DisplayConfig } from '@/types/display-config';

export const roleSystemConfig = {
  true: {
    label: 'Hệ thống',
    className: 'border-transparent bg-blue-500/10 text-blue-600',
  },
  false: {
    label: 'Tùy chỉnh',
    className: 'border-transparent bg-zinc-500/10 text-zinc-600',
  },
} satisfies Record<'true' | 'false', DisplayConfig>;

export const roleSystemOptions = toOptions(roleSystemConfig);
