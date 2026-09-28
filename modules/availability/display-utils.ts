import { formatDate } from '@/lib/utils';

export function formatAvailabilityRange(startDate: string, endDate: string): string {
  return `${formatDate(startDate, 'shortDateTime')} → ${formatDate(endDate, 'shortDateTime')}`;
}

export function getAvailabilityErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return 'Không thể tải lịch thiết bị. Vui lòng thử lại.';
}
