import type { DateTimeRange } from '@/components/shared/date-time-range-picker';
import type { IAvailabilityAsset } from '@/modules/availability/type';
import type { ICreateRentalOrderInput } from './schema';
import type {
  ICheckRentalOrderAvailabilityReq,
  ICreateRentalOrderReq,
  IRentalOrderListItemOut,
  CollateralType,
  OrderLineDraft,
  OrderStatus,
  RentalOrderScheduleBadge,
} from './type';

type RentalOrderFinancialBase = {
  status: OrderStatus;
  bookingHoldTotal: number;
  depositTotal: number;
  chargeTotal: number;
  paidTotal: number;
  rentalFeeTotal?: number;
  deliveryFeeTotal?: number;
  discountTotal?: number;
  lateFeeTotal?: number;
  damageFeeTotal?: number;
  compensationFeeTotal?: number;
  actualRefundTotal?: number;
  finalPayableTotal?: number;
  refundDue?: number;
  additionalChargeDue?: number;
  handoverRequiredTotal?: number;
  handoverAmountDue?: number;
};

export type EstimatedPricingLine = Omit<OrderLineDraft, 'depositAmount'> & {
  rentalSubtotal: number;
  depositAmount: number;
  lineTotal: number;
};

export type RentalOrderPricingTotals = {
  rentalSubtotal: number;
  originalDepositTotal: number;
  depositTotal: number;
  netRental: number;
  estimatedRefund: number;
  bookingHoldTotal: number;
  handoverRequiredTotal: number;
};

const HOURS_PER_DAY = 24;
const MIN_HALF_DAY_HOURS = 6;
const FULL_DAY_THRESHOLD_HOURS = 12;
const EPSILON = 0.000001;

const toAmount = (value: number | undefined) => Number(value) || 0;

export type RentalOrderActionAvailability = 'allowed' | 'disabled' | 'hidden';

export type RentalOrderActionKey =
  | 'view'
  | 'updateCustomerSnapshot'
  | 'updateStartDate'
  | 'updateEndDate'
  | 'upsellItem'
  | 'downsellItem'
  | 'collectBookingHold'
  | 'handover'
  | 'complete'
  | 'dispute'
  | 'cancel'
  | 'recordPayment'
  | 'refund'
  | 'delete';

export type RentalOrderActionPermissions = Record<RentalOrderActionKey, RentalOrderActionAvailability>;

const terminalStatuses: OrderStatus[] = ['DONE', 'CANCELLED', 'DISPUTED'];

