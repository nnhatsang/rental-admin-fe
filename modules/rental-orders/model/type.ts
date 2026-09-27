import type { DefaultParamsRequest } from '@/types/api';

export const RentalOrderStatus = {
  Created: 'CREATED',
  Confirmed: 'CONFIRMED',
  Renting: 'RENTING',
  Returned: 'RETURNED',
  Done: 'DONE',
  Cancelled: 'CANCELLED',
  Disputed: 'DISPUTED',
} as const;
export type RentalOrderStatus = (typeof RentalOrderStatus)[keyof typeof RentalOrderStatus];

export type RentalSettlementStatus = 'NOT_STARTED' | 'PAYMENT_DUE' | 'REFUND_DUE' | 'SETTLED' | 'DISPUTED';
export type HandoverStatus = 'PENDING_PAYMENT' | 'READY' | 'HANDED_OVER';
export type ReturnStatus = 'NOT_RETURNED' | 'RETURNED' | 'INSPECTED';
export type PaymentMethod = 'CASH' | 'BANK_TRANSFER' | 'CARD' | 'E_WALLET' | 'OTHER';
export type PaymentTransactionStatus = 'PENDING' | 'SUCCESS' | 'FAILED' | 'CANCELLED';
export type RentalRefundStatus = 'PENDING' | 'PROCESSING' | 'REFUNDED' | 'FAILED';
export type RentalInspectionCondition = 'GOOD' | 'DAMAGED' | 'MISSING' | 'NEEDS_MAINTENANCE';
export type RentalAccessoryStatus = 'OK' | 'MISSING' | 'DAMAGED';
export type RentalChargeKind =
  | 'BOOKING_HOLD'
  | 'RENTAL_FEE'
  | 'LATE_FEE'
  | 'DELIVERY_FEE'
  | 'SECURITY_DEPOSIT'
  | 'DAMAGE_COMPENSATION'
  | 'CANCELLATION_FEE'
  | 'OTHER_CHARGE';
export type RentalChargeStatus = 'OPEN' | 'PARTIALLY_SETTLED' | 'SETTLED' | 'WAIVED' | 'CANCELLED';

export interface RentalOrderCustomerSnapshot {
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  identityNumber: string | null;
  socialContact: string | null;
}

export interface RentalOrderListItem {
  id: string;
  code: string;
  source: 'ADMIN' | 'WEBSITE';
  status: RentalOrderStatus;
  handoverStatus: HandoverStatus;
  returnStatus: ReturnStatus;
  settlementStatus: RentalSettlementStatus;
  isOverdue: boolean;
  overdueHours: number;
  customerSnapshot: RentalOrderCustomerSnapshot;
  startDate: string;
  endDate: string;
  rentalFeeTotal: number;
  deliveryFeeTotal: number;
  bookingHoldTotal: number;
  securityDepositTotal: number;
  totalCustomerObligation: number;
  paidTotal: number;
  amountDueBeforeHandover: number;
  refundDue: number;
  additionalChargeDue: number;
  createdAt: string;
  updatedAt: string;
}

export interface RentalOrderAllocation {
  id: string;
  assetUnitId: string;
  serialNumber: string;
  source: 'ADMIN_SELECTED' | 'AUTO_ALLOCATED';
  status: 'REQUESTED' | 'RESERVED' | 'HANDED_OVER' | 'RETURNED' | 'RELEASED';
  startDate: string;
  endDate: string;
  blockedEndDate: string;
}

export interface RentalOrderLine {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  assetUnitCount: number;
  quantity: number;
  unitRentalFee: number;
  unitDepositAmount: number;
  unitBookingHoldAmount: number;
  lineRentalTotal: number;
  lineDepositTotal: number;
  lineBookingHoldTotal: number;
  accessoriesSnapshot: unknown;
  note: string | null;
  allocations: RentalOrderAllocation[];
}

export interface RentalOrderFinancials {
  rentalFeeTotal: number;
  deliveryFeeTotal: number;
  bookingHoldTotal: number;
  securityDepositTotal: number;
  lateFeeTotal: number;
  damageCompensationTotal: number;
  cancellationFeeTotal: number;
  totalCustomerObligation: number;
  paidTotal: number;
  amountDueAtBooking: number;
  amountDueBeforeHandover: number;
  refundDue: number;
  additionalChargeDue: number;
  actualRefundTotal: number;
}

