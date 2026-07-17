import { DefaultParamsRequest } from '@/types/api';

export enum ProductSortBy {
  CREATED_AT = 'createdAt',
  UPDATED_AT = 'updatedAt',
  NAME = 'name',
  SKU = 'sku',
  DAILY_PRICE = 'dailyPrice',
  DEPOSIT_AMOUNT = 'depositAmount',
  IS_ACTIVE = 'isActive',
}

export type IProductRelationOut = {
  id: string;
  name: string;
};

export type IProductRentalPriceTierOut = {
  id: string;
  minDays: number;
  maxDays: number | null;
  dailyPrice: string;
  name: string | null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};

export type IProductRentalPriceTierReq = {
  minDays: number;
  maxDays?: number;
  dailyPrice: number;
  name?: string;
  sortOrder?: number;
};

export type IProductOut = {
  id: string;
  name: string;
  sku: string;
  description: string | null;
  includedAccessories: string | null;
  usageGuide: string | null;
  category: IProductRelationOut | null;
  brand: IProductRelationOut | null;
  dailyPrice: string;
  halfDayPrice: string | null;
  hourlyOveragePrice: string | null;
  rentalPriceTiers: IProductRentalPriceTierOut[];
  depositAmount: string;
  replacementValue: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  createdBy: string | null;
  updatedBy: string | null;
};

export interface IGetProductsParams extends DefaultParamsRequest {
  categoryId?: string;
  brandId?: string;
  isActive?: boolean;
  sortBy?: ProductSortBy;
}

export interface ICreateProductReq {
  name: string;
  sku: string;
  description?: string;
  includedAccessories?: string;
  usageGuide?: string;
  categoryId?: string;
  brandId?: string;
  dailyPrice: number;
  halfDayPrice: number;
  hourlyOveragePrice: number;
  rentalPriceTiers?: IProductRentalPriceTierReq[];
  depositAmount: number;
  replacementValue: number;
  isActive?: boolean;
}

export type IUpdateProductReq = Partial<ICreateProductReq>;

export interface IUpdateProductStatusReq {
  isActive: boolean;
}

export interface IProductActionRes {
  success: true;
}
