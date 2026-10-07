import { toOptions, type DisplayConfig } from '@/types/display-config';

export const mailTemplateActiveConfig = {
  true: {
    label: 'Đang bật',
    className: 'border-transparent bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
  },
  false: {
    label: 'Đã tắt',
    className: 'border-transparent bg-muted text-muted-foreground',
  },
} satisfies Record<'true' | 'false', DisplayConfig>;

export const mailTemplateActiveOptions = toOptions(mailTemplateActiveConfig);
