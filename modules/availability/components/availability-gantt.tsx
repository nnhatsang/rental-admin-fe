'use client';

import {
  RENTAL_GANTT_I18N,
  RENTAL_GANTT_LOCALE,
  RENTAL_GANTT_CONFIG,
  RENTAL_GANTT_TIME_ZONE,
} from '@/components/reui/gantt/gantt-config';
import { Gantt, type GanttRenderEventProps } from '@/components/reui/gantt/gantt';
import { GanttNav, GanttToolbar } from '@/components/reui/gantt/gantt-nav';
import { GanttView } from '@/components/reui/gantt/gantt-view';
import { DebouncedSearchInput } from '@/components/shared/debounced-search-input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from '@/components/ui/empty';
import { Separator } from '@/components/ui/separator';
import { cn, formatCurrency, formatDate } from '@/lib/utils';
import { assetActiveConfig, assetConditionConfig, assetStatusConfig } from '@/modules/asset-units/display-config';
import { ProductCombobox, type ProductOption } from '@/modules/asset-units/product-combobox';
import { CreateRentalOrderDialog, type CreateRentalOrderPrefill } from '@/modules/rental-orders/components/create';
import {
  RentalOrderActionDialog,
  type RentalOrderAction,
} from '@/modules/rental-orders/components/actions/rental-order-action-dialog';
import { RentalOrderDetailDialog } from '@/modules/rental-orders/components/detail/rental-order-detail-dialog';
import { UpdateRentalOrderDialog } from '@/modules/rental-orders/components/update/update-rental-order-dialog';
import { useRentalOrders } from '@/modules/rental-orders/rental-orders-provider';
import { IconAlertTriangle, IconCalendarCheck, IconCircleCheck, IconPackages, IconPlus, IconRefresh } from '@tabler/icons-react';
import { useCallback, useMemo, useState, type CSSProperties, type ReactNode } from 'react';
import type { GanttOccurrence, GanttResource, GanttSlotDraft } from '@/components/reui/gantt/gantt-types';
import { availabilityGanttOrderStatusConfig } from '../display-config';
import { getRentalOrderFinancialSummary, getRentalOrderNextAction } from '@/modules/rental-orders/display-semantics';
import { getAvailabilityErrorMessage } from '../display-utils';
import { settlementStatusConfig } from '@/modules/rental-orders/display-config';
import type { AvailabilityGanttEventData } from '../hooks/use-availability-gantt-logic';
import type { IAvailabilityGanttAsset } from '../gantt-type';
import { AvailabilityGanttFilterBar } from './availability-gantt-filter-bar';
import { useAvailabilityGanttLogic } from '../hooks/use-availability-gantt-logic';

type SummaryMetricTone = 'neutral' | 'scheduled' | 'available' | 'unavailable';

type AvailabilityGanttTooltipProps = GanttRenderEventProps<AvailabilityGanttEventData> & {
  timeLabel: string;
};

type AvailabilityGanttAssetResourceData = Pick<
  IAvailabilityGanttAsset,
  'assetUnitId' | 'serialNumber' | 'status' | 'condition' | 'isActive'
> & {
  kind: 'asset';
  scheduleCount: number;
};

