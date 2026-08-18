import {
  IconAlertCircle,
  IconAlertTriangle,
  IconArrowBack,
  IconBan,
  IconBuildingStore,
  IconCalendarCheck,
  IconCamera,
  IconCheck,
  IconCircleCheck,
  IconCircleX,
  IconClock,
  IconCreditCard,
  IconPackage,
  IconPackageImport,
  IconTruckDelivery,
  IconX,
} from '@tabler/icons-react';
import { toOptions, type DisplayConfig } from '@/types/display-config';
import type {
  CollateralType,
  OrderStatus,
  PaymentKind,
  PaymentMethod,
  PaymentRecordStatus,
  PaymentStatus,
  PickupMethod,
  RentalOrderEditableLineFilter,
  RentalOrderEditableLineState,
  RentalOrderItemStatus,
} from './type';

type PickupMethodDisplayConfig = DisplayConfig & {
  address: string;
  badge: string;
  badgeColor: string;
};

export const orderStatusConfig = {
  CREATED: {
    label: 'Mới tạo',
    icon: IconClock,
    className: 'border-transparent bg-muted text-muted-foreground hover:bg-muted/80',
  },

  CONFIRMED: {
    label: 'Đã xác nhận',
    icon: IconCircleCheck,
    className: 'border-transparent bg-blue-500/10 text-blue-600 hover:bg-blue-500/15 dark:text-blue-400',
  },

  RENTING: {
    label: 'Đang thuê',
    icon: IconCamera,
    className: 'border-transparent bg-primary/10 text-primary hover:bg-primary/15',
  },

  OVERDUE: {
    label: 'Quá hạn',
    icon: IconAlertTriangle,
    className: 'border-transparent bg-destructive/10 text-destructive hover:bg-destructive/15',
  },

  RETURNED: {
    label: 'Đã trả',
    icon: IconPackageImport,
    className: 'border-transparent bg-sky-500/10 text-sky-600 hover:bg-sky-500/15 dark:text-sky-400',
  },

  DONE: {
    label: 'Hoàn tất',
    icon: IconCheck,
    className: 'border-transparent bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/15 dark:text-emerald-400',
  },

  CANCELLED: {
    label: 'Đã hủy',
    icon: IconX,
    className: 'border-transparent bg-muted text-muted-foreground hover:bg-muted/80',
  },

  DISPUTED: {
    label: 'Tranh chấp',
    icon: IconAlertCircle,
    className: 'border-transparent bg-amber-500/10 text-amber-600 hover:bg-amber-500/15 dark:text-amber-400',
  },
} satisfies Record<OrderStatus, DisplayConfig>;

export const paymentStatusConfig = {
  UNPAID: {
    label: 'Chưa thanh toán',
    icon: IconCircleX,
    className: 'border-destructive/20 bg-destructive/10 text-destructive hover:bg-destructive/15',
  },

  PARTIALLY_PAID: {
    label: 'Thanh toán một phần',
    icon: IconClock,
    className: 'border-amber-500/20 bg-amber-500/10 text-amber-600 hover:bg-amber-500/15 dark:text-amber-400',
  },

  PAID: {
    label: 'Đã thanh toán',
    icon: IconCircleCheck,
    className: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/15 dark:text-emerald-400',
  },
} satisfies Record<PaymentStatus, DisplayConfig>;

export const rentalOrderItemStatusConfig = {
  PENDING: {
    label: 'Chờ giữ lịch',
    icon: IconClock,
    className: 'border-transparent bg-zinc-500/10 text-zinc-600',
  },
  ACTIVE: {
    label: 'Đang giữ lịch',
    icon: IconCalendarCheck,
    className: 'border-transparent bg-blue-500/10 text-blue-600',
  },
  RETURNED: {
    label: 'Đã trả',
    icon: IconPackageImport,
    className: 'border-transparent bg-emerald-500/10 text-emerald-600',
  },
  CANCELLED: {
    label: 'Đã hủy',
    icon: IconX,
    className: 'border-transparent bg-rose-500/10 text-rose-600',
  },
} satisfies Record<RentalOrderItemStatus, DisplayConfig>;

