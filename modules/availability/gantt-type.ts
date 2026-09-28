import type { AssetCondition, AssetStatus } from '@/modules/asset-units/type';
import type {
  HandoverStatus,
  RentalOrderStatus,
  RentalSettlementStatus,
  ReturnStatus,
} from '@/modules/rental-orders/model';

export interface IGetAvailabilityGanttParams {
  startDate: string;
  endDate: string;
  cursor?: string;
  limit?: number;
  search?: string;
  productId?: string;
}

export interface IAvailabilityGanttBlock {
  orderId: string;
  orderCode: string;
  orderStatus: RentalOrderStatus;
  allocationStatus: string;
  customerName: string;
  customerPhone: string | null;
  customerSocialContact: string | null;
  pickupMethod: 'PICKUP_AT_STORE' | 'DELIVERY';
  deliveryAddress: string | null;
  handoverStatus: HandoverStatus;
  returnStatus: ReturnStatus;
  settlementStatus: RentalSettlementStatus;
  customerNote: string | null;
  internalNote: string | null;
  cancelReason: string | null;
  paidTotal: number;
  amountDueBeforeHandover: number;
  refundDue: number;
  totalCustomerObligation: number;
  amountDueAtBooking: number;
  additionalChargeDue: number;
  actualRefundTotal: number;
  startDate: string;
  endDate: string;
  blockedEndDate: string;
}

export interface IAvailabilityGanttAsset {
  assetUnitId: string;
  serialNumber: string;
  status: AssetStatus;
  condition: AssetCondition;
  isActive: boolean;
  blocks: IAvailabilityGanttBlock[];
}

export interface IAvailabilityGanttProduct {
  productId: string;
  name: string;
  sku: string;
  assetUnits: IAvailabilityGanttAsset[];
}

export interface IAvailabilityGanttSummary {
  totalProducts: number;
  totalAssets: number;
  scheduledAssets: number;
  freeAssets: number;
  unassignableAssets: number;
}

export interface IAvailabilityGanttData {
  items: IAvailabilityGanttProduct[];
  pagination: {
    nextCursor: string | null;
    hasNext: boolean;
    limit: number;
  };
  startDate: string;
  endDate: string;
  summary: IAvailabilityGanttSummary;
}
