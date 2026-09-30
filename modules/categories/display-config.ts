import { toOptions, type DisplayConfig } from '@/types/display-config';

export const categoryActiveConfig = {
  true: {
    label: 'Đang dùng',
    className: 'border-transparent bg-emerald-500/10 text-emerald-700',
  },
  false: {
    label: 'Tạm tắt',
    className: 'border-transparent bg-muted text-muted-foreground',
  },
} satisfies Record<'true' | 'false', DisplayConfig>;

export const categoryActiveOptions = toOptions(categoryActiveConfig);
