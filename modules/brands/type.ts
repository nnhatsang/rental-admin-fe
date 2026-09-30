import type { DefaultParamsRequest } from '@/types/api';

export enum BrandSortBy {
  CREATED_AT = 'createdAt',
  UPDATED_AT = 'updatedAt',
  NAME = 'name',
  IS_ACTIVE = 'isActive',
}

export type IBrandOut = {
  id: string;
  name: string;
  slug: string | null;
  isActive: boolean;
  productCount: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};

export type IGetBrandsParams = DefaultParamsRequest & {
  sortBy?: BrandSortBy;
  isActive?: boolean;
};

export type ICreateBrandReq = {
  name: string;
  slug?: string;
  isActive?: boolean;
};

export type IUpdateBrandReq = Partial<ICreateBrandReq>;

export type IUpdateBrandStatusReq = {
  isActive: boolean;
};

export type IBrandActionRes = {
  success: true;
};
