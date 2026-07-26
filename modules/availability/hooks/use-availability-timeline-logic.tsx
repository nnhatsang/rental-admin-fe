'use client';

import {
  RENTAL_GANTT_DEFAULT_SCALE,
  RENTAL_GANTT_LOCALE,
  RENTAL_GANTT_TIME_ZONE,
} from '@/components/reui/gantt/gantt-config';
import { getGanttDateRange, getRangeKey, type WeekStartsOn } from '@/components/reui/gantt/gantt-lib';
import type { GanttDateRange, GanttEvent, GanttRangeInfo, GanttResource, GanttScale } from '@/components/reui/gantt/gantt-types';
import { format } from 'date-fns';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useMemo, useState } from 'react';
import type { IAvailabilityTimelineBlock } from '../type';
import { useGetAvailabilityTimeline } from './use-get-availability-timeline';

const DEFAULT_PAGE = 1;
const DEFAULT_PER_PAGE = 50;

const statusColor: Record<string, string> = {
  CONFIRMED: 'var(--color-blue-500)',
  PREPARING: 'var(--color-violet-500)',
  READY_FOR_PICKUP: 'var(--color-cyan-500)',
  DELIVERING: 'var(--color-orange-500)',
  RENTING: 'var(--color-emerald-500)',
  OVERDUE: 'var(--color-rose-500)',
};

const GANTT_SCALES: GanttScale[] = ['day', 'week', 'month', 'quarter', 'year'];
const WEEK_STARTS_ON = (RENTAL_GANTT_LOCALE.options?.weekStartsOn ?? 1) as WeekStartsOn;

type TimelineEventData = IAvailabilityTimelineBlock & {
  serialNumber: string | null;
  productName: string;
  sku: string;
};

const toLocalDateTimeParam = (date: Date) => format(date, "yyyy-MM-dd'T'HH:mm");

const parseDateParam = (value: string | null) => {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
};

const parsePositiveIntParam = (value: string | null, fallback: number) => {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
};

const parseScaleParam = (value: string | null): GanttScale | undefined => {
  return GANTT_SCALES.includes(value as GanttScale) ? (value as GanttScale) : undefined;
};

const getVisibleRange = (scale: GanttScale, date: Date): GanttDateRange => {
  return getGanttDateRange(scale, date, {
    timeZone: RENTAL_GANTT_TIME_ZONE,
    weekStartsOn: WEEK_STARTS_ON,
  }).visibleRange;
};

export const useAvailabilityTimelineLogic = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const page = parsePositiveIntParam(searchParams.get('page'), DEFAULT_PAGE);
  const perPage = parsePositiveIntParam(searchParams.get('perPage'), DEFAULT_PER_PAGE);
  const search = searchParams.get('search') ?? '';
  const [ganttScale, setGanttScale] = useState<GanttScale>(() => parseScaleParam(searchParams.get('scale')) ?? RENTAL_GANTT_DEFAULT_SCALE);
  const [ganttDate, setGanttDate] = useState<Date>(() => parseDateParam(searchParams.get('date')) ?? parseDateParam(searchParams.get('startDate')) ?? new Date());
  const [visibleRange, setVisibleRange] = useState<GanttDateRange>(() => getVisibleRange(ganttScale, ganttDate));
  const [isTimelineReady, setIsTimelineReady] = useState(false);

  const startDate = visibleRange.start.toISOString();
  const endDate = visibleRange.end.toISOString();

  const replaceParams = useCallback(
    (updates: Record<string, string | number | undefined>, options?: { resetPage?: boolean }) => {
      const params = new URLSearchParams(searchParams.toString());
      if (options?.resetPage) params.delete('page');

      Object.entries(updates).forEach(([key, value]) => {
        if (value === undefined || value === '') {
          params.delete(key);
          return;
        }

        params.set(key, String(value));
      });

      const nextQuery = params.toString();
      if (nextQuery === searchParams.toString()) return;

      router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const handleSearchChange = useCallback(
    (value: string | undefined) => {
      replaceParams({ search: value }, { resetPage: true });
    },
    [replaceParams],
  );

  const handlePageChange = useCallback(
    (nextPage: number) => {
      replaceParams({ page: nextPage > DEFAULT_PAGE ? nextPage : undefined });
    },
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
      setIsTimelineReady(true);
      setGanttScale((current) => (current === next.scale ? current : next.scale));
      setGanttDate((current) => (current.getTime() === next.date.getTime() ? current : next.date));
      setVisibleRange((current) => {
        if (getRangeKey(current) === getRangeKey(next.range)) return current;
        return next.range;
      });
      syncTimelineParams(next);
    },
    [syncTimelineParams],
  );

  const query = useGetAvailabilityTimeline(
    {
      startDate,
      endDate,
      page,
      perPage,
      search: search || undefined,
      availability: 'ALL',
    },
    Boolean(startDate && endDate && isTimelineReady),
  );

  const rows = query.data?.items ?? [];
  const resources = useMemo<GanttResource[]>(
    () =>
      rows.map((row) => ({
        id: row.assetUnitId,
        title: `${row.serialNumber} · ${row.productName}`,
        scheduleMode: 'multiple',
      })),
    [rows],
  );

  const events = useMemo<GanttEvent<TimelineEventData>[]>(
    () =>
      rows.flatMap((row) =>
        row.blocks.map((block) => ({
          id: `${row.assetUnitId}-${block.orderId}`,
          title: `${block.orderCode} - ${block.customerName}`,
          start: new Date(block.startDate),
          end: new Date(block.blockedEndDate),
          resourceId: row.assetUnitId,
          color: statusColor[block.status] ?? 'var(--color-primary)',
          readOnly: true,
          draggable: false,
          resizable: false,
          data: {
            ...block,
            serialNumber: row.serialNumber,
            productName: row.productName,
            sku: row.sku,
          },
        })),
      ),
    [rows],
  );

  return {
    currentPage: page,
    events,
    ganttDate,
    ganttScale,
    handleDateChange,
    handlePageChange,
    handleRangeChange,
    handleSearchChange,
    handleScaleChange,
    query,
    resources,
    search,
  };
};
