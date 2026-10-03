import {
  IconAlertTriangle,
  IconCalendarEvent,
  IconCash,
  IconChartBar,
  IconClock,
  IconCreditCard,
  IconPackage,
  IconPackageExport,
  IconRefresh,
  IconTool,
} from '@tabler/icons-react';
import { orderStatusConfig, rentalOrderStatusVisualConfig } from '@/modules/rental-orders/display-config';
import type {
  DashboardAttentionPriority,
  DashboardAttentionType,
  DashboardAvailabilityMetricKey,
  DashboardSummaryMetricKey,
} from './model';

type DashboardDisplayConfig = {
  label: string;
  description: string;
  icon: typeof IconChartBar;
  className: string;
};

export const dashboardSummaryMetricConfig = {
  totalOrders: {
    label: 'Đơn trong kỳ',
    description: 'Đơn có thời gian thuê giao với khoảng đang xem.',
    icon: IconPackage,
    className: 'bg-chart-4/10 text-chart-4',
  },
  attentionOrders: {
    label: 'Cần xử lý',
    description: 'Đơn đang có bước vận hành hoặc tài chính cần thao tác.',
    icon: IconAlertTriangle,
    className: 'bg-chart-5/10 text-chart-5',
  },
  pickupDue: {
    label: 'Sắp nhận máy',
    description: 'Đơn có lịch nhận trong khoảng xem nhưng chưa bàn giao.',
    icon: IconPackageExport,
    className: 'bg-chart-2/10 text-chart-2',
  },
  returnDue: {
    label: 'Sắp trả máy',
    description: 'Đơn có lịch trả trong khoảng xem nhưng chưa kiểm tra xong.',
    icon: IconCalendarEvent,
    className: 'bg-chart-3/10 text-chart-3',
  },
  overdueReturns: {
    label: 'Quá hạn trả',
    description: 'Đơn đang thuê đã quá giờ trả và chưa ghi nhận trả máy.',
    icon: IconClock,
    className: 'bg-destructive/10 text-destructive',
  },
  refundDueOrders: {
    label: 'Cần hoàn tiền',
    description: 'Đơn còn nghĩa vụ hoàn tiền cho khách hàng.',
    icon: IconRefresh,
    className: 'bg-chart-5/10 text-chart-5',
  },
} satisfies Record<DashboardSummaryMetricKey, DashboardDisplayConfig>;

export const dashboardAvailabilityMetricConfig = {
  totalAssets: {
    label: 'Tổng thiết bị',
    description: 'Tổng số máy đang có trong kho.',
    icon: IconPackage,
    className: 'bg-chart-4/10 text-chart-4',
  },
  scheduledAssets: {
    label: 'Đang có lịch',
    description: 'Có allocation giao nhau với khoảng đang xem.',
    icon: IconCalendarEvent,
    className: 'bg-chart-2/10 text-chart-2',
  },
  freeAssets: {
    label: 'Trống theo lịch',
    description: 'Không có lịch giao nhau; chưa xét tình trạng máy.',
    icon: IconCash,
    className: 'bg-chart-1/10 text-chart-1',
  },
  unavailableAssets: {
    label: 'Không khả dụng',
    description: 'Máy tắt, bảo trì, mất hoặc không ở trạng thái sẵn sàng.',
    icon: IconAlertTriangle,
    className: 'bg-destructive/10 text-destructive',
  },
  maintenanceAssets: {
    label: 'Bảo trì',
    description: 'Thiết bị đang ở trạng thái bảo trì.',
    icon: IconTool,
    className: 'bg-chart-5/10 text-chart-5',
  },
  lostAssets: {
    label: 'Mất',
    description: 'Thiết bị được đánh dấu mất.',
    icon: IconAlertTriangle,
    className: 'bg-destructive/10 text-destructive',
  },
  damagedAssets: {
    label: 'Hư hỏng',
    description: 'Thiết bị có tình trạng hư hỏng.',
    icon: IconTool,
    className: 'bg-chart-5/10 text-chart-5',
  },
} satisfies Record<DashboardAvailabilityMetricKey, DashboardDisplayConfig>;

