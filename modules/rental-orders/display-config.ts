import {
  IconAlertTriangle,
  IconBan,
  IconCamera,
  IconCheck,
  IconCircleCheck,
  IconClock,
  IconCreditCard,
  IconPackage,
  IconPackageImport,
  IconRefresh,
  IconTool,
  IconX,
} from '@tabler/icons-react';
import { toOptions, type DisplayConfig } from '@/types/display-config';
import type {
  HandoverStatus,
  PaymentTransactionStatus,
  RentalInspectionCondition,
  RentalOrderAllocation,
  RentalOrderStatus,
  RentalRefundStatus,
  RentalSettlementStatus,
  ReturnStatus,
} from './model';
import type { RentalOrderScheduleBadge } from './display-utils';

type RentalStatusDisplayConfig = DisplayConfig & {
  description: string;
};

const chartBlue = 'border-chart-4/40 bg-chart-4/10 text-chart-4 hover:bg-chart-4/20';
const chartGreen = 'border-chart-1/40 bg-chart-1/10 text-chart-1 hover:bg-chart-1/20';
const chartTeal = 'border-chart-2/40 bg-chart-2/10 text-chart-2 hover:bg-chart-2/20';
const chartLime = 'border-chart-3/40 bg-chart-3/10 text-chart-3 hover:bg-chart-3/20';
const chartAmber = 'border-chart-5/40 bg-chart-5/10 text-chart-5 hover:bg-chart-5/20';
const neutral = 'border-muted-foreground/25 bg-muted text-muted-foreground hover:bg-muted/80';
const danger = 'border-destructive/35 bg-destructive/10 text-destructive hover:bg-destructive/20';

export const orderStatusConfig = {
  CREATED: {
    label: 'Mới tạo',
    description: 'Đơn vừa được tạo và đang chờ xác nhận hoặc thanh toán.',
    icon: IconClock,
    className: chartBlue,
  },
  CONFIRMED: {
    label: 'Đã xác nhận',
    description: 'Đơn đã được xác nhận và sẵn sàng cho bước bàn giao.',
    icon: IconCircleCheck,
    className: chartGreen,
  },
  RENTING: {
    label: 'Đang thuê',
    description: 'Thiết bị đang ở phía khách hàng trong thời gian thuê.',
    icon: IconCamera,
    className: chartTeal,
  },
  RETURNED: {
    label: 'Đã trả máy',
    description: 'Khách đã trả máy và đơn đang chờ kiểm tra, quyết toán.',
    icon: IconPackageImport,
    className: chartLime,
  },
  DONE: {
    label: 'Hoàn tất',
    description: 'Đơn đã hoàn tất toàn bộ quy trình và nghĩa vụ tài chính.',
    icon: IconCheck,
    className: chartGreen,
  },
  CANCELLED: {
    label: 'Đã hủy',
    description: 'Đơn đã bị hủy và không còn hiệu lực giữ thiết bị.',
    icon: IconBan,
    className: neutral,
  },
  DISPUTED: {
    label: 'Tranh chấp',
    description: 'Đơn cần được xử lý thủ công do phát sinh tranh chấp.',
    icon: IconAlertTriangle,
    className: danger,
  },
} satisfies Record<RentalOrderStatus, RentalStatusDisplayConfig>;

export const settlementStatusConfig = {
  NOT_STARTED: {
    label: 'Chưa quyết toán',
    description: 'Chưa phát sinh bước quyết toán cuối đơn.',
    icon: IconClock,
    className: neutral,
  },
  PAYMENT_DUE: {
    label: 'Cần thu thêm',
    description: 'Khách còn nghĩa vụ thanh toán trước hoặc sau khi trả máy.',
    icon: IconCreditCard,
    className: danger,
  },
  REFUND_DUE: {
    label: 'Cần hoàn tiền',
    description: 'Đơn đang có khoản tiền cần hoàn lại cho khách hàng.',
    icon: IconRefresh,
    className: chartAmber,
  },
  SETTLED: {
    label: 'Đã quyết toán',
    description: 'Các khoản thu, hoàn và phí phát sinh đã được chốt.',
    icon: IconCircleCheck,
    className: chartGreen,
  },
  DISPUTED: {
    label: 'Tranh chấp',
    description: 'Khoản quyết toán đang cần nhân viên xử lý thủ công.',
    icon: IconAlertTriangle,
    className: danger,
  },
} satisfies Record<RentalSettlementStatus, RentalStatusDisplayConfig>;

export const handoverStatusConfig = {
  PENDING_PAYMENT: {
    label: 'Chờ thanh toán',
    description: 'Chưa đủ điều kiện tài chính để bàn giao thiết bị.',
    icon: IconClock,
    className: chartAmber,
  },
  READY: {
    label: 'Sẵn sàng bàn giao',
    description: 'Đã đủ điều kiện để thực hiện bàn giao thiết bị.',
    icon: IconCircleCheck,
    className: chartGreen,
  },
  HANDED_OVER: {
    label: 'Đã bàn giao',
    description: 'Thiết bị đã được bàn giao cho khách hàng.',
    icon: IconPackage,
    className: chartTeal,
  },
} satisfies Record<HandoverStatus, RentalStatusDisplayConfig>;

