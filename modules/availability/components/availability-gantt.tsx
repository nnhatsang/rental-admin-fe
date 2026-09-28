'use client';

import {
  RENTAL_GANTT_I18N,
  RENTAL_GANTT_LOCALE,
  RENTAL_GANTT_READONLY_CONFIG,
  RENTAL_GANTT_TIME_ZONE,
} from '@/components/reui/gantt/gantt-config';
import { Gantt } from '@/components/reui/gantt/gantt';
import { GanttNav } from '@/components/reui/gantt/gantt-nav';
import { GanttView } from '@/components/reui/gantt/gantt-view';
import { DebouncedSearchInput } from '@/components/shared/debounced-search-input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from '@/components/ui/empty';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { ProductCombobox } from '@/modules/asset-units/product-combobox';
import {
  RentalOrderActionDialog,
  type RentalOrderAction,
} from '@/modules/rental-orders/components/actions/rental-order-action-dialog';
import { RentalOrderDetailDialog } from '@/modules/rental-orders/components/detail/rental-order-detail-dialog';
import { UpdateRentalOrderDialog } from '@/modules/rental-orders/components/update/update-rental-order-dialog';
import { useRentalOrders } from '@/modules/rental-orders/rental-orders-provider';
import { IconAlertTriangle, IconCalendarCheck, IconCircleCheck, IconPackages, IconRefresh } from '@tabler/icons-react';
import { useCallback, type CSSProperties, type ReactNode } from 'react';
import type { GanttOccurrence } from '@/components/reui/gantt/gantt-types';
import { availabilityGanttOrderStatusConfig } from '../display-config';
import { formatAvailabilityRange, getAvailabilityErrorMessage } from '../display-utils';
import type { AvailabilityGanttEventData } from '../hooks/use-availability-gantt-logic';
import { useAvailabilityGanttLogic } from '../hooks/use-availability-gantt-logic';
import { Clock } from 'lucide-react';

type SummaryMetricTone = 'neutral' | 'scheduled' | 'available' | 'unavailable';

const summaryMetricToneClasses: Record<SummaryMetricTone, { icon: string; value: string }> = {
  neutral: {
    icon: 'bg-muted text-muted-foreground',
    value: 'text-foreground',
  },
  scheduled: {
    icon: 'bg-accent/25 text-accent-foreground',
    value: 'text-foreground',
  },
  available: {
    icon: 'bg-primary/10 text-primary',
    value: 'text-primary',
  },
  unavailable: {
    icon: 'bg-destructive/10 text-destructive',
    value: 'text-destructive',
  },
};

function SummaryMetric({
  label,
  value,
  description,
  icon,
  tone,
}: {
  label: string;
  value: number;
  description: string;
  icon: ReactNode;
  tone: SummaryMetricTone;
}) {
  const toneClasses = summaryMetricToneClasses[tone];

  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-accent/40 bg-background px-3.5 py-3 transition-colors hover:bg-muted/20">
      <div className="flex min-w-0 items-center gap-3">
        <span className={cn('flex size-9 shrink-0 items-center justify-center rounded-md', toneClasses.icon)}>
          {icon}
        </span>
        <div className="min-w-0">
          <p className="text-sm font-medium text-foreground">{label}</p>
          <p className="truncate text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
      <span className={cn('text-xl font-semibold tracking-tight tabular-nums', toneClasses.value)}>
        {value.toLocaleString('vi-VN')}
      </span>
    </div>
  );
}

