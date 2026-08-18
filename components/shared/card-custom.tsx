import type { ReactNode } from 'react';
import { Card, CardAction, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

type DetailCardProps = {
  title: ReactNode;
  icon?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
};
function asText(value: ReactNode) {
  return value === null || value === undefined || value === '' ? '-' : value;
}
export function DetailCard({ title, icon, action, children, className }: DetailCardProps) {
  return (
    <Card className={cn('gap-0 p-0', className)}>
      <CardHeader className="pb-0! px-4 py-2! border-b bg-muted/50">
        <div className={cn("flex items-center flex-wrap justify-between gap-3 w-full")}>
          <CardTitle className="flex min-w-0 items-center gap-2 text-sm">
            {icon && (
              <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                {icon}
              </span>
            )}

            <span className="truncate">{title}</span>
          </CardTitle>

          {action && <CardAction className="shrink-0">{action}</CardAction>}
        </div>
      </CardHeader>

      <CardContent className="p-4 bg-background">{children}</CardContent>
    </Card>
  );
}

type InfoProps = {
  label: string;
  value?: ReactNode;
  className?: string;
  valueClassName?: string;
  tone?: 'default' | 'error' | 'success' | 'warning' | 'info';
  line?: boolean;
};
export function Info({ label, value, className, valueClassName, tone, line = false }: InfoProps) {
  return (
    <div className={cn('min-w-0', className, line && 'flex items-center justify-between')}>
      <dt className="text-xs text-muted-foreground"> {label} </dt>{' '}
      <dd
        className={cn('mt-1 wrap-break-word text-sm font-medium', valueClassName, {
          'text-destructive': tone === 'error',
          'text-green-500': tone === 'success',
          'text-yellow-500': tone === 'warning',
          'text-blue-500': tone === 'info',
        })}
      >
        {asText(value)}{' '}
      </dd>
    </div>
  );
}
