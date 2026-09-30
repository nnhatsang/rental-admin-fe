'use client';

import {
  RENTAL_GANTT_DEFAULT_SCALE,
  RENTAL_GANTT_LOCALE,
  RENTAL_GANTT_TIME_ZONE,
} from '@/components/reui/gantt/gantt-config';
import { getGanttDateRange, getRangeKey, type WeekStartsOn } from '@/components/reui/gantt/gantt-lib';
import type {
  GanttDateRange,
  GanttEvent,
  GanttRangeInfo,
  GanttResource,
  GanttScale,
} from '@/components/reui/gantt/gantt-types';
import { format } from 'date-fns';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { AssetCondition, AssetStatus } from '@/modules/asset-units/type';
import { availabilityGanttOrderStatusConfig } from '../display-config';
import type {
  AvailabilityGanttAllocationStatus,
  AvailabilityGanttFilters,
  IAvailabilityGanttBlock,
  IGetAvailabilityGanttParams,
} from '../gantt-type';
import type {
  HandoverStatus,
  RentalOrderStatus,
  RentalPickupMethod,
  RentalSettlementStatus,
  ReturnStatus,
} from '@/modules/rental-orders/model';
import { useGetAvailabilityGantt } from './use-get-availability-gantt';

const GANTT_SCALES: GanttScale[] = ['day', 'week', 'month', 'quarter', 'year'];
const DEFAULT_GANTT_LIMIT = 25;
const WEEK_STARTS_ON = (RENTAL_GANTT_LOCALE.options?.weekStartsOn ?? 1) as WeekStartsOn;

export type AvailabilityGanttEventData = IAvailabilityGanttBlock & {
  assetUnitId: string;
  serialNumber: string;
  productName: string;
  sku: string;
};

const toLocalDateTimeParam = (date: Date) => format(date, "yyyy-MM-dd'T'HH:mm");

const parseDateParam = (value: string | null) => {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
};

const parseScaleParam = (value: string | null): GanttScale | undefined => {
  return GANTT_SCALES.includes(value as GanttScale) ? (value as GanttScale) : undefined;
};

const parseListParam = <T extends string>(value: string | null): T[] =>
  value
    ? value
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean) as T[]
    : [];

const toUrlListParam = (value: string[]) => (value.length ? value.join(',') : undefined);

const parseBooleanParam = (value: string | null): boolean | undefined =>
  value === 'true' ? true : value === 'false' ? false : undefined;

const getVisibleRange = (scale: GanttScale, date: Date): GanttDateRange =>
  getGanttDateRange(scale, date, {
    timeZone: RENTAL_GANTT_TIME_ZONE,
    weekStartsOn: WEEK_STARTS_ON,
  }).visibleRange;

