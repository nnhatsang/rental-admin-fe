import type { RentalOrderListItem } from './model';

export type RentalOrderScheduleBadge = {
  kind: 'STARTING_SOON' | 'START_OVERDUE' | 'RETURNING_SOON' | 'RETURN_OVERDUE';
  label: string;
};

const MINUTES_PER_HOUR = 60;
const STARTING_SOON_MINUTES = 24 * MINUTES_PER_HOUR;
const RETURNING_SOON_MINUTES = 2 * MINUTES_PER_HOUR;

const formatRelativeTime = (minutes: number) => {
  const absoluteMinutes = Math.max(Math.abs(Math.round(minutes)), 1);
  const hours = Math.floor(absoluteMinutes / MINUTES_PER_HOUR);
  const remainingMinutes = absoluteMinutes % MINUTES_PER_HOUR;

  if (hours > 0) {
    return `${hours} giờ${remainingMinutes > 0 ? ` ${remainingMinutes} phút` : ''}`;
  }

  return `${remainingMinutes} phút`;
};

export const formatRentalDuration = (startDate: string, endDate: string) => {
  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();
  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) return 'Thời gian không hợp lệ';

  const totalMinutes = Math.round((end - start) / (60 * 1000));
  const days = Math.floor(totalMinutes / (24 * 60));
  const hours = Math.floor((totalMinutes % (24 * 60)) / 60);

  if (days > 0 && hours > 0) return `${days} ngày ${hours} giờ`;
  if (days > 0) return `${days} ngày`;
  if (hours > 0) return `${hours} giờ`;
  return `${totalMinutes} phút`;
};

export const getRentalOrderScheduleBadge = (
  order: Pick<RentalOrderListItem, 'status' | 'startDate' | 'endDate' | 'isOverdue' | 'overdueHours'>,
  now = Date.now(),
): RentalOrderScheduleBadge | null => {
  const start = new Date(order.startDate).getTime();
  const end = new Date(order.endDate).getTime();

  if (order.status === 'CREATED' || order.status === 'CONFIRMED') {
    if (!Number.isFinite(start)) return null;

    const minutesUntilStart = Math.floor((start - now) / (60 * 1000));
    if (minutesUntilStart < 0) {
      return { kind: 'START_OVERDUE', label: `Quá giờ nhận ${formatRelativeTime(minutesUntilStart)}` };
    }

    if (minutesUntilStart <= STARTING_SOON_MINUTES) {
      return { kind: 'STARTING_SOON', label: `Sắp nhận máy · còn ${formatRelativeTime(minutesUntilStart)}` };
    }

    return null;
  }

  if (order.status !== 'RENTING' || !Number.isFinite(end)) return null;

  if (order.isOverdue || now > end) {
    const overdueHours = order.overdueHours > 0 ? order.overdueHours : Math.max(Math.ceil((now - end) / 3_600_000), 1);
    return { kind: 'RETURN_OVERDUE', label: `Quá hạn trả · ${overdueHours} giờ` };
  }

  const minutesUntilReturn = Math.floor((end - now) / (60 * 1000));
  if (minutesUntilReturn <= RETURNING_SOON_MINUTES) {
    return { kind: 'RETURNING_SOON', label: `Sắp đến giờ trả · còn ${formatRelativeTime(minutesUntilReturn)}` };
  }

  return null;
};
