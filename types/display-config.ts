import type { Icon } from '@tabler/icons-react';

export type SelectOption<T extends string> = {
  value: T;
  label: string;
};

export type DisplayConfig = {
  label: string;
  icon?: Icon;
  className?: string;
};

export const toOptions = <T extends string, C extends { label: string }>(config: Record<T, C>): SelectOption<T>[] => {
  return (Object.entries(config) as [T, C][]).map(([value, item]) => ({
    value,
    label: item.label,
  }));
};