export function AvailabilityGantt() {
  const { currentRow, open, setCurrentRow, setOpen } = useRentalOrders();
  const {
    events,
    ganttDate,
    ganttScale,
    handleDateChange,
    handleRangeChange,
    handleScaleChange,
    handleSearchChange,
    isFetchingNextPage,
    products,
    query,
    resources,
    search,
    summary,
  } = useAvailabilityGanttLogic();

  const handleEventClick = useCallback(
    (occurrence: GanttOccurrence<AvailabilityGanttEventData>) => {
      const order = occurrence.event.data;
      if (!order) return;

      setCurrentRow({ id: order.orderId, code: order.orderCode });
      setOpen('detail');
    },
    [setCurrentRow, setOpen],
  );

  const isRentalOrderAction = ['payment', 'refund', 'handover', 'return', 'inspection', 'settle', 'cancel'].includes(
    open ?? '',
  );
  const action: RentalOrderAction | null = isRentalOrderAction ? (open as RentalOrderAction) : null;

  const rangeStart = query.data?.pages[0]?.startDate;
  const rangeEnd = query.data?.pages[0]?.endDate;
  const isEmpty = !query.isLoading && !query.isError && products.length === 0;

  return (
    <div className="grid gap-4">
      <Card className="overflow-hidden">
        <CardHeader className="gap-3 border-b border-accent/60 has-data-[slot=card-action]:grid-cols-1 lg:has-data-[slot=card-action]:grid-cols-[1fr_auto]">
          <div className="grid auto-rows-min gap-1.5">
            <CardTitle className="flex items-center gap-2 text-xl leading-none">Lịch thiết bị</CardTitle>
            <CardDescription className="max-w-2xl leading-snug">
              Theo dỗi thiết bị đang được thuê và trạng thái đơn thuê trong khung thời gian.
            </CardDescription>
            <div className="flex items-center gap-2">
              <Clock className="size-4 text-muted-foreground" />
              <span className="text-primary font-medium">
                {rangeStart && rangeEnd
                  ? formatAvailabilityRange(rangeStart, rangeEnd)
                  : 'Đang xác định khoảng thời gian...'}
              </span>
            </div>
          </div>
          <CardAction className="col-start-1 row-start-auto flex w-full flex-wrap justify-start gap-2 justify-self-stretch lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:w-auto lg:flex-nowrap lg:justify-end lg:justify-self-end">
            <ProductCombobox syncToUrl placeholder="Lọc theo sản phẩm..." className="w-full sm:w-[230px]" />
            <DebouncedSearchInput
              value={search}
              onDebouncedChange={handleSearchChange}
              placeholder="Tìm sản phẩm, SKU, serial, mã đơn..."
              className="w-full h-8 sm:w-[280px]"
            />
            <Button variant="outline" disabled={query.isFetching} onClick={() => void query.refetch()}>
              <IconRefresh aria-hidden="true" data-icon="inline-start" />
              Làm mới
            </Button>
          </CardAction>
        </CardHeader>

        <CardContent className="grid gap-4 p-0">
          <div className="grid gap-3 px-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-sm font-medium text-foreground">Tình trạng thiết bị</p>
                <p className="text-xs text-muted-foreground">Khả năng cho thuê trong khoảng thời gian đang xem.</p>
              </div>
              {/* <Badge variant="outline" className="font-normal">
                {summary.totalProducts.toLocaleString('vi-VN')} sản phẩm đang lọc
              </Badge> */}
            </div>

            <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
              <SummaryMetric
                label="Tổng thiết bị"
                value={summary.totalAssets}
                description="Thuộc các sản phẩm đang lọc"
                tone="neutral"
                icon={<IconPackages className="size-4" aria-hidden="true" />}
              />
              <SummaryMetric
                label="Đang có lịch thuê"
                value={summary.scheduledAssets}
                description="Có đơn giao nhau với khoảng xem"
                tone="scheduled"
                icon={<IconCalendarCheck className="size-4" aria-hidden="true" />}
              />
              <SummaryMetric
                label="Có thể cho thuê"
                value={summary.freeAssets}
                description="Không trùng lịch thuê"
                tone="available"
                icon={<IconCircleCheck className="size-4" aria-hidden="true" />}
              />
              <SummaryMetric
                label="Không khả dụng"
                value={summary.unassignableAssets}
                description="Bảo trì, mất hoặc đang tắt"
                tone="unavailable"
                icon={<IconAlertTriangle className="size-4" aria-hidden="true" />}
              />
            </div>
          </div>

          <div className="flex flex-wrap px-4 items-center justify-between gap-2 text-sm text-muted-foreground">
            {isFetchingNextPage ? <Badge variant="secondary">Đang tải thêm sản phẩm...</Badge> : null}
          </div>
          <Separator />

          {query.isError ? (
            <Alert variant="destructive">
              <AlertTitle>Không tải được lịch thiết bị</AlertTitle>
              <AlertDescription>{getAvailabilityErrorMessage(query.error)}</AlertDescription>
            </Alert>
          ) : null}

          {isEmpty ? (
            <Empty className="min-h-56 border border-dashed border-accent/60">
              <EmptyHeader>
                <EmptyTitle>Không có thiết bị phù hợp</EmptyTitle>
                <EmptyDescription>Thử đổi khoảng thời gian, sản phẩm hoặc từ khóa tìm kiếm.</EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <div className="overflow-hidden border-none bg-background">
              <Gantt
                events={events}
                resources={resources}
                scale={ganttScale}
                date={ganttDate}
                onDateChange={handleDateChange}
                onScaleChange={handleScaleChange}
                onRangeChange={handleRangeChange}
                onEventClick={handleEventClick}
                locale={RENTAL_GANTT_LOCALE}
                timeZone={RENTAL_GANTT_TIME_ZONE}
                i18n={RENTAL_GANTT_I18N}
                className="h-[min(72vh,760px)] min-h-[460px] border-0"
                loading={query.isFetching}
                {...RENTAL_GANTT_READONLY_CONFIG}
              >
                <GanttNav />
                <GanttView />
              </Gantt>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
            <span className="font-medium text-foreground">Chú thích trạng thái đơn:</span>
            {Object.entries(availabilityGanttOrderStatusConfig).map(([status, config]) => (
              <span key={status} className="inline-flex items-center gap-1.5">
                <span
                  className="size-4 rounded-sm border border-(--gantt-legend-color)/40 bg-(--gantt-legend-color)/20"
                  style={{ '--gantt-legend-color': config.color } as CSSProperties}
                  aria-hidden="true"
                />
                {config.label}
              </span>
            ))}
          </div>
        </CardContent>
      </Card>

      <UpdateRentalOrderDialog
        open={open === 'update'}
        orderId={currentRow?.id ?? null}
        orderCode={currentRow?.code}
        onOpenChange={(next) => setOpen(next ? 'update' : null)}
      />
      <RentalOrderActionDialog
        open={Boolean(action)}
        action={action}
        orderId={currentRow?.id ?? null}
        onOpenChange={(next) => setOpen(next && action ? action : null)}
      />
      <RentalOrderDetailDialog open={open === 'detail'} onOpenChange={(next) => setOpen(next ? 'detail' : null)} />
    </div>
  );
}
