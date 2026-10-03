'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from '@/components/ui/empty';
import { IconArrowUpRight, IconCalendarEvent } from '@tabler/icons-react';
import { dashboardScheduleConfig } from '../../display-config';
import { formatDashboardDateTime } from '../../display-utils';
import type { DashboardScheduleItem } from '../../model';

export function DashboardSchedulePreview({ items }: { items: DashboardScheduleItem[] }) {
  const router = useRouter();

  return (
    <Card className="min-w-0 border-accent/60 shadow-none">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <IconCalendarEvent className="size-4 text-chart-2" aria-hidden="true" />
          Lịch sắp tới
        </CardTitle>
        <CardDescription>Các mốc nhận và trả máy trong khoảng thời gian đang xem.</CardDescription>
      </CardHeader>
      <CardContent>
        {items.length ? (
          <div className="divide-y divide-accent/60">
            {items.map((item) => {
              const config = dashboardScheduleConfig[item.type];
              const Icon = config.icon;
              return (
                <div key={`${item.orderId}-${item.type}-${item.scheduledAt}`} className="flex min-w-0 items-center gap-3 py-3 first:pt-0 last:pb-0">
                  <span className={`shrink-0 ${config.className}`}>
                    <Icon className="size-4" aria-hidden="true" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
                      <span className="text-sm font-medium">{config.label}</span>
                      <span className="font-mono text-xs text-primary">#{item.orderCode}</span>
                    </div>
                    <p className="truncate text-xs text-muted-foreground">{item.customerName} · {item.productSummary}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <time className="hidden text-right text-xs text-muted-foreground sm:block">{formatDashboardDateTime(item.scheduledAt)}</time>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label={`Mở đơn ${item.orderCode}`}
                      onClick={() => router.push(`/rental-orders?detailOrderId=${encodeURIComponent(item.orderId)}&detailOrderCode=${encodeURIComponent(item.orderCode)}`)}
                    >
                      <IconArrowUpRight aria-hidden="true" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <Empty className="border-0 p-4">
            <EmptyHeader>
              <EmptyTitle>Chưa có lịch sắp tới</EmptyTitle>
              <EmptyDescription>Không có mốc nhận hoặc trả máy trong khoảng thời gian này.</EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
      </CardContent>
    </Card>
  );
}
