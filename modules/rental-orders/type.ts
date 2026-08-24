import type { DefaultParamsRequest } from '@/types/api';

export type OrderStatus =
  | 'CREATED'
  | 'CONFIRMED'
  | 'RENTING'
  | 'RETURNED'
  | 'DONE'
  | 'CANCELLED'
  | 'DISPUTED';
export type RentalOrderItemStatus = 'PENDING' | 'ACTIVE' | 'RETURNED' | 'CANCELLED';
export type PaymentStatus = 'UNPAID' | 'PARTIALLY_PAID' | 'PAID';
export type RefundStatus = 'NOT_REQUIRED' | 'PARTIALLY_REFUNDED' | 'REFUNDED' | 'FAILED';
export type RentalOrderSettlementStatus = 'NEED_COLLECT' | 'NEED_REFUND' | 'SETTLED';
export type RentalOrderScheduleBadge =
  | 'PICKUP_UPCOMING'
  | 'PICKUP_DUE_SOON'
  | 'PICKUP_OVERDUE'
  | 'RETURN_DUE_SOON'
  | 'RETURN_LATE'
  | 'RETURN_LATE_OVER_GRACE';
export type OrderSource = 'ADMIN' | 'WEBSITE';
export type PickupMethod = 'PICKUP_AT_STORE' | 'DELIVERY';
export type CollateralType = 'NONE' | 'IDENTITY_CARD' | 'VEHICLE_OR_HIGH_VALUE' | 'OTHER_ASSET';
export type PaymentKind =
  | 'BOOKING_HOLD'
  | 'DEPOSIT'
  | 'RENTAL_PAYMENT'
  | 'HANDOVER_PAYMENT'
  | 'ADDITIONAL_CHARGE'
  | 'OTHER'
  | 'REFUND';
export type PaymentMethod = 'CASH' | 'BANK_TRANSFER' | 'CARD' | 'E_WALLET' | 'OTHER';
export type PaymentRecordStatus = 'PENDING' | 'SUCCESS' | 'FAILED' | 'CANCELLED';
export type RentalOrderLateFeePolicy = 'CHARGE' | 'WAIVE' | 'CUSTOM';

export interface IGetRentalOrdersParams extends DefaultParamsRequest {
  customerId?: string;
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  refundStatus?: RefundStatus;
  source?: OrderSource;
  pickupMethod?: PickupMethod;
  fromDate?: string;
  toDate?: string;
}

export interface IRentalOrderCustomer {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
}

export type RentalOrderCustomerSnapshot = {
  id?: string;
  code?: string | null;
  name?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  identityNumber?: string | null;
  socialContact?: string | null;
};

export type RentalOrderSettingsSnapshot = {
  id?: number;
  bookingHoldPricePerUnit?: string | number;
  bookingBufferTimeMinutes?: number;
  maxRentalTimeDays?: number;
  maxLateReturnTimeHours?: number;
};

export type RentalOrderPriceTierSnapshot = {
  id: string;
  minDays: number;
  maxDays: number | null;
  dailyPrice: number;
  name: string | null;
};

export type RentalOrderItemSnapshot = {
  product?: {
    id?: string;
    name?: string | null;
    sku?: string | null;
    dailyPrice?: number;
    halfDayPrice?: number;
    hourlyOveragePrice?: number | null;
    depositAmount?: number;
    rentalPriceTiers?: RentalOrderPriceTierSnapshot[];
  };
  assetUnit?: {
    id?: string;
    serialNumber?: string | null;
  };
  pricing?: {
    pricingMode?: string;
    pricingLabel?: string;
    durationHours?: number;
    billableDays?: number;
    billableHalfDays?: number;
    overageHours?: number;
    unitPrice?: number;
    depositAmount?: number;
    bookingHoldAmount?: number;
    lineTotal?: number;
    appliedTierId?: string | null;
    appliedTier?: RentalOrderPriceTierSnapshot | null;
  };
  rentalWindow?: {
    startDate?: string;
    endDate?: string;
    blockedEndDate?: string;
  };
};

export type RentalOrderRentalPeriod = {
  startDate: string;
  endDate: string;
  actualPickupDate?: string | null;
  actualReturnDate?: string | null;
  blockedEndDate?: string;
};

export type RentalOrderFulfillment = {
  pickupMethod: PickupMethod;
  deliveryAddress: string | null;
  collateralType: CollateralType;
  collateralDescription?: string | null;
};

export type RentalOrderFinancials = {
  deliveryFeeTotal: number;
  rentalFeeTotal: number;
  depositTotal: number;
  bookingHoldTotal: number;
  lateFeeTotal: number;
  damageFeeTotal: number;
  discountTotal: number;
  compensationFeeTotal: number;
  chargeTotal: number;
  paidTotal: number;
  estimatedRefundTotal: number;
  actualRefundTotal: number;
  adjustedDepositTotal: number;
  handoverRequiredTotal: number;
  handoverAmountDue: number;
  rentalRevenueTotal: number;
  incidentFeeTotal: number;
  finalPayableTotal: number;
  refundDue: number;
  additionalChargeDue: number;
  settlementStatus: RentalOrderSettlementStatus;
};

