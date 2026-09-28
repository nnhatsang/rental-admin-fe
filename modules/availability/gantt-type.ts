import type { AssetCondition, AssetStatus } from '@/modules/asset-units/type';
import type { RentalOrderStatus } from '@/modules/rental-orders/model';

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
