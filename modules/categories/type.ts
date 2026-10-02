import type { DefaultParamsRequest } from '@/types/api';

export enum CategorySortBy {
  ORDER = 'order',
  CREATED_AT = 'createdAt',
  UPDATED_AT = 'updatedAt',
  NAME = 'name',
  IS_ACTIVE = 'isActive',
}

export type ICategoryOut = {
  id: string;
  name: string;
  slug: string | null;
  order: number;
  isActive: boolean;
  productCount: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};

export type IGetCategoriesParams = DefaultParamsRequest & {
  sortBy?: CategorySortBy;
  isActive?: boolean;
};

export type ICreateCategoryReq = {
  name: string;
  slug?: string;
  isActive?: boolean;
};

export type IUpdateCategoryReq = Partial<ICreateCategoryReq>;

export type IUpdateCategoryStatusReq = {
  isActive: boolean;
};

export type IReorderCategoriesReq = {
  categoryIds: string[];
};

export type ICategoryActionRes = {
  success: true;
};
