import type { DefaultParamsRequest } from '@/types/api';

export enum AssetStatus {
  AVAILABLE = 'AVAILABLE',
  RESERVED = 'RESERVED',
  RENTED = 'RENTED',
  MAINTENANCE = 'MAINTENANCE',
  RETIRED = 'RETIRED',
  LOST = 'LOST',
}

export enum AssetCondition {
  NEW = 'NEW',
  GOOD = 'GOOD',
  FAIR = 'FAIR',
  DAMAGED = 'DAMAGED',
  LOST = 'LOST',
}

export enum AssetUnitSortBy {
  CREATED_AT = 'createdAt',
  UPDATED_AT = 'updatedAt',
  SERIAL_NUMBER = 'serialNumber',
  STATUS = 'status',
  CONDITION = 'condition',
  IS_ACTIVE = 'isActive',
}

export type IAssetUnitProductOut = {
  id: string;
  name: string;
  sku: string;
  deletedAt: string | null;
};

export type IAssetUnitOut = {
  id: string;
  product: IAssetUnitProductOut;
  serialNumber: string;
  status: AssetStatus;
  condition: AssetCondition;
  note: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  createdBy: string | null;
  updatedBy: string | null;
};

export interface IGetAssetUnitsParams extends DefaultParamsRequest {
  productId?: string;
  status?: AssetStatus;
  condition?: AssetCondition;
  isActive?: boolean | string;
  sortBy?: AssetUnitSortBy;
}

export interface ICreateAssetUnitReq {
  productId: string;
  serialNumber: string;
  status?: AssetStatus;
  condition?: AssetCondition;
  note?: string;
  isActive?: boolean;
}

export type IUpdateAssetUnitReq = Partial<ICreateAssetUnitReq>;

export interface IUpdateAssetUnitStatusReq {
  status: AssetStatus;
  condition: AssetCondition;
  isActive?: boolean;
}

export interface IAssetUnitActionRes {
  success: true;
}
