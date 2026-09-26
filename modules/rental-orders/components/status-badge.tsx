'use client';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { DisplayConfig } from '@/types/display-config';
import type { ReactNode } from 'react';

export function RentalOrderBadge({
  config,
  label,
  className,
}: {
  config: DisplayConfig;
  label?: ReactNode;
  className?: string;
}) {
  const Icon = config.icon;

  return (
    <Badge variant="outline" className={cn(config.className, className)}>
      {Icon ? <Icon aria-hidden="true" data-icon="inline-start" /> : null}
      {label ?? config.label}
    </Badge>
  );
}