const rentalOrderActionMatrix = {
  CREATED: {
    view: 'allowed',
    updateCustomerSnapshot: 'allowed',
    updateStartDate: 'allowed',
    updateEndDate: 'allowed',
    upsellItem: 'allowed',
    downsellItem: 'allowed',
    collectBookingHold: 'allowed',
    handover: 'allowed',
    complete: 'hidden',
    dispute: 'hidden',
    cancel: 'allowed',
    recordPayment: 'allowed',
    refund: 'hidden',
    delete: 'allowed',
  },
  CONFIRMED: {
    view: 'allowed',
    updateCustomerSnapshot: 'allowed',
    updateStartDate: 'allowed',
    updateEndDate: 'allowed',
    upsellItem: 'allowed',
    downsellItem: 'allowed',
    collectBookingHold: 'hidden',
    handover: 'allowed',
    complete: 'hidden',
    dispute: 'hidden',
    cancel: 'allowed',
    recordPayment: 'allowed',
    refund: 'hidden',
    delete: 'hidden',
  },
  RENTING: {
    view: 'allowed',
    updateCustomerSnapshot: 'allowed',
    updateStartDate: 'disabled',
    updateEndDate: 'allowed',
    upsellItem: 'allowed',
    downsellItem: 'disabled',
    collectBookingHold: 'hidden',
    handover: 'hidden',
    complete: 'allowed',
    dispute: 'allowed',
    cancel: 'disabled',
    recordPayment: 'allowed',
    refund: 'hidden',
    delete: 'hidden',
  },
  RETURNED: {
    view: 'allowed',
    updateCustomerSnapshot: 'disabled',
    updateStartDate: 'disabled',
    updateEndDate: 'disabled',
    upsellItem: 'disabled',
    downsellItem: 'disabled',
    collectBookingHold: 'hidden',
    handover: 'hidden',
    complete: 'allowed',
    dispute: 'hidden',
    cancel: 'hidden',
    recordPayment: 'allowed',
    refund: 'hidden',
    delete: 'hidden',
  },
  DONE: {
    view: 'allowed',
    updateCustomerSnapshot: 'disabled',
    updateStartDate: 'disabled',
    updateEndDate: 'disabled',
    upsellItem: 'disabled',
    downsellItem: 'disabled',
    collectBookingHold: 'hidden',
    handover: 'hidden',
    complete: 'hidden',
    dispute: 'hidden',
    cancel: 'hidden',
    recordPayment: 'allowed',
    refund: 'allowed',
    delete: 'hidden',
  },
  CANCELLED: {
    view: 'allowed',
    updateCustomerSnapshot: 'disabled',
    updateStartDate: 'disabled',
    updateEndDate: 'disabled',
    upsellItem: 'disabled',
    downsellItem: 'disabled',
    collectBookingHold: 'hidden',
    handover: 'hidden',
    complete: 'hidden',
    dispute: 'hidden',
    cancel: 'hidden',
    recordPayment: 'hidden',
    refund: 'allowed',
    delete: 'allowed',
  },
  DISPUTED: {
    view: 'allowed',
    updateCustomerSnapshot: 'disabled',
    updateStartDate: 'disabled',
    updateEndDate: 'disabled',
    upsellItem: 'disabled',
    downsellItem: 'disabled',
    collectBookingHold: 'hidden',
    handover: 'hidden',
    complete: 'hidden',
    dispute: 'hidden',
    cancel: 'hidden',
    recordPayment: 'disabled',
    refund: 'disabled',
    delete: 'hidden',
  },
} satisfies Record<OrderStatus, RentalOrderActionPermissions>;

export function getRentalOrderActionPermissions(status: OrderStatus): RentalOrderActionPermissions {
  return rentalOrderActionMatrix[status];
}

export function canUseRentalOrderAction(status: OrderStatus, action: RentalOrderActionKey) {
  return getRentalOrderActionPermissions(status)[action] === 'allowed';
}

export function shouldShowRentalOrderAction(status: OrderStatus, action: RentalOrderActionKey) {
  return getRentalOrderActionPermissions(status)[action] !== 'hidden';
}

export function isRentalOrderTerminalStatus(status: OrderStatus) {
  return terminalStatuses.includes(status);
}

export type RentalOrderScheduleAlertStatus = 'UPCOMING' | 'DUE_SOON' | 'PICKUP_OVERDUE';

export function getRentalOrderScheduleAlert(order: Pick<IRentalOrderListItemOut, 'status' | 'startDate'>) {
  if (order.status !== 'CREATED' && order.status !== 'CONFIRMED') return null;

  const startTime = new Date(order.startDate).getTime();
  if (Number.isNaN(startTime)) return null;

  const diffMinutes = Math.floor((startTime - Date.now()) / (60 * 1000));
  const absMinutes = Math.abs(diffMinutes);
  const hours = Math.floor(absMinutes / 60);
  const minutes = absMinutes % 60;
  const durationLabel = hours > 0 ? `${hours} giờ${minutes > 0 ? ` ${minutes} phút` : ''}` : `${minutes} phút`;

  if (diffMinutes < 0) {
    return {
      status: 'PICKUP_OVERDUE',
      label: `Quá giờ nhận ${durationLabel}`,
      className: 'border-destructive/30 bg-destructive/10 text-destructive',
    } as const;
  }

  if (diffMinutes <= 120) {
    return {
      status: 'DUE_SOON',
      label: `Gần giờ giao còn ${durationLabel}`,
      className: 'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300',
    } as const;
  }

  if (diffMinutes <= 1440) {
    return {
      status: 'UPCOMING',
      label: `Sắp giao trong ${durationLabel}`,
      className: 'border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-300',
    } as const;
  }

  return null;
}

