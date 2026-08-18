'use client';
import { DisplayConfig } from '@/types/display-config';
import { Badge } from '../ui/badge';

type StatusBadgeProps<T extends string, C extends Record<T, DisplayConfig>> = {
  status: T;
  config: C;
};

export function BadgeCustom<T extends string>({ status, config }: StatusBadgeProps<T, Record<T, DisplayConfig>>) {
  const item = config[status];
  const Icon = item.icon;

  return (
    <Badge variant="outline" className={item.className}>
      {Icon && <Icon className="mr-1 size-3.5" />}
      {item.label}
    </Badge>
  );
}
