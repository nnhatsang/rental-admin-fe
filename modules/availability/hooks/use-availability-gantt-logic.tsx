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
import {
  availabilityGanttAssetConditionLabel,
  availabilityGanttAssetStatusLabel,
  availabilityGanttOrderStatusConfig,
} from '../display-config';
import type { IAvailabilityGanttBlock, IGetAvailabilityGanttParams } from '../gantt-type';
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
    }),
    [endDate, productId, search, startDate],
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
          const statusLabel = availabilityGanttAssetStatusLabel[asset.status] ?? asset.status;
          const conditionLabel = availabilityGanttAssetConditionLabel[asset.condition] ?? asset.condition;
          const stateLabel = asset.isActive ? `${statusLabel} · ${conditionLabel}` : 'Ngừng sử dụng';
          const scheduleLabel = asset.blocks.length ? `${asset.blocks.length} lịch` : 'Chưa có lịch';

          return {
            id: asset.assetUnitId,
            title: `${asset.serialNumber} · ${stateLabel} · ${scheduleLabel}`,
            scheduleMode: 'multiple',
            rowHeight: 4.5,
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
    handleRangeChange,
    handleScaleChange,
    handleSearchChange,
    isFetchingNextPage,
    products,
    query,
    resources,
    search,
    summary,
  };
};
