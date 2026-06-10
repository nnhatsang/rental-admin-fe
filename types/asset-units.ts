import type { DefaultParamsRequest } from './api';
import type { AssetCondition, AssetStatus } from '@/utils/consts/resource-status.const';

export interface IAssetUnitProductOut {
  id: string;
  name: string;
  sku: string;
}

export interface IAssetUnitOut {
  id: string;
  product: IAssetUnitProductOut;
  serialNumber: string | null;
  status: AssetStatus;
  condition: AssetCondition;
  note: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface IGetAssetUnitsParams extends DefaultParamsRequest {
  productId?: string;
  status?: AssetStatus;
  condition?: AssetCondition;
  isActive?: boolean;
}

export interface ICreateAssetUnitReq {
  productId: string;
  serialNumber?: string;
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
