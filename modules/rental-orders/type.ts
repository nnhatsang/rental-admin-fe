import type { DefaultParamsRequest } from '@/types/api';

export type OrderStatus =
  | 'DRAFT'
  | 'CONFIRMED'
  | 'PREPARING'
  | 'READY_FOR_PICKUP'
  | 'DELIVERING'
  | 'RENTING'
  | 'OVERDUE'
  | 'RETURNED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'REFUNDING'
  | 'REFUNDED'
  | 'DISPUTED';

export type PaymentStatus = 'UNPAID' | 'PARTIALLY_PAID' | 'PAID' | 'PARTIALLY_REFUNDED' | 'REFUNDED';
export type PickupMethod = 'PICKUP_AT_STORE' | 'DELIVERY';

export interface IGetRentalOrdersParams extends DefaultParamsRequest {
  customerId?: string;
  assignedToId?: string;
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  fromDate?: string;
  toDate?: string;
}

export interface IRentalOrderCustomer {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
}

export interface IRentalOrderUser {
  id: string;
  fullName: string;
  email: string;
}

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
  product: IRentalOrderProduct;
  assetUnit: IRentalOrderAssetUnit | null;
  productNameSnapshot: string;
  skuSnapshot: string | null;
  unitPrice: string;
  bookingHoldAmount: string;
  upfrontAmount: string;
  refundableDepositAmount: string;
  depositAmount: string;
  lineTotal: string;
  note: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface IRentalOrderOut {
  id: string;
  code: string;
  source: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  rentalPolicyId: string | null;
  customer: IRentalOrderCustomer;
  customerNameSnapshot: string;
  customerPhoneSnapshot: string | null;
  customerEmailSnapshot: string | null;
  customerAddressSnapshot: string | null;
  customerIdentitySnapshot: string | null;
  startDate: string;
  endDate: string;
  turnaroundMinutes: number;
  blockedEndDate: string;
  actualReturnDate: string | null;
  pickupMethod: PickupMethod;
  deliveryAddress: string | null;
  deliveryFeeTotal: string;
  subtotal: string;
  depositTotal: string;
  upfrontTotal: string;
  bookingHoldTotal: string;
  handoverDueTotal: string;
  lateFeeTotal: string;
  damageFeeTotal: string;
  discountTotal: string;
  paidTotal: string;
  remainingTotal: string;
  refundTotal: string;
  note: string | null;
  internalNote: string | null;
  cancelReason: string | null;
  createdBy: string;
  assignedTo: IRentalOrderUser | null;
  items: IRentalOrderItem[];
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface IRentalOrderCreateItemReq {
  productId: string;
  assetUnitId?: string;
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
  assignedToId?: string;
  note?: string;
  internalNote?: string;
  items: IRentalOrderCreateItemReq[];
}

export interface ICheckRentalOrderAvailabilityItemReq {
  productId: string;
  quantity: number;
  assetUnitIds?: string[];
}

export interface ICheckRentalOrderAvailabilityReq {
  startDate: string;
  endDate: string;
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
  phone?: string;
  email?: string;
  address?: string;
  identityNumber?: string;
  socialContact?: string;
  notes?: string;
}

export type OrderLineDraft = {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  available: number;
  reserved: number;
  total: number;
  assetUnitIds: string[];
  note?: string;
};
