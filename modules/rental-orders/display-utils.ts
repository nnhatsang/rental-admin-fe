import { formatDate, parseDate } from '@/lib/utils';
import type { RentalOrderActivityLog, RentalOrderListItem } from './model';

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

export const formatRentalDuration = (startDate?: string, endDate?: string) => {
  const start = parseDate(startDate);
  const end = parseDate(endDate);
  if (!start || !end) return 'Chưa đủ dữ liệu thời gian';
  if (end.getTime() <= start.getTime()) return 'Thời gian không hợp lệ';

  const totalMinutes = Math.round((end.getTime() - start.getTime()) / (60 * 1000));
  const days = Math.floor(totalMinutes / (24 * 60));
  const hours = Math.floor((totalMinutes % (24 * 60)) / 60);
  const minutes = totalMinutes % 60;

  return [
    days > 0 ? `${days} ngày` : null,
    hours > 0 ? `${hours} giờ` : null,
    minutes > 0 ? `${minutes} phút` : null,
  ].filter(Boolean).join(' ') || 'Dưới 1 phút';
};

export const formatRentalPeriod = (startDate?: string, endDate?: string) => {
  const start = parseDate(startDate);
  const end = parseDate(endDate);
  if (!start || !end) return 'Chưa chọn đủ giờ nhận và giờ trả';
  return `${formatDate(start, 'datetime')} → ${formatDate(end, 'datetime')}`;
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

const rentalOrderActivityDescription: Record<string, string> = {
  CREATE_ORDER: 'Đơn được tạo từ báo giá.',
  UPDATE_ORDER: 'Thông tin đơn được cập nhật.',
  DELETE_ORDER: 'Đơn đã được xóa mềm.',
  CANCEL_ORDER: 'Đơn đã được hủy.',
  RECORD_PAYMENT: 'Đã ghi nhận giao dịch thanh toán.',
  CONFIRM_PAYMENT: 'Đã xác nhận giao dịch thanh toán.',
  REJECT_PAYMENT: 'Giao dịch thanh toán đã bị từ chối.',
  CREATE_REFUND: 'Đã tạo yêu cầu hoàn tiền.',
  CONFIRM_REFUND: 'Đã xác nhận hoàn tiền.',
  CLOSE_CANCELLED_ORDER: 'Đã chốt phần tài chính còn lại của đơn hủy.',
  AUTO_CONFIRM_ORDER: 'Đơn được tự động xác nhận sau khi đủ điều kiện.',
  HANDOVER_ORDER: 'Đã ghi nhận bàn giao thiết bị.',
  RETURN_ORDER: 'Đã ghi nhận khách trả thiết bị.',
  INSPECT_ORDER: 'Đã ghi nhận kết quả kiểm tra thiết bị.',
  SETTLE_ORDER: 'Đơn đã được quyết toán.',
};

export const getRentalOrderActivityDescription = (
  log: Pick<RentalOrderActivityLog, 'action' | 'note'>,
) => log.note || rentalOrderActivityDescription[log.action] || 'Đã ghi nhận thao tác trên đơn.';
