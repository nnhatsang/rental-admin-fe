import type { DashboardTrendGroupBy } from './model';

export const DASHBOARD_TIMEZONE = 'Asia/Ho_Chi_Minh';
export const DASHBOARD_POLLING_INTERVAL = 30_000;
export const DASHBOARD_ATTENTION_PAGE_SIZE = 8;
export const DASHBOARD_TREND_GROUP_BY_DEFAULT: DashboardTrendGroupBy = 'DAY';

export const dashboardPresetOptions = [
  { value: 'week', label: 'Tuần này' },
  { value: '30d', label: '30 ngày' },
  { value: '90d', label: '90 ngày' },
] as const;

export type DashboardPreset = (typeof dashboardPresetOptions)[number]['value'];
