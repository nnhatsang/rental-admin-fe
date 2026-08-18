import { toOptions, type DisplayConfig } from '@/types/display-config';
import { TITLE_PAGE } from '@/utils/consts/title-page.const';

const productText = TITLE_PAGE.PRODUCTS;

export const productActiveConfig = {
  true: {
    label: productText.TABLE.ACTIVE,
    className: 'border-transparent bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/15',
  },
  false: {
    label: productText.TABLE.INACTIVE,
    className: 'border-transparent bg-muted text-muted-foreground hover:bg-muted/80',
  },
} satisfies Record<'true' | 'false', DisplayConfig>;
export const productActiveOptions = toOptions(productActiveConfig);
