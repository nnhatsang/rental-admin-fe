import * as React from 'react';
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export interface PageCardLayoutProps {
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
}

export function PageCardLayout({
  title,
  description,
  actions,
  children,
  className,
  headerClassName,
  contentClassName,
}: PageCardLayoutProps) {
  return (
    <Card className={cn('w-full', className)}>
      <CardHeader
        className={cn(
          'border-b has-data-[slot=card-action]:grid-cols-1 md:has-data-[slot=card-action]:grid-cols-[1fr_auto]',
          headerClassName,
        )}
      >
        <div className="grid auto-rows-min gap-1.5">
          {typeof title === 'string' ? <CardTitle className="text-xl leading-none">{title}</CardTitle> : title}
          {description &&
            (typeof description === 'string' ? (
              <CardDescription className="max-w-sm leading-snug">{description}</CardDescription>
            ) : (
              description
            ))}
        </div>
        {actions && (
          <CardAction className="col-start-1 row-start-auto flex w-full flex-wrap justify-start gap-2 justify-self-stretch md:col-start-2 md:row-span-2 md:row-start-1 md:w-auto md:flex-nowrap md:justify-end md:justify-self-end">
            {actions}
          </CardAction>
        )}
      </CardHeader>
      <CardContent className={cn('flex flex-col gap-4 px-0', contentClassName)}>{children}</CardContent>
    </Card>
  );
}
