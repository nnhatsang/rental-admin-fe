import type { IGetAssetUnitsParams } from '@/types/asset-units';
import type { DefaultParamsRequest } from '@/types/api';
import type { IGetCustomersParams } from '@/types/customers';
import type { IGetPermissionsParams } from '@/types/permissions';
import type { IGetProductsParams } from '@/types/products';
import type { IGetRolesParams } from '@/types/roles';
import type { IGetUsersParams } from '@/types/users';
import { ROLE_CODES } from './consts/rbac.const';
import {
  ASSET_CONDITIONS,
  ASSET_STATUSES,
  CUSTOMER_STATUSES,
  USER_ACTIVITY_STATUSES,
  type AssetCondition,
  type AssetStatus,
  type CustomerStatus,
  type UserActivityStatus,
} from './consts/resource-status.const';

type SearchParamValue = string | string[] | undefined;
type SearchParamsInput = URLSearchParams | Record<string, SearchParamValue>;

const DEFAULT_PAGE = 1;
const DEFAULT_PER_PAGE = 10;

const getParam = (searchParams: SearchParamsInput, key: string) => {
  const value = searchParams instanceof URLSearchParams ? searchParams.get(key) : searchParams[key];
  const firstValue = Array.isArray(value) ? value[0] : value;
  const trimmedValue = firstValue?.trim();

  return trimmedValue || undefined;
};

const parsePositiveInt = (value: string | undefined, fallback: number) => {
  if (!value) return fallback;

  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed < 1) {
    return fallback;
  }

  return parsed;
};

const parseBoolean = (value: string | undefined) => {
  if (value === 'true') return true;
  if (value === 'false') return false;

  return undefined;
};

const parseEnum = <T extends string>(value: string | undefined, allowedValues: readonly T[]) => {
  if (!value) return undefined;

  return allowedValues.includes(value as T) ? (value as T) : undefined;
};

const parseBaseListParams = (searchParams: SearchParamsInput): DefaultParamsRequest => {
  const search = getParam(searchParams, 'search');
  const sort = getParam(searchParams, 'sort');

  return {
    page: parsePositiveInt(getParam(searchParams, 'page'), DEFAULT_PAGE),
    perPage: parsePositiveInt(getParam(searchParams, 'perPage'), DEFAULT_PER_PAGE),
    ...(search ? { search } : {}),
    ...(sort ? { sort } : {}),
  };
};

export const parseUsersSearchParams = (searchParams: SearchParamsInput): IGetUsersParams => {
  const status = parseEnum<UserActivityStatus>(getParam(searchParams, 'status'), USER_ACTIVITY_STATUSES);
  const roleCode = parseEnum(getParam(searchParams, 'roleCode'), ROLE_CODES);

  return {
    ...parseBaseListParams(searchParams),
    ...(status ? { status } : {}),
    ...(roleCode ? { roleCode } : {}),
  };
};

export const parseCustomersSearchParams = (searchParams: SearchParamsInput): IGetCustomersParams => {
  const status = parseEnum<CustomerStatus>(getParam(searchParams, 'status'), CUSTOMER_STATUSES);

  return {
    ...parseBaseListParams(searchParams),
    ...(status ? { status } : {}),
  };
};

export const parseProductsSearchParams = (searchParams: SearchParamsInput): IGetProductsParams => {
  const categoryId = getParam(searchParams, 'categoryId');
  const brandId = getParam(searchParams, 'brandId');
  const isActive = parseBoolean(getParam(searchParams, 'isActive'));

  return {
    ...parseBaseListParams(searchParams),
    ...(categoryId ? { categoryId } : {}),
    ...(brandId ? { brandId } : {}),
    ...(typeof isActive === 'boolean' ? { isActive } : {}),
  };
};

export const parseAssetUnitsSearchParams = (searchParams: SearchParamsInput): IGetAssetUnitsParams => {
  const productId = getParam(searchParams, 'productId');
  const status = parseEnum<AssetStatus>(getParam(searchParams, 'status'), ASSET_STATUSES);
  const condition = parseEnum<AssetCondition>(getParam(searchParams, 'condition'), ASSET_CONDITIONS);
  const isActive = parseBoolean(getParam(searchParams, 'isActive'));

  return {
    ...parseBaseListParams(searchParams),
    ...(productId ? { productId } : {}),
    ...(status ? { status } : {}),
    ...(condition ? { condition } : {}),
    ...(typeof isActive === 'boolean' ? { isActive } : {}),
  };
};

export const parseRolesSearchParams = (searchParams: SearchParamsInput): IGetRolesParams => {
  const isSystem = parseBoolean(getParam(searchParams, 'isSystem'));

  return {
    ...parseBaseListParams(searchParams),
    ...(typeof isSystem === 'boolean' ? { isSystem } : {}),
  };
};

export const parsePermissionsSearchParams = (searchParams: SearchParamsInput): IGetPermissionsParams => {
  const module = getParam(searchParams, 'module');
  const search = getParam(searchParams, 'search');

  return {
    ...(module ? { module } : {}),
    ...(search ? { search } : {}),
  };
};