type RentalOrderScheduleBadgeOptions = {
  now?: Date;
  pickupSoonMinutes?: number;
  returnSoonMinutes?: number;
  maxLateReturnTimeHours?: number;
};

export function getRentalOrderScheduleBadges(
  order: Pick<IRentalOrderListItemOut, 'status' | 'startDate' | 'endDate'>,
  options: RentalOrderScheduleBadgeOptions = {},
): RentalOrderScheduleBadge[] {
  const nowTime = options.now?.getTime() ?? Date.now();
  const pickupSoonMinutes = options.pickupSoonMinutes ?? 120;
  const returnSoonMinutes = options.returnSoonMinutes ?? 120;
  const maxLateReturnTimeHours = options.maxLateReturnTimeHours ?? 6;
  const startTime = new Date(order.startDate).getTime();
  const endTime = new Date(order.endDate).getTime();

  if (order.status === 'CREATED' || order.status === 'CONFIRMED') {
    if (Number.isNaN(startTime)) return [];

    const pickupDiffMinutes = Math.floor((startTime - nowTime) / (60 * 1000));
    if (pickupDiffMinutes < 0) return ['PICKUP_OVERDUE'];
    if (pickupDiffMinutes <= pickupSoonMinutes) return ['PICKUP_DUE_SOON'];
    return ['PICKUP_UPCOMING'];
  }

  if (order.status === 'RENTING') {
    if (Number.isNaN(endTime)) return [];

    const returnDiffMinutes = Math.floor((endTime - nowTime) / (60 * 1000));
    const graceEndTime = endTime + maxLateReturnTimeHours * 60 * 60 * 1000;

    if (nowTime > graceEndTime) return ['RETURN_LATE_OVER_GRACE'];
    if (returnDiffMinutes < 0) return ['RETURN_LATE'];
    if (returnDiffMinutes <= returnSoonMinutes) return ['RETURN_DUE_SOON'];
  }

  return [];
}

export function calculateAmountDueAtHandover(order: RentalOrderFinancialBase) {
  if (toAmount(order.handoverRequiredTotal) > 0) {
    return Math.max(toAmount(order.handoverRequiredTotal) - toAmount(order.paidTotal), 0);
  }
  if (toAmount(order.handoverAmountDue) > 0) return toAmount(order.handoverAmountDue);

  return Math.max(toAmount(order.depositTotal) - toAmount(order.paidTotal), 0);
}

export function calculateRentalOrderSettlementFinancials(
  order: Pick<
    RentalOrderFinancialBase,
    | 'rentalFeeTotal'
    | 'deliveryFeeTotal'
    | 'discountTotal'
    | 'lateFeeTotal'
    | 'damageFeeTotal'
    | 'compensationFeeTotal'
    | 'paidTotal'
    | 'actualRefundTotal'
    | 'finalPayableTotal'
    | 'refundDue'
    | 'additionalChargeDue'
  > &
    Partial<Pick<RentalOrderFinancialBase, 'status'>>,
) {
  const rentalRevenueTotal = Math.max(
    toAmount(order.rentalFeeTotal) + toAmount(order.deliveryFeeTotal) - toAmount(order.discountTotal),
    0,
  );
  const incidentFeeTotal = Math.max(
    toAmount(order.lateFeeTotal) + toAmount(order.damageFeeTotal) + toAmount(order.compensationFeeTotal),
    0,
  );
  const finalPayableTotal = toAmount(order.finalPayableTotal) || Math.max(rentalRevenueTotal + incidentFeeTotal, 0);
  const refundDue =
    typeof order.refundDue === 'number'
      ? toAmount(order.refundDue)
      : Math.max(toAmount(order.paidTotal) - finalPayableTotal - toAmount(order.actualRefundTotal), 0);
  const additionalChargeDue =
    typeof order.additionalChargeDue === 'number'
      ? toAmount(order.additionalChargeDue)
      : Math.max(finalPayableTotal + toAmount(order.actualRefundTotal) - toAmount(order.paidTotal), 0);

  return {
    rentalRevenueTotal,
    incidentFeeTotal,
    finalPayableTotal,
    refundDue,
    additionalChargeDue,
    settlementStatus: additionalChargeDue > 0 ? 'NEED_COLLECT' : refundDue > 0 ? 'NEED_REFUND' : 'SETTLED',
  } as const;
}

