import { rentalOrderStatusVisualConfig } from '@/modules/rental-orders/display-config';
import type { RentalOrderStatus } from '@/modules/rental-orders/model';

export const availabilityGanttOrderStatusConfig: Record<RentalOrderStatus, { label: string; color: string }> = {
  CREATED: { label: 'Mới tạo', color: rentalOrderStatusVisualConfig.CREATED.color },
  CONFIRMED: { label: 'Đã xác nhận', color: rentalOrderStatusVisualConfig.CONFIRMED.color },
  RENTING: { label: 'Đang thuê', color: rentalOrderStatusVisualConfig.RENTING.color },
  RETURNED: { label: 'Đã trả máy', color: rentalOrderStatusVisualConfig.RETURNED.color },
  DONE: { label: 'Hoàn tất', color: rentalOrderStatusVisualConfig.DONE.color },
  CANCELLED: { label: 'Đã hủy', color: rentalOrderStatusVisualConfig.CANCELLED.color },
  DISPUTED: { label: 'Có tranh chấp', color: rentalOrderStatusVisualConfig.DISPUTED.color },
};

export const availabilityGanttAssetStatusLabel: Record<string, string> = {
  AVAILABLE: 'Sẵn sàng',
  MAINTENANCE: 'Bảo trì',
  RETIRED: 'Ngừng sử dụng',
};