export const pickupMethodConfig = {
  PICKUP_AT_STORE: {
    label: 'Nhận tại cửa hàng',
    icon: IconBuildingStore,
    address: '72 Âu Dương Lân',
    badge: 'Miễn phí',
    badgeColor: 'bg-green-50 py-0.5 px-2 text-green-700 dark:bg-green-950 dark:text-green-300',
  },
  DELIVERY: {
    label: 'Giao tận nơi',
    icon: IconTruckDelivery,
    address: 'Phí tính theo Grab/Bee',
    badge: 'Tính phí',
    badgeColor: 'bg-yellow-50 py-0.5 px-2 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300',
  },
} satisfies Record<PickupMethod, PickupMethodDisplayConfig>;

export const paymentKindConfig = {
  BOOKING_HOLD: {
    label: 'Giữ lịch',
    icon: IconClock,
  },
  DEPOSIT: {
    label: 'Tiền cọc',
    icon: IconCreditCard,
  },
  RENTAL_PAYMENT: {
    label: 'Tiền thuê',
    icon: IconCreditCard,
  },
  HANDOVER_PAYMENT: {
    label: 'Thanh toán lúc giao',
    icon: IconCreditCard,
  },
  ADDITIONAL_CHARGE: {
    label: 'Thu thêm',
    icon: IconPackage,
  },
  REFUND: {
    label: 'Hoàn tiền',
    icon: IconArrowBack,
  },
  OTHER: {
    label: 'Khác',
  },
} satisfies Record<PaymentKind, DisplayConfig>;

export const paymentMethodConfig = {
  CASH: { label: 'Tiền mặt' },
  BANK_TRANSFER: { label: 'Chuyển khoản' },
  CARD: { label: 'Thẻ' },
  E_WALLET: { label: 'Ví điện tử' },
  OTHER: { label: 'Khác' },
} satisfies Record<PaymentMethod, DisplayConfig>;

export const paymentRecordStatusConfig = {
  PENDING: {
    label: 'Chờ xử lý',
    icon: IconClock,
    className: 'bg-yellow-500/10 text-yellow-600',
  },
  SUCCESS: {
    label: 'Thành công',
    icon: IconCircleCheck,
    className: 'bg-emerald-500/10 text-emerald-600',
  },
  FAILED: {
    label: 'Thất bại',
    icon: IconCircleX,
    className: 'bg-rose-500/10 text-rose-600',
  },
  CANCELLED: {
    label: 'Đã hủy',
    icon: IconBan,
    className: 'bg-zinc-500/10 text-zinc-600',
  },
} satisfies Record<PaymentRecordStatus, DisplayConfig>;

export const collateralTypeConfig = {
  NONE: {
    label: 'Không thế chấp',
  },
  IDENTITY_CARD: {
    label: 'Giữ CCCD/CMND',
  },
  VEHICLE_OR_HIGH_VALUE: {
    label: 'Tài sản giá trị cao',
  },
  OTHER_ASSET: {
    label: 'Tài sản khác',
  },
} satisfies Record<CollateralType, DisplayConfig>;

export const rentalOrderEditableLineStateConfig = {
  UNCHANGED: {
    label: 'Đang thuê',
    className: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
  },
  ADDED: {
    label: 'Thêm mới',
    className: 'border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-300',
  },
  REMOVED: {
    label: 'Hủy khỏi đơn',
    className: 'border-destructive/30 bg-destructive/10 text-destructive',
  },
  CHANGED: {
    label: 'Đã chỉnh sửa',
    className: 'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300',
  },
} satisfies Record<RentalOrderEditableLineState, DisplayConfig>;

export const rentalOrderEditableLineFilterConfig = {
  ALL: {
    label: 'Tất cả',
    className: 'border-muted-foreground/20 bg-muted text-muted-foreground',
  },
  UNCHANGED: rentalOrderEditableLineStateConfig.UNCHANGED,
  ADDED: rentalOrderEditableLineStateConfig.ADDED,
  REMOVED: rentalOrderEditableLineStateConfig.REMOVED,
  CHANGED: rentalOrderEditableLineStateConfig.CHANGED,
} satisfies Record<RentalOrderEditableLineFilter, DisplayConfig>;

export const orderStatusOptions = toOptions(orderStatusConfig);
export const paymentStatusOptions = toOptions(paymentStatusConfig);
export const pickupMethodOptions = toOptions(pickupMethodConfig);
export const paymentKindOptions = toOptions(paymentKindConfig);
export const paymentMethodOptions = toOptions(paymentMethodConfig);
export const collateralTypeOptions = toOptions(collateralTypeConfig);
export const rentalOrderEditableLineFilterOptions = toOptions(rentalOrderEditableLineFilterConfig);