export function calculateProtectedDepositTotal(originalDepositTotal: number, chargeTotal: number) {
  return Math.round(Math.max(toAmount(originalDepositTotal), 0));
}

export function calculateHandoverRequiredTotal(
  depositTotal: number,
  chargeTotal: number,
  collateralType: CollateralType = 'NONE',
) {
  const rentalCharge = Math.max(toAmount(chargeTotal), 0);
  const baseDepositTotal = Math.max(toAmount(depositTotal), 0);
  const adjustedDepositTotal =
    collateralType === 'VEHICLE_OR_HIGH_VALUE' || collateralType === 'OTHER_ASSET'
      ? 0
      : collateralType === 'IDENTITY_CARD'
        ? baseDepositTotal / 2
        : baseDepositTotal;
  const handoverRequiredTotal =
    collateralType === 'NONE' && adjustedDepositTotal / 2 >= rentalCharge
      ? adjustedDepositTotal
      : rentalCharge + adjustedDepositTotal;

  return {
    adjustedDepositTotal: Math.round(adjustedDepositTotal),
    handoverRequiredTotal: Math.round(handoverRequiredTotal),
    estimatedRefund: Math.max(Math.round(handoverRequiredTotal) - rentalCharge, 0),
  };
}

export function calculateAmountDueNow(order: RentalOrderFinancialBase) {
  const paidTotal = toAmount(order.paidTotal);

  if (order.status === 'CANCELLED') {
    return 0;
  }

  if (order.status === 'CREATED') {
    return Math.max(toAmount(order.bookingHoldTotal) - paidTotal, 0);
  }

  if (order.status === 'RETURNED') {
    return Math.max(toAmount(order.chargeTotal) - paidTotal, 0);
  }

  if (order.status === 'DONE') {
    return calculateRentalOrderSettlementFinancials(order).additionalChargeDue;
  }

  const handoverRequiredTotal = toAmount(order.handoverRequiredTotal);
  if (handoverRequiredTotal > 0) {
    return Math.max(handoverRequiredTotal - paidTotal, 0);
  }

  return Math.max(toAmount(order.depositTotal) - paidTotal, 0);
}

export function calculateRefundDue(
  order: Pick<
    IRentalOrderListItemOut,
    | 'estimatedRefundTotal'
    | 'actualRefundTotal'
    | 'paidTotal'
    | 'refundDue'
    | 'rentalFeeTotal'
    | 'deliveryFeeTotal'
    | 'discountTotal'
    | 'lateFeeTotal'
    | 'damageFeeTotal'
    | 'compensationFeeTotal'
    | 'finalPayableTotal'
  >,
) {
  if (typeof order.refundDue === 'number') return Math.max(order.refundDue, 0);

  const settlement = calculateRentalOrderSettlementFinancials(order);
  if (settlement.refundDue > 0) return settlement.refundDue;

  const refundableBase = Math.min(toAmount(order.estimatedRefundTotal), toAmount(order.paidTotal));
  return Math.max(refundableBase - toAmount(order.actualRefundTotal), 0);
}

export function calculateOrderOutstandingAmount(order: IRentalOrderListItemOut) {
  if (order.status === 'CANCELLED' || order.status === 'DISPUTED') return 0;

  if (order.status === 'DONE') {
    return calculateRentalOrderSettlementFinancials(order).additionalChargeDue;
  }

  if (order.status === 'CREATED') {
    return Math.max(toAmount(order.bookingHoldTotal) - toAmount(order.paidTotal), 0);
  }

  if (order.status === 'CONFIRMED' || order.status === 'RENTING') {
    return calculateAmountDueAtHandover(order);
  }

  if (order.status === 'RETURNED') {
    return Math.max(toAmount(order.chargeTotal) - toAmount(order.paidTotal), 0);
  }

  return calculateAmountDueNow(order);
}