function AvailabilityGanttResourceLabel({ resource, isGroup }: { resource: GanttResource; isGroup: boolean }) {
  if (isGroup) {
    return <span className="min-w-0 truncate">{resource.title}</span>;
  }

  const data = resource.data as AvailabilityGanttAssetResourceData | undefined;
  if (!data || data.kind !== 'asset') {
    return <span className="min-w-0 truncate">{resource.title}</span>;
  }

  const statusConfig = data.isActive ? assetStatusConfig[data.status] : assetActiveConfig.false;
  const conditionConfig = assetConditionConfig[data.condition];
  const scheduleLabel = data.scheduleCount > 0 ? `${data.scheduleCount} lịch` : 'Trống';

  return (
    <div className="flex min-w-0 items-center gap-1.5">
      <span className="min-w-0 truncate font-medium">{data.serialNumber}</span>
      <Badge variant="outline" className={cn('h-5 shrink-0 px-1.5 text-[10px]', statusConfig.className)}>
        {statusConfig.label}
      </Badge>
      {conditionConfig ? (
        <Badge variant="outline" className={cn('h-5 shrink-0 px-1.5 text-[10px]', conditionConfig.className)}>
          {conditionConfig.label}
        </Badge>
      ) : null}
      <span className="hidden shrink-0 text-[10px] text-muted-foreground @[25rem]:inline">{scheduleLabel}</span>
    </div>
  );
}
function AvailabilityGanttEvent({ occurrence }: GanttRenderEventProps<AvailabilityGanttEventData>) {
  const event = occurrence.event;
  const data = event.data;
  const hasNote = Boolean(data?.internalNote || data?.customerNote || data?.cancelReason);
  const pickupLabel = data ? (data.pickupMethod === 'DELIVERY' ? 'Giao máy' : 'Tại cửa hàng') : null;
  const financialSummary = data ? getRentalOrderFinancialSummary(data) : null;
  const orderStatus = data ? availabilityGanttOrderStatusConfig[data.orderStatus] : null;
  const attention =
    financialSummary?.isActionRequired && financialSummary.amount > 0
      ? {
          label: financialSummary.label,
          amount: financialSummary.amount,
          className: settlementStatusConfig[financialSummary.badgeStatus].className,
        }
      : null;

  return (
    <div className="flex min-w-0 flex-1 flex-col justify-center gap-0.5 py-0.5 leading-tight">
      <div className="flex min-w-0 items-center gap-1.5">
        <span className="relative size-1.5 shrink-0 rounded-full bg-(--gantt-event-color)" aria-hidden="true" />
        <span className="min-w-0 truncate font-semibold">{data?.orderCode ?? event.title}</span>
        {orderStatus ? (
          <span
            className={cn(
              'hidden shrink-0 rounded-full border px-1.5 py-px text-[10px] font-medium @[18rem]:inline',
              orderStatus.className,
            )}
          >
            {orderStatus.label}
          </span>
        ) : null}
        {hasNote ? (
          <span
            className="size-1.5 shrink-0 rounded-full bg-amber-500"
            title="Đơn có ghi chú cần xem"
            aria-label="Đơn có ghi chú cần xem"
          />
        ) : null}
      </div>
      {data ? (
        <div className="hidden min-w-0 items-center gap-x-1.5 text-[11px] text-muted-foreground @[13rem]:flex">
          <span className="min-w-0 truncate">{data.customerName}</span>
          {pickupLabel ? <span className="hidden shrink-0 @[19rem]:inline">· {pickupLabel}</span> : null}
          {attention ? (
            <span
              className={cn(
                'hidden max-w-44 truncate rounded-sm border border-current/20 bg-background/70 px-1 text-[10px] font-medium @[21rem]:inline',
                attention.className,
              )}
              title={`${attention.label}: ${formatCurrency(attention.amount, { noDecimals: true })}`}
            >
              {attention.label} · {formatCurrency(attention.amount, { noDecimals: true })}
            </span>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
function AvailabilityGanttEventTooltip({ occurrence, timeLabel }: AvailabilityGanttTooltipProps) {
  const data = occurrence.event.data;
  if (!data) {
    return (
      <div className="grid gap-1">
        <div className="font-medium">{occurrence.event.title}</div>
        <div className="opacity-80">{timeLabel}</div>
      </div>
    );
  }

  const orderStatus = availabilityGanttOrderStatusConfig[data.orderStatus];
  const financialSummary = getRentalOrderFinancialSummary(data);
  const nextAction = getRentalOrderNextAction(data);
  const contact = data.customerPhone
    ? 'ĐT: ' + data.customerPhone
    : data.customerSocialContact
      ? 'MXH: ' + data.customerSocialContact
      : null;
  const pickupLabel =
    data.pickupMethod === 'DELIVERY'
      ? data.deliveryAddress
        ? 'Giao máy · ' + data.deliveryAddress
        : 'Giao máy · Chưa có địa chỉ'
      : 'Nhận tại cửa hàng';
  const note = data.cancelReason || data.internalNote || data.customerNote;

  return (
    <div className="grid w-[min(22rem,calc(100vw-1.5rem))] gap-3 p-3 text-xs">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{data.orderCode}</p>
          <p className="mt-0.5 truncate text-background/75">{data.customerName}</p>
          {contact ? <p className="truncate text-background/60">{contact}</p> : null}
        </div>
        <Badge variant="outline" className={cn('shrink-0', orderStatus?.className ?? 'text-background')}>
          {orderStatus?.label ?? data.orderStatus}
        </Badge>
      </div>

      <div className="grid gap-1.5 border-y border-background/15 py-2">
        <div className="flex items-start justify-between gap-3">
          <span className="shrink-0 text-background/60">Thiết bị</span>
          <span className="max-w-52 text-right font-medium">
            {data.productName} · {data.serialNumber}
          </span>
        </div>
        <div className="flex items-start justify-between gap-3">
          <span className="shrink-0 text-background/60">Thời gian</span>
          <span className="text-right font-medium">
            {formatDate(data.startDate, 'shortDateTime')} → {formatDate(data.endDate, 'shortDateTime')}
          </span>
        </div>
        <div className="flex items-start justify-between gap-3">
          <span className="shrink-0 text-background/60">Nhận máy</span>
          <span className="max-w-52 text-right font-medium">{pickupLabel}</span>
        </div>
      </div>

      <div className="grid gap-1.5">
        <div className="flex items-center justify-between gap-2">
          <span className="text-background/60">Tiếp theo</span>
          <Badge variant="outline" className={cn('max-w-52 text-right', settlementStatusConfig[nextAction.financial.badgeStatus].className)}>
            {nextAction.label}
          </Badge>
        </div>
        {financialSummary.amount > 0 ? (
          <div className="flex items-center justify-between gap-2">
            <span className="text-background/60">{financialSummary.amountLabel}</span>
            <strong className="font-semibold text-background">
              {formatCurrency(financialSummary.amount, { noDecimals: true })}
            </strong>
          </div>
        ) : null}
        <div className="flex items-center justify-between gap-2 text-background/60">
          <span>Đã thu</span>
          <span className="font-medium text-background/85">{formatCurrency(data.paidTotal, { noDecimals: true })}</span>
        </div>
      </div>

      {note ? (
        <p className="line-clamp-2 border-t border-background/15 pt-2 text-background/70">
          <span className="font-medium text-amber-300">Ghi chú:</span> {note}
        </p>
      ) : null}
    </div>
  );
}
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
    handleFiltersChange,
    handleRangeChange,
    handleScaleChange,
    handleSearchChange,
    clearFilters,
    filters,
    isFetchingNextPage,
    products,
    productId,
    query,
    resources,
    search,
    summary,
  } = useAvailabilityGanttLogic();
  const [createOpen, setCreateOpen] = useState(false);
  const [createPrefill, setCreatePrefill] = useState<CreateRentalOrderPrefill | null>(null);

  const productByResourceId = useMemo(() => {
    const result = new Map<string, { product: (typeof products)[number]; option: ProductOption }>();

    products.forEach((product) => {
      const option: ProductOption = {
        id: product.productId,
        name: product.name,
        sku: product.sku,
        assetUnitCount: product.assetUnits.length,
      };
      result.set(product.productId, { product, option });
      product.assetUnits.forEach((asset) => result.set(asset.assetUnitId, { product, option }));
    });

    return result;
  }, [products]);

  const openCreateRentalOrder = useCallback((prefill: CreateRentalOrderPrefill | null = null) => {
    setCreatePrefill(prefill);
    setCreateOpen(true);
  }, []);

  const handleCreateOpenChange = useCallback((nextOpen: boolean) => {
    setCreateOpen(nextOpen);
    if (!nextOpen) setCreatePrefill(null);
  }, []);

  const canSelectSlot = useCallback(
    (slot: GanttSlotDraft) => Boolean(slot.resourceId && productByResourceId.has(slot.resourceId)),
    [productByResourceId],
  );

  const handleSelectSlot = useCallback(
    (slot: GanttSlotDraft) => {
      if (!slot.resourceId) return;
      const resource = productByResourceId.get(slot.resourceId);
      if (!resource) return;

      const end =
        slot.end.getTime() > slot.start.getTime()
          ? slot.end
          : new Date(slot.start.getTime() + 60 * 60 * 1000);

      openCreateRentalOrder({
        startDate: slot.start.toISOString(),
        endDate: end.toISOString(),
        items: [{ productId: resource.product.productId, quantity: 1 }],
        initialProducts: [resource.option],
      });
    },
    [openCreateRentalOrder, productByResourceId],
  );

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

  const isEmpty = !query.isLoading && !query.isError && products.length === 0;
  const availabilityFilterBar = (
    <AvailabilityGanttFilterBar
      filters={filters}
      onChange={handleFiltersChange}
      onClear={clearFilters}
      externalFilterCount={(search ? 1 : 0) + (productId ? 1 : 0)}
    />
  );

  return (
    <div className="grid gap-4">
      <Card className="overflow-hidden">
        <CardHeader className="gap-3 border-b border-accent/60 has-data-[slot=card-action]:grid-cols-1 xl:has-data-[slot=card-action]:grid-cols-[1fr_auto]">
          <div className="grid auto-rows-min gap-1.5">
            <CardTitle className="flex items-center gap-2 text-xl leading-none">Lịch thiết bị</CardTitle>
            <CardDescription className="max-w-2xl leading-snug">
              Theo dõi thiết bị đang được thuê và trạng thái đơn trong khung thời gian. Bấm hoặc kéo vùng trống trên
              dòng sản phẩm/máy để thêm đơn thuê; bấm vào thanh lịch để xem chi tiết đơn.
            </CardDescription>
          </div>
          <CardAction className="col-start-1 row-start-auto flex w-full flex-wrap justify-start gap-2 justify-self-stretch xl:col-start-2 xl:row-span-2 xl:row-start-1 xl:w-auto xl:flex-nowrap xl:justify-end xl:justify-self-end">
            <ProductCombobox syncToUrl placeholder="Lọc theo sản phẩm..." className="w-full sm:w-[330px]" />
            <DebouncedSearchInput
              value={search}
              onDebouncedChange={handleSearchChange}
              placeholder="Mã đơn, khách hàng..."
              className="w-full h-8 sm:w-[300px]"
            />
            <Button type="button" onClick={() => openCreateRentalOrder()}>
              <IconPlus aria-hidden="true" data-icon="inline-start" />
              Thêm đơn thuê
            </Button>
            <Button type="button" variant="outline" disabled={query.isFetching} onClick={() => void query.refetch()}>
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
                label="Trống theo lịch"
                value={summary.freeAssets}
                description="Không có đơn giao nhau; chưa xét tình trạng máy"
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
          <div className="flex flex-wrap items-center gap-x-4 px-4 gap-y-2 text-xs text-muted-foreground">
            <span className="font-medium text-foreground">Trạng thái đơn thuê:</span>
            {Object.entries(availabilityGanttOrderStatusConfig).map(([status, config]) => (
              <span key={status} className="inline-flex items-center gap-1.5">
                <span
                  className="size-5 border border-(--gantt-legend-color)/40 bg-(--gantt-legend-color)/20"
                  style={{ '--gantt-legend-color': config.color } as CSSProperties}
                  aria-hidden="true"
                />
                {config.label}
              </span>
            ))}
          </div>
          <Separator />

          {query.isError ? (
            <Alert variant="destructive">
              <AlertTitle>Không tải được lịch thiết bị</AlertTitle>
              <AlertDescription>{getAvailabilityErrorMessage(query.error)}</AlertDescription>
            </Alert>
          ) : null}

          {isEmpty ? (
            <div className="grid gap-3">
              <div className="flex min-w-0 flex-wrap items-center justify-end gap-2 border-y border-accent/60 bg-muted/10 px-3 py-2">
                {availabilityFilterBar}
              </div>
              <Empty className="min-h-56 border border-dashed border-accent/60">
                <EmptyHeader>
                  <EmptyTitle>Không có thiết bị phù hợp</EmptyTitle>
                  <EmptyDescription>
                    Thử bỏ bớt bộ lọc, đổi khoảng thời gian, sản phẩm hoặc từ khóa tìm kiếm.
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            </div>
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
                onSelectSlot={handleSelectSlot}
                canSelectSlot={canSelectSlot}
                renderScheduleHint={() => (
                  <span
                    title="Bấm hoặc kéo để thêm đơn thuê"
                    className="bg-primary text-primary-foreground pointer-events-none inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium whitespace-nowrap shadow-sm"
                  >
                    <IconPlus className="size-3" aria-hidden="true" />
                    Thêm đơn thuê
                  </span>
                )}
                renderEvent={AvailabilityGanttEvent}
                renderEventTooltip={AvailabilityGanttEventTooltip}
                renderResourceLabel={AvailabilityGanttResourceLabel}
                locale={RENTAL_GANTT_LOCALE}
                timeZone={RENTAL_GANTT_TIME_ZONE}
                i18n={RENTAL_GANTT_I18N}
                className="h-[min(72vh,760px)] min-h-[460px] border-0"
                metrics={{ laneHeight: 2.25 }}
                loading={query.isFetching}
                {...RENTAL_GANTT_CONFIG}
              >
                <GanttNav />
                <GanttToolbar className="min-w-0 flex-wrap justify-end border-b px-3 py-2">
                  {availabilityFilterBar}
                </GanttToolbar>
                <GanttView />
              </Gantt>
            </div>
          )}
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
      <CreateRentalOrderDialog open={createOpen} prefill={createPrefill} onOpenChange={handleCreateOpenChange} />
    </div>
  );
}
