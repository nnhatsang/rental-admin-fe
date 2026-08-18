import type { AssetCondition, AssetStatus } from '@/modules/asset-units/type';
import type { DefaultParamsRequest } from '@/types/api';
import type { IPaginationResponse } from '@/types/api';

export type AvailabilityFilter = 'ALL' | 'AVAILABLE' | 'UNAVAILABLE';
export type AssetAvailabilityState = 'AVAILABLE' | 'BOOKED' | 'UNASSIGNABLE';
export type AssetAvailabilityReason =
  | 'BOOKED'
  | 'INACTIVE'
  | 'RESERVED'
  | 'RENTED'
  | 'INSPECTING'
  | 'MAINTENANCE'
  | 'CLEANING'
  | 'TRANSFERRING'
  | 'RETIRED'
  | 'LOST';

export interface IGetAvailabilityProductsParams extends DefaultParamsRequest {
  startDate: string;
  endDate: string;
  search?: string;
  availability?: AvailabilityFilter;
  excludeOrderId?: string;
}

export interface IGetAvailabilityAssetsParams extends IGetAvailabilityProductsParams {
  productId?: string;
}

export type IGetAvailabilityTimelineParams = IGetAvailabilityProductsParams;


export interface IAvailabilityProduct {
  productId: string;
  name: string;
  sku: string;
  dailyPrice: number;
  halfDayPrice: number;
  hourlyOveragePrice: number;
  rentalPriceTiers: Array<{
    id: string;
    minDays: number;
    maxDays: number | null;
    dailyPrice: number;
    name: string | null;
    sortOrder: number;
  }>;
  depositAmount: number;
  inventory: {
    total: number;
    reserved: number;
    available: number;
  };
}

export interface IAvailabilityProductsData {
  items: IAvailabilityProduct[];
  pagination: IPaginationResponse<IAvailabilityProduct>['pagination'];
  startDate: string;
  endDate: string;
  blockedEndDate: string;
  turnaroundMinutes: number;
  bookingHoldAmountPerUnit: number;
}

export interface IAvailabilityAsset {
  assetUnitId: string;
  serialNumber: string;
  status: AssetStatus;
  condition: AssetCondition;
  availability: AssetAvailabilityState;
  reasonCode: AssetAvailabilityReason | null;
  conflictBlockedEndDate: string | null;
  product: Omit<IAvailabilityProduct, 'inventory'>;
}

export interface IAvailabilityAssetsData {
  items: IAvailabilityAsset[];
  pagination: IPaginationResponse<IAvailabilityAsset>['pagination'];
  availableQuantity: number;
  selectionLimit: number;
  blockedEndDate: string;
  bookingHoldAmountPerUnit: number;
}

export interface IAvailabilityTimelineBlock {
  orderId: string;
  orderCode: string;
  status: string;
  customerName: string;
  startDate: string;
  endDate: string;
  blockedEndDate: string;
}

export interface IAvailabilityTimelineRow {
  assetUnitId: string;
  serialNumber: string | null;
  productName: string;
  sku: string;
  status: AssetStatus;
  condition: AssetCondition;
  blocks: IAvailabilityTimelineBlock[];
}

export interface IAvailabilityTimelineData {
  items: IAvailabilityTimelineRow[];
  pagination: IPaginationResponse<IAvailabilityTimelineRow>['pagination'];
  startDate: string;
  endDate: string;
}


export interface IAvailabilityChangedPayload {
  reason: string;
  productIds: string[];
  assetUnitIds: string[];
  occurredAt: string;
}
