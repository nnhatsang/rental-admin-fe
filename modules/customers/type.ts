import type { DefaultParamsRequest } from '@/types/api';

export const CustomerStatus = {
  Active: 'ACTIVE',
  Inactive: 'INACTIVE',
  Blocked: 'BLOCKED',
} as const;

export type CustomerStatus = (typeof CustomerStatus)[keyof typeof CustomerStatus];

export enum CustomerSortBy {
  CREATED_AT = 'createdAt',
  UPDATED_AT = 'updatedAt',
  CODE = 'code',
  NAME = 'name',
  PHONE = 'phone',
  EMAIL = 'email',
  STATUS = 'status',
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
  status: CustomerStatus;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  createdBy: string | null;
  updatedBy: string | null;
  avatar?: string | null;
}

export interface IGetCustomersParams extends DefaultParamsRequest {
  status?: CustomerStatus;
  sortBy?: CustomerSortBy;
}

export interface ICreateCustomerReq {
  name: string;
  phone: string;
  email: string;
  address: string;
  identityNumber: string;
  socialContact: string;
  notes?: string;
}

export interface IUpdateCustomerReq {
  name?: string;
  phone?: string;
  email?: string;
  address?: string;
  identityNumber?: string;
  socialContact?: string;
  notes?: string;
}

export interface IUpdateCustomerStatusReq {
  status: CustomerStatus;
}

export interface ICustomerActionRes {
  success: true;
}
