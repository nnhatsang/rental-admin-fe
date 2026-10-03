'use client';

import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from '@/components/ui/empty';
import { cn } from '@/lib/utils';
import { orderStatusConfig } from '@/modules/rental-orders/display-config';
import { RentalOrderBadge } from '@/modules/rental-orders/components/status-badge';
import type { RentalOrderStatus } from '@/modules/rental-orders/model';
import { IconArrowUpRight, IconClipboardList } from '@tabler/icons-react';
import { dashboardAttentionConfig, dashboardPriorityConfig } from '../../display-config';
import { formatDashboardCurrency, getDashboardAttentionTime } from '../../display-utils';
import type { DashboardAttentionItem } from '../../model';

function AttentionItem({ item, onOpen }: { item: DashboardAttentionItem; onOpen: (item: DashboardAttentionItem) => void }) {
  const attention = dashboardAttentionConfig[item.type];
  const AttentionIcon = attention.icon;
  const priority = dashboardPriorityConfig[item.priority];
  const orderConfig = orderStatusConfig[item.orderStatus as RentalOrderStatus];

  return (
    <div className="grid gap-3 px-1 py-3 first:pt-0 last:pb-0 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
      <div className="grid min-w-0 gap-2">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <Badge variant="outline" className={cn(attention.className)}>
            <AttentionIcon aria-hidden="true" data-icon="inline-start" />
            {attention.label}
          </Badge>
          <Badge variant="outline" className={cn(priority.className)}>
            {priority.label}
          </Badge>
          {orderConfig ? <RentalOrderBadge config={orderConfig} /> : null}
          <span className="font-mono text-xs font-semibold text-primary">#{item.orderCode}</span>
        </div>
        <div className="grid min-w-0 gap-1">
          <p className="truncate text-sm font-medium">{item.customerName} · {item.productSummary}</p>
          <p className="text-xs leading-relaxed text-muted-foreground">{item.message}</p>
          <p className="text-xs text-muted-foreground">{getDashboardAttentionTime(item)}</p>
        </div>
      </div>
      <div className="flex items-center justify-between gap-3 sm:justify-end">
        <span className="text-sm font-semibold tabular-nums text-foreground">
          {item.amount == null ? '—' : formatDashboardCurrency(item.amount)}
        </span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onOpen(item)}
        >
          Mở đơn
          <IconArrowUpRight aria-hidden="true" data-icon="inline-end" />
        </Button>
      </div>
    </div>
  );
}

export function DashboardAttentionList({ items, isLoading, isError }: { items: DashboardAttentionItem[]; isLoading: boolean; isError: boolean }) {
  const router = useRouter();
  const openOrder = (item: DashboardAttentionItem) => {
    router.push(`/rental-orders?detailOrderId=${encodeURIComponent(item.orderId)}&detailOrderCode=${encodeURIComponent(item.orderCode)}`);
  };

  return (
    <Card className="min-w-0 border-accent/60 shadow-none">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <IconClipboardList className="size-4 text-chart-5" aria-hidden="true" />
          Việc cần xử lý
        </CardTitle>
        <CardDescription>Ưu tiên các việc có thể làm chậm bàn giao, trả máy hoặc hoàn tiền.</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div role="status" className="grid gap-3">
            <div className="h-16 animate-pulse rounded-lg bg-muted/40" />
            <div className="h-16 animate-pulse rounded-lg bg-muted/40" />
          </div>
        ) : isError ? (
          <p role="alert" className="py-6 text-sm text-destructive">Không thể tải danh sách việc cần xử lý.</p>
        ) : items.length ? (
          <div className="divide-y divide-accent/60">
            {items.map((item) => <AttentionItem key={`${item.orderId}-${item.type}`} item={item} onOpen={openOrder} />)}
          </div>
        ) : (
          <Empty className="border-0 p-4">
            <EmptyHeader>
              <EmptyTitle>Chưa có việc cần xử lý</EmptyTitle>
              <EmptyDescription>Các đơn trong kỳ hiện không có cảnh báo vận hành hoặc tài chính.</EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
      </CardContent>
    </Card>
  );
}