export const useAvailabilityGanttLogic = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams.get('search') ?? '';
  const productId = searchParams.get('productId') ?? undefined;
  const filters = useMemo<AvailabilityGanttFilters>(
    () => ({
      orderStatuses: parseListParam<RentalOrderStatus>(searchParams.get('orderStatuses')),
      allocationStatuses: parseListParam<AvailabilityGanttAllocationStatus>(searchParams.get('allocationStatuses')),
      handoverStatuses: parseListParam<HandoverStatus>(searchParams.get('handoverStatuses')),
      returnStatuses: parseListParam<ReturnStatus>(searchParams.get('returnStatuses')),
      settlementStatuses: parseListParam<RentalSettlementStatus>(searchParams.get('settlementStatuses')),
      pickupMethods: parseListParam<RentalPickupMethod>(searchParams.get('pickupMethods')),
      assetStatuses: parseListParam<AssetStatus>(searchParams.get('assetStatuses')),
      assetConditions: parseListParam<AssetCondition>(searchParams.get('assetConditions')),
      assetActive: parseBooleanParam(searchParams.get('assetActive')),
      includeCancelled: searchParams.get('includeCancelled') === 'true',
    }),
    [searchParams],
  );
  const [ganttScale, setGanttScale] = useState<GanttScale>(
    () => parseScaleParam(searchParams.get('scale')) ?? RENTAL_GANTT_DEFAULT_SCALE,
  );
  const [ganttDate, setGanttDate] = useState<Date>(
    () => parseDateParam(searchParams.get('date')) ?? parseDateParam(searchParams.get('startDate')) ?? new Date(),
  );
  const [visibleRange, setVisibleRange] = useState<GanttDateRange>(() =>
    getVisibleRange(
      parseScaleParam(searchParams.get('scale')) ?? RENTAL_GANTT_DEFAULT_SCALE,
      parseDateParam(searchParams.get('date')) ?? parseDateParam(searchParams.get('startDate')) ?? new Date(),
    ),
  );

  const startDate = visibleRange.start.toISOString();
  const endDate = visibleRange.end.toISOString();

  const replaceParams = useCallback(
    (updates: Record<string, string | undefined>) => {
      const params = new URLSearchParams(searchParams.toString());

      Object.entries(updates).forEach(([key, value]) => {
        if (!value) params.delete(key);
        else params.set(key, value);
      });

      const nextQuery = params.toString();
      if (nextQuery === searchParams.toString()) return;
      router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const handleSearchChange = useCallback(
    (value: string | undefined) => replaceParams({ search: value }),
    [replaceParams],
  );

  const handleFiltersChange = useCallback(
    (updates: Partial<AvailabilityGanttFilters>) => {
      const next = { ...filters, ...updates };
      replaceParams({
        orderStatuses: toUrlListParam(next.orderStatuses),
        allocationStatuses: toUrlListParam(next.allocationStatuses),
        handoverStatuses: toUrlListParam(next.handoverStatuses),
        returnStatuses: toUrlListParam(next.returnStatuses),
        settlementStatuses: toUrlListParam(next.settlementStatuses),
        pickupMethods: toUrlListParam(next.pickupMethods),
        assetStatuses: toUrlListParam(next.assetStatuses),
        assetConditions: toUrlListParam(next.assetConditions),
        assetActive: next.assetActive === undefined ? undefined : String(next.assetActive),
        includeCancelled: next.includeCancelled ? 'true' : undefined,
      });
    },
    [filters, replaceParams],
  );

  const clearFilters = useCallback(() => {
    replaceParams({
      search: undefined,
      productId: undefined,
      productIds: undefined,
      orderStatuses: undefined,
      allocationStatuses: undefined,
      handoverStatuses: undefined,
      returnStatuses: undefined,
      settlementStatuses: undefined,
      pickupMethods: undefined,
      assetStatuses: undefined,
      assetConditions: undefined,
      assetActive: undefined,
      includeCancelled: undefined,
    });
  }, [replaceParams]);

  const syncTimelineParams = useCallback(
    (next: GanttRangeInfo) => {
      replaceParams({
        scale: next.scale,
        date: toLocalDateTimeParam(next.date),
        startDate: toLocalDateTimeParam(next.range.start),
        endDate: toLocalDateTimeParam(next.range.end),
      });
    },
    [replaceParams],
  );

  const handleDateChange = useCallback((nextDate: Date) => {
    setGanttDate((current) => (current.getTime() === nextDate.getTime() ? current : nextDate));
  }, []);

  const handleScaleChange = useCallback((nextScale: GanttScale) => {
    setGanttScale((current) => (current === nextScale ? current : nextScale));
  }, []);

  const handleRangeChange = useCallback(
    (next: GanttRangeInfo) => {
      setGanttScale((current) => (current === next.scale ? current : next.scale));
      setGanttDate((current) => (current.getTime() === next.date.getTime() ? current : next.date));
      setVisibleRange((current) => (getRangeKey(current) === getRangeKey(next.range) ? current : next.range));
      syncTimelineParams(next);
    },
    [syncTimelineParams],
  );

  const params = useMemo<IGetAvailabilityGanttParams>(
    () => ({
      startDate,
      endDate,
      limit: DEFAULT_GANTT_LIMIT,
      search: search || undefined,
      productId,
        orderStatuses: filters.orderStatuses.length ? filters.orderStatuses : undefined,
        allocationStatuses: filters.allocationStatuses.length ? filters.allocationStatuses : undefined,
        handoverStatuses: filters.handoverStatuses.length ? filters.handoverStatuses : undefined,
        returnStatuses: filters.returnStatuses.length ? filters.returnStatuses : undefined,
        settlementStatuses: filters.settlementStatuses.length ? filters.settlementStatuses : undefined,
        pickupMethods: filters.pickupMethods.length ? filters.pickupMethods : undefined,
        assetStatuses: filters.assetStatuses.length ? filters.assetStatuses : undefined,
        assetConditions: filters.assetConditions.length ? filters.assetConditions : undefined,
        assetActive: filters.assetActive,
        includeCancelled: filters.includeCancelled ? true : undefined,
    }),
    [endDate, filters, productId, search, startDate],
  );
  const query = useGetAvailabilityGantt(params, startDate < endDate);

  const { hasNextPage, isFetchingNextPage, fetchNextPage } = query;
  useEffect(() => {
    if (!hasNextPage || isFetchingNextPage) return;
    void fetchNextPage();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const products = useMemo(() => query.data?.pages.flatMap((page) => page.items) ?? [], [query.data?.pages]);
  const summary = query.data?.pages[0]?.summary ?? {
    totalProducts: 0,
    totalAssets: 0,
    scheduledAssets: 0,
    freeAssets: 0,
    unassignableAssets: 0,
  };

  const resources = useMemo<GanttResource[]>(
    () =>
      products.map((product) => ({
        id: product.productId,
        title: `${product.name} · ${product.assetUnits.length} máy`,
        scheduleMode: 'multiple',
        // rowHeight: 2.75,
        children: product.assetUnits.map((asset) => {
          return {
            id: asset.assetUnitId,
            title: asset.serialNumber,
            scheduleMode: 'multiple',
            rowHeight: 4.5,
            data: {
              kind: 'asset',
              assetUnitId: asset.assetUnitId,
              serialNumber: asset.serialNumber,
              status: asset.status,
              condition: asset.condition,
              isActive: asset.isActive,
              scheduleCount: asset.blocks.length,
            },
          };
        }),
      })),
    [products],
  );

  const events = useMemo<GanttEvent<AvailabilityGanttEventData>[]>(
    () =>
      products.flatMap((product) =>
        product.assetUnits.flatMap((asset) =>
          asset.blocks.map((block) => ({
            id: `${asset.assetUnitId}:${block.orderId}`,
            title: `${block.orderCode} · ${block.customerName}`,
            start: new Date(block.startDate),
            end: new Date(block.blockedEndDate),
            resourceId: asset.assetUnitId,
            color: availabilityGanttOrderStatusConfig[block.orderStatus]?.color ?? 'var(--color-primary)',
            readOnly: true,
            draggable: false,
            resizable: false,
            data: {
              ...block,
              assetUnitId: asset.assetUnitId,
              serialNumber: asset.serialNumber,
              productName: product.name,
              sku: product.sku,
            },
          })),
        ),
      ),
    [products],
  );

  return {
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
  };
};
