import { apiAuth } from '@/axios';
import type { DefaultResponse, DefaultResponseWithPagination } from '@/types/api';
import type {
  DashboardAttentionItem,
  DashboardAttentionQuery,
  DashboardDateRangeQuery,
  DashboardOperationsOverview,
  DashboardTrends,
  DashboardTrendsQuery,
} from '../model';

export const requestGetDashboardOverview = (params: DashboardDateRangeQuery) =>
  apiAuth.get<DefaultResponse<DashboardOperationsOverview>>('/dashboard/operations/overview', { params });

export const requestGetDashboardAttention = (params: DashboardAttentionQuery) =>
  apiAuth.get<DefaultResponseWithPagination<DashboardAttentionItem>>('/dashboard/operations/attention', { params });

export const requestGetDashboardTrends = (params: DashboardTrendsQuery) =>
  apiAuth.get<DefaultResponse<DashboardTrends>>('/dashboard/operations/trends', { params });

