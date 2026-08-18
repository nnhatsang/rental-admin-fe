import { toOptions, type DisplayConfig } from '@/types/display-config';
import type { AvailabilityFilter } from './type';

export type ProductAvailabilityState = 'AVAILABLE' | 'LOW_STOCK' | 'UNAVAILABLE';

export const productAvailabilityConfig = {
  AVAILABLE: {
    label: 'Còn hàng',
    className: 'border-transparent bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/15',
  },
  LOW_STOCK: {
    label: 'Sắp hết',
    className: 'border-transparent bg-amber-500/10 text-amber-600 hover:bg-amber-500/15',
  },
  UNAVAILABLE: {
    label: 'Hết hàng',
    className: 'border-transparent bg-destructive/10 text-destructive hover:bg-destructive/15',
  },
} satisfies Record<ProductAvailabilityState, DisplayConfig>;

export const availabilityFilterConfig = {
  ALL: {
    label: 'Tất cả',
  },
  AVAILABLE: {
    label: productAvailabilityConfig.AVAILABLE.label,
  },
  UNAVAILABLE: {
    label: productAvailabilityConfig.UNAVAILABLE.label,
  },
} satisfies Record<AvailabilityFilter, DisplayConfig>;

export const availabilityFilterOptions = toOptions(availabilityFilterConfig);