export type RentalOrderNotes = {
  customerNote: string | null;
  internalNote: string | null;
  cancelReason: string | null;
};

export type RentalOrderItemPricing = {
  pricingMode: string;
  pricingLabel: string;
  durationHours: number;
  billableDays: number;
  billableHalfDays: number;
  overageHours: number;
  unitPrice: number;
  depositAmount: number;
  bookingHoldAmount: number;
  lineTotal: number;
  appliedTierId: string | null;
  appliedTier: RentalOrderPriceTierSnapshot | null;
};

export interface IRentalOrderProduct {
  id: string;
  name: string;
  sku: string | null;
}

export interface IRentalOrderAssetUnit {
  id: string;
  serialNumber: string;
}

export interface IRentalOrderItem {
  id: string;
  productId: string;
  assetUnitId: string;
  product: IRentalOrderProduct;
  assetUnit: IRentalOrderAssetUnit;
  status: RentalOrderItemStatus;
  snapshot?: RentalOrderItemSnapshot | null;
  productSnapshot: RentalOrderItemSnapshot['product'];
  assetUnitSnapshot: NonNullable<RentalOrderItemSnapshot['assetUnit']>;
  rentalPeriod: RentalOrderRentalPeriod;
  pricing: RentalOrderItemPricing;
  unitPrice?: number;
  depositAmount?: number;
  bookingHoldAmount?: number;
  lineTotal?: number;
  startDate?: string;
  endDate?: string;
  blockedEndDate?: string;
  note: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface IRentalOrderPaymentRecord {
  id: string;
  kind: PaymentKind;
  method: PaymentMethod;
  status: PaymentRecordStatus;
  amount: number;
  referenceCode: string | null;
  note: string | null;
  createdAt: string;
}

export interface IRentalOrderStatusHistory {
  id: string;
  fromStatus: OrderStatus | null;
  toStatus: OrderStatus;
  note: string | null;
  createdAt: string;
}

export interface IRentalOrderLogChange {
  field: string;
  label: string;
  oldValue: unknown;
  newValue: unknown;
}

export interface IRentalOrderLogActorSnapshot {
  id?: string | null;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
}

export interface IRentalOrderLog {
  id: string;
  orderId: string;
  actorId: string | null;
  action: string;
  entity: string;
  changes: IRentalOrderLogChange[];
  actorSnapshot: IRentalOrderLogActorSnapshot | null;
  note: string | null;
  createdAt: string;
}

export interface IRentalOrderOut {
  id: string;
  code: string;
  source: OrderSource;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  refundStatus: RefundStatus;
  customerId: string;
  customer: IRentalOrderCustomer;
  customerSnapshot: RentalOrderCustomerSnapshot;
  settingsSnapshot: RentalOrderSettingsSnapshot;
  rentalPeriod: RentalOrderRentalPeriod;
  fulfillment: RentalOrderFulfillment;
  financials: RentalOrderFinancials;
  notes: RentalOrderNotes;
  startDate: string;
  endDate: string;
  actualPickupDate: string | null;
  actualReturnDate: string | null;
  pickupMethod: PickupMethod;
  deliveryAddress: string | null;
  deliveryFeeTotal: number;
  rentalFeeTotal: number;
  depositTotal: number;
  bookingHoldTotal: number;
  lateFeeTotal: number;
  damageFeeTotal: number;
  discountTotal: number;
  compensationFeeTotal: number;
  chargeTotal: number;
  paidTotal: number;
  estimatedRefundTotal: number;
  actualRefundTotal: number;
  adjustedDepositTotal: number;
  handoverRequiredTotal: number;
  handoverAmountDue: number;
  rentalRevenueTotal: number;
  incidentFeeTotal: number;
  finalPayableTotal: number;
  refundDue: number;
  additionalChargeDue: number;
  settlementStatus: RentalOrderSettlementStatus;
  note: string | null;
  internalNote: string | null;
  cancelReason: string | null;
  createdBy: string;
  items: IRentalOrderItem[];
  payments: IRentalOrderPaymentRecord[];
  statusHistories: IRentalOrderStatusHistory[];
  logs: IRentalOrderLog[];
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export type IRentalOrderListItemOut = Pick<
  IRentalOrderOut,
  | 'id'
  | 'code'
  | 'source'
  | 'status'
  | 'paymentStatus'
  | 'refundStatus'
  | 'customerSnapshot'
  | 'startDate'
  | 'endDate'
  | 'rentalFeeTotal'
  | 'deliveryFeeTotal'
  | 'depositTotal'
  | 'bookingHoldTotal'
  | 'chargeTotal'
  | 'paidTotal'
  | 'estimatedRefundTotal'
  | 'actualRefundTotal'
  | 'handoverRequiredTotal'
  | 'handoverAmountDue'
  | 'rentalRevenueTotal'
  | 'incidentFeeTotal'
  | 'finalPayableTotal'
  | 'refundDue'
  | 'additionalChargeDue'
  | 'settlementStatus'
  | 'discountTotal'
  | 'createdAt'
  | 'updatedAt'
  | 'lateFeeTotal'
  | 'damageFeeTotal'
  | 'compensationFeeTotal'
>;

export interface IRentalOrderCreateItemReq {
  productId: string;
  assetUnitId: string;
  note?: string;
}

export interface ICreateRentalOrderReq {
  customerId: string;
  startDate: string;
  endDate: string;
  pickupMethod: PickupMethod;
  deliveryAddress: string;
  deliveryFeeTotal?: number;
  discountTotal?: number;
  note?: string;
  internalNote?: string;
  items: IRentalOrderCreateItemReq[];
}

export interface IUpdateRentalOrderCustomerSnapshotReq {
  name?: string;
  phone?: string;
  email?: string;
  address?: string;
  identityNumber?: string;
  socialContact?: string;
}

export type IUpdateRentalOrderReq = Partial<ICreateRentalOrderReq> & {
  customerSnapshot?: IUpdateRentalOrderCustomerSnapshotReq;
};

export interface IDeleteRentalOrdersReq {
  rentalOrderIds: string[];
}

export interface IDeleteRentalOrdersOut {
  success: boolean;
}

export interface ICancelRentalOrderReq {
  cancelReason: string;
  refundBookingHold?: boolean;
  refundAmount?: number;
  keepPaidAmountAsPenalty?: boolean;
  note?: string;
}

export interface IHandoverRentalOrderPaymentReq {
  method: PaymentMethod;
  amount: number;
  referenceCode?: string;
  note?: string;
}

export interface IHandoverRentalOrderReq {
  actualPickupDate?: string;
  collateralType?: CollateralType;
  collateralDescription?: string;
  discountTotal?: number;
  payment?: IHandoverRentalOrderPaymentReq;
  note?: string;
}

export interface ICompleteRentalOrderSettlementPaymentReq {
  kind: Extract<PaymentKind, 'ADDITIONAL_CHARGE' | 'REFUND'>;
  method: PaymentMethod;
  amount: number;
  referenceCode?: string;
  note?: string;
}

export interface ICompleteRentalOrderReq {
  actualReturnDate?: string;
  lateFeePolicy?: RentalOrderLateFeePolicy;
  customLateFeeTotal?: number;
  lateFeeNote?: string;
  damageFeeTotal?: number;
  damageNote?: string;
  compensationFeeTotal?: number;
  compensationNote?: string;
  settlementPayment?: ICompleteRentalOrderSettlementPaymentReq;
  note?: string;
}

export interface IRecordRentalOrderPaymentReq {
  kind: Exclude<PaymentKind, 'REFUND'>;
  method: PaymentMethod;
  status?: PaymentRecordStatus;
  amount: number;
  referenceCode?: string;
  note?: string;
}

export interface IRefundRentalOrderPaymentReq {
  method: PaymentMethod;
  status?: PaymentRecordStatus;
  amount: number;
  referenceCode?: string;
  note?: string;
}

export interface ICheckRentalOrderAvailabilityItemReq {
  productId: string;
  quantity: number;
  assetUnitIds: string[];
}

export interface ICheckRentalOrderAvailabilityReq {
  startDate: string;
  endDate: string;
  excludeOrderId?: string;
  items: ICheckRentalOrderAvailabilityItemReq[];
}

export interface IRentalOrderUnavailableItem {
  productId: string;
  assetUnitId: string | null;
  reason: string;
}

export interface IRentalOrderAvailabilityOut {
  isAvailable: boolean;
  startDate: string;
  endDate: string;
  blockedEndDate: string;
  turnaroundMinutes: number;
  unavailableItems: IRentalOrderUnavailableItem[];
}

export interface ICustomerOut {
  id: string;
  code: string | null;
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  identityNumber: string | null;
  socialContact: string | null;
  notes: string | null;
  status: 'ACTIVE' | 'INACTIVE' | 'BLOCKED';
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  createdBy: string | null;
  updatedBy: string | null;
}

export interface IGetCustomersParams extends DefaultParamsRequest {
  status?: ICustomerOut['status'];
}

export interface ICreateCustomerReq {
  name: string;
  phone: string;
  email: string;
  address: string;
  identityNumber: string;
  socialContact: string;
  notes?: string;
}

export type OrderLineDraft = {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  assetUnitId: string;
  serialNumber: string;
  dailyPrice: number;
  halfDayPrice: number;
  hourlyOveragePrice: number;
  depositAmount: number;
  rentalPriceTiers: Array<{
    id: string;
    minDays: number;
    maxDays: number | null;
    dailyPrice: number;
    name: string | null;
  }>;
  note?: string;
};

export type RentalOrderEditableLine = OrderLineDraft & {
  status?: string;
  bookingHoldAmount?: number;
  removed?: boolean;
};

export type RentalOrderEditableLineState = 'UNCHANGED' | 'ADDED' | 'REMOVED' | 'CHANGED';
export type RentalOrderEditableLineFilter = 'ALL' | RentalOrderEditableLineState;