export const returnStatusConfig = {
  NOT_RETURNED: {
    label: 'Chưa trả máy',
    description: 'Thiết bị chưa được ghi nhận trả về kho.',
    icon: IconClock,
    className: neutral,
  },
  RETURNED: {
    label: 'Chờ kiểm tra',
    description: 'Đã nhận máy và đang chờ nhân viên kiểm tra tình trạng.',
    icon: IconPackageImport,
    className: chartAmber,
  },
  INSPECTED: {
    label: 'Đã kiểm tra',
    description: 'Tình trạng thiết bị sau khi trả đã được ghi nhận.',
    icon: IconCheck,
    className: chartGreen,
  },
} satisfies Record<ReturnStatus, RentalStatusDisplayConfig>;

export const rentalOrderScheduleBadgeConfig = {
  STARTING_SOON: {
    label: 'Sắp nhận máy',
    description: 'Thời điểm bắt đầu thuê đang đến gần.',
    icon: IconClock,
    className: chartAmber,
  },
  START_OVERDUE: {
    label: 'Quá giờ nhận',
    description: 'Đã quá thời điểm dự kiến nhận máy.',
    icon: IconAlertTriangle,
    className: danger,
  },
  RETURNING_SOON: {
    label: 'Sắp đến giờ trả',
    description: 'Thời điểm kết thúc thuê đang đến gần.',
    icon: IconClock,
    className: chartAmber,
  },
  RETURN_OVERDUE: {
    label: 'Quá hạn trả',
    description: 'Đã quá thời điểm dự kiến trả máy.',
    icon: IconAlertTriangle,
    className: danger,
  },
} satisfies Record<RentalOrderScheduleBadge['kind'], RentalStatusDisplayConfig>;

export const rentalOrderAllocationStatusConfig = {
  REQUESTED: {
    label: 'Đang yêu cầu',
    description: 'Đang chờ hệ thống hoặc nhân viên phân bổ thiết bị.',
    icon: IconClock,
    className: chartBlue,
  },
  RESERVED: {
    label: 'Đã giữ máy',
    description: 'Thiết bị đã được giữ cho khoảng thời gian của đơn.',
    icon: IconCircleCheck,
    className: chartGreen,
  },
  HANDED_OVER: {
    label: 'Đã bàn giao',
    description: 'Thiết bị đã được giao cho khách hàng.',
    icon: IconPackage,
    className: chartTeal,
  },
  RETURNED: {
    label: 'Đã trả',
    description: 'Thiết bị đã được trả về.',
    icon: IconPackageImport,
    className: chartLime,
  },
  RELEASED: {
    label: 'Đã giải phóng',
    description: 'Lượt giữ thiết bị đã được giải phóng.',
    icon: IconX,
    className: neutral,
  },
} satisfies Record<RentalOrderAllocation['status'], RentalStatusDisplayConfig>;

export const rentalOrderPaymentStatusConfig = {
  PENDING: {
    label: 'Chờ xác nhận',
    description: 'Giao dịch đang chờ được xác nhận.',
    icon: IconClock,
    className: chartAmber,
  },
  SUCCESS: {
    label: 'Thành công',
    description: 'Giao dịch đã được ghi nhận thành công.',
    icon: IconCircleCheck,
    className: chartGreen,
  },
  FAILED: {
    label: 'Thất bại',
    description: 'Giao dịch không được ghi nhận thành công.',
    icon: IconX,
    className: danger,
  },
  CANCELLED: {
    label: 'Đã hủy',
    description: 'Giao dịch đã bị hủy.',
    icon: IconBan,
    className: neutral,
  },
} satisfies Record<PaymentTransactionStatus, RentalStatusDisplayConfig>;

export const rentalOrderRefundStatusConfig = {
  PENDING: {
    label: 'Chờ xử lý',
    description: 'Yêu cầu hoàn tiền đang chờ xử lý.',
    icon: IconClock,
    className: chartAmber,
  },
  PROCESSING: {
    label: 'Đang xử lý',
    description: 'Yêu cầu hoàn tiền đang được thực hiện.',
    icon: IconRefresh,
    className: chartBlue,
  },
  REFUNDED: {
    label: 'Đã hoàn',
    description: 'Khoản tiền đã được hoàn cho khách hàng.',
    icon: IconCircleCheck,
    className: chartGreen,
  },
  FAILED: {
    label: 'Hoàn thất bại',
    description: 'Yêu cầu hoàn tiền chưa thực hiện thành công.',
    icon: IconX,
    className: danger,
  },
} satisfies Record<RentalRefundStatus, RentalStatusDisplayConfig>;

export const rentalInspectionConditionConfig = {
  GOOD: {
    label: 'Tốt',
    description: 'Thiết bị không ghi nhận hư hỏng.',
    icon: IconCheck,
    className: chartGreen,
  },
  DAMAGED: {
    label: 'Hư hỏng',
    description: 'Thiết bị có hư hỏng cần ghi nhận hoặc xử lý.',
    icon: IconAlertTriangle,
    className: danger,
  },
  MISSING: {
    label: 'Mất máy',
    description: 'Không tìm thấy thiết bị khi kiểm tra.',
    icon: IconX,
    className: danger,
  },
  NEEDS_MAINTENANCE: {
    label: 'Cần bảo trì',
    description: 'Thiết bị cần được bảo trì trước khi cho thuê tiếp.',
    icon: IconTool,
    className: chartAmber,
  },
} satisfies Record<RentalInspectionCondition, RentalStatusDisplayConfig>;

export const orderStatusOptions = toOptions(orderStatusConfig);
export const settlementStatusOptions = toOptions(settlementStatusConfig);