export interface RentalOrderPayment {
  id: string;
  direction: 'INBOUND' | 'OUTBOUND';
  amount: number;
  method: PaymentMethod;
  status: PaymentTransactionStatus;
  referenceCode: string | null;
  idempotencyKey: string | null;
  createdAt: string;
}

export interface RentalOrderRefund {
  id: string;
  amount: number;
  status: RentalRefundStatus;
  method: PaymentMethod;
  referenceCode: string | null;
  createdAt: string;
}

export interface RentalInspectionItem {
  allocationId: string;
  condition: RentalInspectionCondition;
  note: string | null;
  accessories: Array<{ name: string; expectedQuantity: number; actualQuantity: number; status: RentalAccessoryStatus; note: string | null }>;
}

export interface RentalInspection {
  id: string;
  type: 'HANDOVER' | 'RETURN';
  inspectedAt: string;
  note: string | null;
  items: RentalInspectionItem[];
}

export interface RentalOrderDetail {
  id: string;
  code: string;
  source: 'ADMIN' | 'WEBSITE';
  status: RentalOrderStatus;
  handoverStatus: HandoverStatus;
  returnStatus: ReturnStatus;
  settlementStatus: RentalSettlementStatus;
  isOverdue: boolean;
  overdueHours: number;
  customerId: string;
  customerSnapshot: RentalOrderCustomerSnapshot;
  settingsSnapshot: Record<string, unknown>;
  rentalPeriod: { startDate: string; endDate: string; actualPickupDate: string | null; actualReturnDate: string | null };
  fulfillment: { pickupMethod: 'PICKUP_AT_STORE' | 'DELIVERY'; deliveryAddress: string | null };
  financials: RentalOrderFinancials;
  notes: { customerNote: string | null; internalNote: string | null; cancelReason: string | null };
  lines: RentalOrderLine[];
  charges: Array<{ id: string; kind: RentalChargeKind; amount: number; status: RentalChargeStatus; refundable: boolean; metadata: unknown }>;
  payments: RentalOrderPayment[];
  refunds: RentalOrderRefund[];
  inspections: RentalInspection[];
  statusHistories: Array<{ id: string; fromStatus: RentalOrderStatus | null; toStatus: RentalOrderStatus; note: string | null; createdAt: string }>;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface RentalOrderQuoteLine {
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  unitRentalFee: number;
  unitDepositAmount: number;
  unitBookingHoldAmount: number;
  lineRentalTotal: number;
  lineDepositTotal: number;
  lineBookingHoldTotal: number;
  pricingMode: string;
  pricingLabel: string;
  appliedTierId: string | null;
}

export interface RentalOrderAvailabilityConflict {
  productId: string;
  productName: string;
  requestedQuantity: number;
  availableQuantity: number;
  reasonCode: 'NOT_ENOUGH_ASSETS_AVAILABLE' | string;
  message: string;
}

export interface RentalOrderQuote {
  quoteId: string;
  expiresAt: string;
  policyVersion: string;
  availability: { available: boolean; conflicts: RentalOrderAvailabilityConflict[] };
  lines: RentalOrderQuoteLine[];
  summary: { rentalFeeTotal: number; deliveryFeeTotal: number; bookingHoldTotal: number; securityDepositTotal: number; totalCustomerObligation: number; amountDueAtBooking: number; amountDueBeforeHandover: number };
}

export interface IGetRentalOrdersParams extends DefaultParamsRequest {
  status?: RentalOrderStatus;
  settlementStatus?: RentalSettlementStatus;
  source?: 'ADMIN' | 'WEBSITE';
  pickupMethod?: 'PICKUP_AT_STORE' | 'DELIVERY';
  fromDate?: string;
  toDate?: string;
}

export interface CreateRentalQuoteInput {
  customerId?: string;
  startDate: string;
  endDate: string;
  pickupMethod: 'PICKUP_AT_STORE' | 'DELIVERY';
  deliveryAddress?: string;
  excludeOrderId?: string;
  items: Array<{ productId: string; quantity: number; note?: string }>;
}

export interface CreateRentalOrderInput {
  quoteId: string;
  note?: string;
  internalNote?: string;
}

export interface UpdateRentalOrderInput {
  quoteId?: string;
  customerSnapshot?: RentalOrderCustomerSnapshot;
  startDate?: string;
  endDate?: string;
  pickupMethod?: 'PICKUP_AT_STORE' | 'DELIVERY';
  deliveryAddress?: string | null;
  items?: Array<{ productId: string; quantity: number; note?: string }>;
  note?: string | null;
  internalNote?: string | null;
}

