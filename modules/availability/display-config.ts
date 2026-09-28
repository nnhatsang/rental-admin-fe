import { rentalOrderStatusVisualConfig } from '@/modules/rental-orders/display-config';
import type { RentalOrderStatus } from '@/modules/rental-orders/model';

export const availabilityGanttOrderStatusConfig: Record<
  RentalOrderStatus,
  { label: string; color: string; className: string }
> = {
  CREATED: {
    label: 'Mới tạo',
    color: rentalOrderStatusVisualConfig.CREATED.color,
    className: rentalOrderStatusVisualConfig.CREATED.className,
  },
  CONFIRMED: {
    label: 'Đã xác nhận',
    color: rentalOrderStatusVisualConfig.CONFIRMED.color,
    className: rentalOrderStatusVisualConfig.CONFIRMED.className,
  },
  RENTING: {
    label: 'Đang thuê',
    color: rentalOrderStatusVisualConfig.RENTING.color,
    className: rentalOrderStatusVisualConfig.RENTING.className,
  },
  RETURNED: {
    label: 'Đã trả máy',
    color: rentalOrderStatusVisualConfig.RETURNED.color,
    className: rentalOrderStatusVisualConfig.RETURNED.className,
  },
  DONE: {
    label: 'Hoàn tất',
    color: rentalOrderStatusVisualConfig.DONE.color,
    className: rentalOrderStatusVisualConfig.DONE.className,
  },
  CANCELLED: {
    label: 'Đã hủy',
    color: rentalOrderStatusVisualConfig.CANCELLED.color,
    className: rentalOrderStatusVisualConfig.CANCELLED.className,
  },
  DISPUTED: {
    label: 'Có tranh chấp',
    color: rentalOrderStatusVisualConfig.DISPUTED.color,
    className: rentalOrderStatusVisualConfig.DISPUTED.className,
  },
};

export const availabilityGanttAssetConditionLabel: Record<string, string> = {
  NEW: 'Mới',
  GOOD: 'Tốt',
  FAIR: 'Đã qua sử dụng',
  DAMAGED: 'Hỏng',
  LOST: 'Mất',
};
export const availabilityGanttAssetStatusLabel: Record<string, string> = {
  AVAILABLE: 'Sẵn sàng',
  MAINTENANCE: 'Bảo trì',
  LOST: 'Mất',
};
