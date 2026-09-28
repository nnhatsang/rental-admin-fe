import type { Icon } from '@tabler/icons-react';

export type SelectOption<T extends string> = {
  value: T;
  label: string;
  icon?: Icon;
  filterClassName?: string;
};

export type DisplayConfig = {
  label: string;
  icon?: Icon;
  className?: string;
  /** Optional text color used by faceted filters and compact filter chips. */
  filterClassName?: string;
};

export const toOptions = <
  T extends string,
  C extends { label: string; icon?: Icon; filterClassName?: string },
>(config: Record<T, C>): SelectOption<T>[] => {
  return (Object.entries(config) as [T, C][]).map(([value, item]) => ({
    value,
    label: item.label,
    icon: item.icon,
    filterClassName: item.filterClassName,
  }));
};
