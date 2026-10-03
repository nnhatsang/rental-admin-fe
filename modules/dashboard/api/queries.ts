import { useQuery } from '@tanstack/react-query';
import {
  DASHBOARD_ATTENTION_PAGE_SIZE,
  DASHBOARD_POLLING_INTERVAL,
} from '../constants';
import type { DashboardAttentionQuery, DashboardDateRangeQuery, DashboardTrendsQuery } from '../model';
import {
  requestGetDashboardAttention,
  requestGetDashboardOverview,
  requestGetDashboardTrends,
} from './services';

export const dashboardQueryKeys = {
  all: ['dashboard'] as const,
  overview: (params: DashboardDateRangeQuery) => ['dashboard', 'operations', 'overview', params] as const,
  attention: (params: DashboardAttentionQuery) => ['dashboard', 'operations', 'attention', params] as const,
  trends: (params: DashboardTrendsQuery) => ['dashboard', 'operations', 'trends', params] as const,
};

export const useGetDashboardOverview = (params: DashboardDateRangeQuery, enabled = true) =>
  useQuery({
    queryKey: dashboardQueryKeys.overview(params),
    queryFn: async () => (await requestGetDashboardOverview(params)).data.data,
    enabled,
    placeholderData: (previous) => previous,
    refetchInterval: DASHBOARD_POLLING_INTERVAL,
  });

export const useGetDashboardAttention = (
  params: Omit<DashboardAttentionQuery, 'page' | 'perPage'> & { page?: number; perPage?: number },
  enabled = true,
) => {
  const queryParams: DashboardAttentionQuery = {
    ...params,
    page: params.page ?? 1,
    perPage: params.perPage ?? DASHBOARD_ATTENTION_PAGE_SIZE,
  };

  return useQuery({
    queryKey: dashboardQueryKeys.attention(queryParams),
    queryFn: async () => (await requestGetDashboardAttention(queryParams)).data.data,
    enabled,
    placeholderData: (previous) => previous,
    refetchInterval: DASHBOARD_POLLING_INTERVAL,
  });
};

export const useGetDashboardTrends = (params: DashboardTrendsQuery, enabled = true) =>
  useQuery({
    queryKey: dashboardQueryKeys.trends(params),
    queryFn: async () => (await requestGetDashboardTrends(params)).data.data,
    enabled,
    placeholderData: (previous) => previous,
  });
