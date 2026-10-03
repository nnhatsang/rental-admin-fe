'use client';

import { useCallback, useMemo, useState } from 'react';
import type { DateTimeRange } from '@/components/shared/date-time-range-picker';
import { usePermission } from '@/hooks/use-permission';
import { PermissionCode } from '@/utils/consts/rbac.const';
import {
  DASHBOARD_ATTENTION_PAGE_SIZE,
  DASHBOARD_TIMEZONE,
  DASHBOARD_TREND_GROUP_BY_DEFAULT,
  type DashboardPreset,
} from '../constants';
import { useGetDashboardAttention, useGetDashboardOverview, useGetDashboardTrends } from '../api';
import {
  formatDashboardIsoRangeValue,
  getDashboardWeekRange,
} from '../display-utils';
import type { DashboardTrendGroupBy } from '../model';
import { dashboardDateRangeSchema } from '../model';
import { addDays, endOfDay, startOfDay, subDays } from 'date-fns';

function getPresetRange(preset: DashboardPreset): DateTimeRange {
  const today = new Date();

  if (preset === 'week') return getDashboardWeekRange(today);

  return {
    from: startOfDay(subDays(today, preset === '30d' ? 29 : 89)),
    to: endOfDay(today),
  };
}

export function useDashboardLogic() {
  const { can } = usePermission();
  const hasAccess = can(PermissionCode.OrdersRead);
  const [dateRange, setDateRange] = useState<DateTimeRange>(() => getDashboardWeekRange());
  const [includeCancelled, setIncludeCancelled] = useState(false);
  const [groupBy, setGroupBy] = useState<DashboardTrendGroupBy>(DASHBOARD_TREND_GROUP_BY_DEFAULT);

  const dashboardQuery = useMemo(() => {
    const fromDate = formatDashboardIsoRangeValue(dateRange.from);
    const toDate = formatDashboardIsoRangeValue(dateRange.to);

    return {
      fromDate: fromDate ?? new Date().toISOString(),
      toDate: toDate ?? addDays(new Date(), 7).toISOString(),
      timezone: DASHBOARD_TIMEZONE,
      includeCancelled,
    };
  }, [dateRange.from, dateRange.to, includeCancelled]);

  const attentionQuery = useMemo(
    () => ({ ...dashboardQuery, page: 1, perPage: DASHBOARD_ATTENTION_PAGE_SIZE }),
    [dashboardQuery],
  );
  const trendsQuery = useMemo(() => ({ ...dashboardQuery, groupBy }), [dashboardQuery, groupBy]);

  const overview = useGetDashboardOverview(dashboardQuery, hasAccess);
  const attention = useGetDashboardAttention(attentionQuery, hasAccess);
  const trends = useGetDashboardTrends(trendsQuery, hasAccess);

  const updateDateRange = useCallback((nextRange: DateTimeRange) => {
    if (!nextRange.from || !nextRange.to) return;
    if (!dashboardDateRangeSchema.safeParse(nextRange).success) return;
    setDateRange(nextRange);
  }, []);

  const applyPreset = useCallback((preset: DashboardPreset) => {
    setDateRange(getPresetRange(preset));
  }, []);

  const refetchAll = useCallback(async () => {
    await Promise.all([overview.refetch(), attention.refetch(), trends.refetch()]);
  }, [attention, overview, trends]);

  return {
    hasAccess,
    dateRange,
    updateDateRange,
    applyPreset,
    includeCancelled,
    setIncludeCancelled,
    groupBy,
    setGroupBy,
    overview,
    attention,
    trends,
    refetchAll,
    isFetching: overview.isFetching || attention.isFetching || trends.isFetching,
  };
}
