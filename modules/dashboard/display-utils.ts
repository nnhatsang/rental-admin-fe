import { endOfDay, format, startOfDay } from 'date-fns';
import { vi } from 'date-fns/locale';
import { formatCurrency, parseDate } from '@/lib/utils';
import type { DashboardAttentionItem, DashboardAttentionType, DashboardTrendGroupBy } from './model';
import { DASHBOARD_TIMEZONE } from './constants';
import { dashboardAttentionConfig } from './display-config';

export const formatDashboardCurrency = (value: number | null | undefined) =>
  value == null ? 'Chưa có dữ liệu' : formatCurrency(value, { noDecimals: true });

export const formatDashboardNumber = (value: number | null | undefined) =>
  value == null ? '—' : new Intl.NumberFormat('vi-VN').format(value);

const dashboardDateTimeFormatter = new Intl.DateTimeFormat('vi-VN', {
  timeZone: DASHBOARD_TIMEZONE,
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

export const formatDashboardDateTime = (value: string | Date | null | undefined) => {
  const date = parseDate(value);
  return date ? dashboardDateTimeFormatter.format(date) : 'Chưa xác định';
};

export const formatDashboardDate = (value: string | Date | null | undefined) => {
  const date = parseDate(value);
  return date ? format(date, 'dd/MM/yyyy', { locale: vi }) : 'Chưa xác định';
};

export const formatDashboardPeriod = (from: Date | undefined, to: Date | undefined) => {
  if (!from || !to) return 'Chưa chọn khoảng thời gian';
  return `${formatDashboardDate(from)} – ${formatDashboardDate(to)}`;
};

export const formatDashboardBucketLabel = (value: string, groupBy: DashboardTrendGroupBy) => {
  const [datePart] = value.split('T');
  const [year, month, day] = datePart.split('-').map(Number);
  if (!year || !month || !day) return value;
  if (groupBy === 'MONTH') return `${String(month).padStart(2, '0')}/${year}`;
  if (groupBy === 'WEEK') return `Tuần từ ${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}`;
  return `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}`;
};

export const formatDashboardIsoRangeValue = (value: Date | undefined) => {
  if (!value) return undefined;
  return value.toISOString();
};

export const getDashboardWeekRange = (date = new Date()) => ({
  from: startOfDay(new Date(date.getFullYear(), date.getMonth(), date.getDate() - ((date.getDay() + 6) % 7))),
  to: endOfDay(new Date(date.getFullYear(), date.getMonth(), date.getDate() + (6 - ((date.getDay() + 6) % 7)))),
});

export const getDashboardAttentionLabel = (type: DashboardAttentionType) => dashboardAttentionConfig[type]?.label ?? 'Cần xử lý';

export const getDashboardAttentionTime = (item: DashboardAttentionItem) => {
  if (item.type === 'PICKUP_DUE') return `Nhận máy ${formatDashboardDateTime(item.startDate)}`;
  if (item.type === 'RETURN_DUE' || item.type === 'OVERDUE_RETURN') return `Trả máy ${formatDashboardDateTime(item.endDate)}`;
  return `${formatDashboardDateTime(item.startDate)} – ${formatDashboardDateTime(item.endDate)}`;
};