export function calculateRecordPaymentDue(order: IRentalOrderListItemOut) {
  if (!canUseRentalOrderAction(order.status, 'recordPayment')) return 0;

  return calculateOrderOutstandingAmount(order);
}

export function shouldShowRecordPaymentAction(order: IRentalOrderListItemOut) {
  return shouldShowRentalOrderAction(order.status, 'recordPayment') && calculateRecordPaymentDue(order) > 0;
}

export function canUseRecordPaymentAction(order: IRentalOrderListItemOut) {
  return canUseRentalOrderAction(order.status, 'recordPayment') && calculateRecordPaymentDue(order) > 0;
}

export function shouldShowRefundAction(order: IRentalOrderListItemOut) {
  return shouldShowRentalOrderAction(order.status, 'refund') && calculateRefundDue(order) > 0;
}

export function canUseRefundAction(order: IRentalOrderListItemOut) {
  return canUseRentalOrderAction(order.status, 'refund') && calculateRefundDue(order) > 0;
}



export const toInputDateTime = (date: Date | undefined) => (date ? date.toISOString() : '');

export const normalizeOptional = (value: string) => value.trim() || undefined;

export function rentalScheduleHasPositiveDuration(from: Date | undefined, to: Date | undefined): boolean {
  if (!from || !to) return false;
  return to.getTime() > from.getTime();
}

const getTierDailyPrice = (line: OrderLineDraft, days: number) => {
  const tier = line.rentalPriceTiers.find((priceTier) => {
    const maxDays = priceTier.maxDays ?? Number.POSITIVE_INFINITY;
    return priceTier.minDays <= days && days <= maxDays;
  });

  return tier?.dailyPrice ?? line.dailyPrice;
};

export const calculateRentalUnitPrice = (line: OrderLineDraft, startDate?: Date, endDate?: Date) => {
  if (!startDate || !endDate || startDate >= endDate) return 0;

  const durationHours = (endDate.getTime() - startDate.getTime()) / (60 * 60 * 1000);
  const halfDayPrice = line.halfDayPrice;
  const hourlyOveragePrice = line.hourlyOveragePrice ?? 0;
  const getPartialDayPrice = (hours: number) => {
    if (hours <= EPSILON) return 0;
    if (hours <= MIN_HALF_DAY_HOURS + EPSILON) return halfDayPrice;
    if (hours < FULL_DAY_THRESHOLD_HOURS - EPSILON) {
      return halfDayPrice + (hours - MIN_HALF_DAY_HOURS) * hourlyOveragePrice;
    }
    return getTierDailyPrice(line, 1);
  };

  if (durationHours < HOURS_PER_DAY - EPSILON) return Math.round(getPartialDayPrice(durationHours));

  const fullDays = Math.floor((durationHours + EPSILON) / HOURS_PER_DAY);
  const remainingHours = Math.max(0, durationHours - fullDays * HOURS_PER_DAY);
  if (remainingHours >= FULL_DAY_THRESHOLD_HOURS - EPSILON) {
    const billableDays = fullDays + 1;
    return Math.round(billableDays * getTierDailyPrice(line, billableDays));
  }

  const dailyPrice = getTierDailyPrice(line, fullDays);
  const partialTotal =
    remainingHours <= MIN_HALF_DAY_HOURS + EPSILON
      ? remainingHours * hourlyOveragePrice
      : getPartialDayPrice(remainingHours);
  const rentalTotal = fullDays * dailyPrice + partialTotal;

  return Math.round(rentalTotal);
};

export const formatRentalDuration = (range: DateTimeRange) => {
  if (!range.from || !range.to || range.from >= range.to) return 'Chưa chọn thời gian';

  const totalMinutes = Math.round((range.to.getTime() - range.from.getTime()) / (60 * 1000));
  const days = Math.floor(totalMinutes / (24 * 60));
  const hours = Math.floor((totalMinutes % (24 * 60)) / 60);
  const minutes = totalMinutes % 60;
  const parts = [
    days ? `${days} ngày` : null,
    hours ? `${hours} giờ` : null,
    minutes ? `${minutes} phút` : null,
  ].filter(Boolean);

  return parts.join(' ') || '0 phút';
};