export const dashboardFinancialMetricConfig = {
  rentalRevenue: { label: 'Tiền thuê', description: 'Tổng tiền thuê theo snapshot đơn.', color: 'var(--chart-1)' },
  deliveryRevenue: { label: 'Phí giao', description: 'Tổng phí giao nhận theo snapshot đơn.', color: 'var(--chart-2)' },
  collectedTotal: { label: 'Đã thu', description: 'Tổng tiền đã thu; không đồng nghĩa với doanh thu.', color: 'var(--chart-4)' },
  depositHeldTotal: { label: 'Tiền cọc đang giữ', description: 'Tiền cọc ước tính còn đang giữ.', color: 'var(--chart-3)' },
  amountDueBeforeHandover: { label: 'Còn phải thu trước bàn giao', description: 'Khoản khách còn phải thanh toán trước khi giao máy.', color: 'var(--chart-5)' },
  refundDueTotal: { label: 'Cần hoàn tiền', description: 'Nghĩa vụ hoàn tiền theo snapshot đơn.', color: 'var(--chart-5)' },
  pendingRefundTotal: { label: 'Hoàn tiền đang xử lý', description: 'Yêu cầu hoàn chưa được xác nhận hoàn tất.', color: 'var(--chart-2)' },
  damageCompensationTotal: { label: 'Bồi thường hư hỏng', description: 'Khoản bồi thường tính cho khách.', color: 'var(--chart-5)' },
  repairCostTotal: { label: 'Chi phí sửa chữa', description: 'Chưa có module ghi nhận chi phí sửa chữa thực tế.', color: 'var(--muted-foreground)' },
} as const;

export const dashboardAttentionConfig = {
  PAYMENT_CONFIRMATION: {
    label: 'Xác nhận thanh toán',
    description: 'Có thanh toán hoặc khoản cần thu đang chờ xử lý.',
    icon: IconCreditCard,
    className: 'border-chart-5/40 bg-chart-5/10 text-chart-5',
  },
  PICKUP_DUE: {
    label: 'Sắp nhận máy',
    description: 'Đơn sắp đến thời điểm nhận máy.',
    icon: IconPackageExport,
    className: rentalOrderStatusVisualConfig.CONFIRMED.className,
  },
  RETURN_DUE: {
    label: 'Sắp trả máy',
    description: 'Đơn sắp đến thời điểm trả máy.',
    icon: IconCalendarEvent,
    className: rentalOrderStatusVisualConfig.RETURNED.className,
  },
  OVERDUE_RETURN: {
    label: 'Quá hạn trả',
    description: 'Đơn đã quá hạn trả máy.',
    icon: IconAlertTriangle,
    className: 'border-destructive/35 bg-destructive/10 text-destructive',
  },
  REFUND_PENDING: {
    label: 'Hoàn tiền',
    description: 'Đơn còn nghĩa vụ hoàn hoặc đang chờ xác nhận hoàn.',
    icon: IconRefresh,
    className: 'border-chart-5/40 bg-chart-5/10 text-chart-5',
  },
  DISPUTE: {
    label: 'Tranh chấp',
    description: 'Đơn cần nhân viên xử lý thủ công.',
    icon: IconAlertTriangle,
    className: orderStatusConfig.DISPUTED.className,
  },
} satisfies Record<DashboardAttentionType, DashboardDisplayConfig>;

export const dashboardPriorityConfig = {
  HIGH: { label: 'Ưu tiên cao', className: 'border-destructive/35 bg-destructive/10 text-destructive' },
  MEDIUM: { label: 'Cần theo dõi', className: 'border-chart-5/40 bg-chart-5/10 text-chart-5' },
  LOW: { label: 'Theo dõi', className: 'border-muted-foreground/25 bg-muted text-muted-foreground' },
} satisfies Record<DashboardAttentionPriority, { label: string; className: string }>;

export const dashboardScheduleConfig = {
  PICKUP: { label: 'Nhận máy', icon: IconPackageExport, className: 'text-chart-2' },
  RETURN: { label: 'Trả máy', icon: IconPackage, className: 'text-chart-3' },
} as const;

export const dashboardTrendConfig = {
  rentalRevenue: { label: 'Tiền thuê', color: 'var(--color-rentalRevenue)' },
  deliveryRevenue: { label: 'Phí giao', color: 'var(--color-deliveryRevenue)' },
  collectedTotal: { label: 'Đã thu', color: 'var(--color-collectedTotal)' },
} as const;