export const createLineId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `${Date.now()}-${Math.random()}`;
};

export const createOrderLineDraft = (asset: IAvailabilityAsset): OrderLineDraft => ({
  id: createLineId(),
  productId: asset.product.productId,
  productName: asset.product.name,
  sku: asset.product.sku,
  assetUnitId: asset.assetUnitId,
  serialNumber: asset.serialNumber,
  dailyPrice: asset.product.dailyPrice,
  halfDayPrice: asset.product.halfDayPrice,
  hourlyOveragePrice: asset.product.hourlyOveragePrice,
  depositAmount: asset.product.depositAmount,
  rentalPriceTiers: asset.product.rentalPriceTiers,
});

export const buildAvailabilityPayload = (
  lines: OrderLineDraft[],
  startDate: string,
  endDate: string,
): ICheckRentalOrderAvailabilityReq => ({
  startDate,
  endDate,
  items: Object.values(
    lines.reduce<Record<string, { productId: string; quantity: number; assetUnitIds: string[] }>>((result, line) => {
      const existing = result[line.productId] ?? {
        productId: line.productId,
        quantity: 0,
        assetUnitIds: [],
      };
      existing.quantity += 1;
      existing.assetUnitIds.push(line.assetUnitId);
      result[line.productId] = existing;
      return result;
    }, {}),
  ),
});

export const getEstimatedPricingLines = (lines: OrderLineDraft[], range: DateTimeRange): EstimatedPricingLine[] =>
  lines.map((line) => {
    const rentalSubtotal = calculateRentalUnitPrice(line, range.from, range.to);
    const depositAmount = line.depositAmount;

    return {
      ...line,
      rentalSubtotal,
      depositAmount,
      lineTotal: rentalSubtotal,
    };
  });

export const getRentalOrderPricingTotals = (
  pricingLines: EstimatedPricingLine[],
  discountTotal: number,
  bookingHoldAmountPerUnit: number,
  deliveryFeeTotal = 0,
): RentalOrderPricingTotals => {
  const rentalSubtotal = pricingLines.reduce((total, line) => total + line.rentalSubtotal, 0);
  const originalDepositTotal = pricingLines.reduce((total, line) => total + line.depositAmount, 0);
  const netRental = Math.max(rentalSubtotal + deliveryFeeTotal - discountTotal, 0);
  const depositTotal = calculateProtectedDepositTotal(originalDepositTotal, netRental);
  const handoverTotals = calculateHandoverRequiredTotal(depositTotal, netRental);
  const estimatedRefund = handoverTotals.estimatedRefund;
  const bookingHoldTotal = Math.min(pricingLines.length * bookingHoldAmountPerUnit, originalDepositTotal);

  return {
    rentalSubtotal,
    originalDepositTotal,
    depositTotal,
    netRental,
    estimatedRefund,
    bookingHoldTotal,
    handoverRequiredTotal: handoverTotals.handoverRequiredTotal,
  };
};

export const buildCreateRentalOrderPayload = ({
  values,
  startDate,
  endDate,
}: {
  values: ICreateRentalOrderInput;
  startDate: string;
  endDate: string;
}): ICreateRentalOrderReq => ({
  customerId: values.customerId,
  startDate,
  endDate,
  pickupMethod: values.pickupMethod,
  deliveryAddress: values.pickupMethod === 'DELIVERY' ? values.deliveryAddress.trim() : '',
  deliveryFeeTotal: values.pickupMethod === 'DELIVERY' ? values.deliveryFeeTotal : 0,
  discountTotal: values.discountTotal,
  note: normalizeOptional(values.note),
  internalNote: normalizeOptional(values.internalNote),
  items: values.items.map((line) => ({
    productId: line.productId,
    assetUnitId: line.assetUnitId,
    note: normalizeOptional(line.note ?? ''),
  })),
});
