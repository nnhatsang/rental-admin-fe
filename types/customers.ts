import type { DefaultParamsRequest } from './api';
import type { CustomerStatus } from '@/utils/consts/resource-status.const';

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
}

export interface IGetCustomersParams extends DefaultParamsRequest {
  status?: CustomerStatus;
}

export interface ICreateCustomerReq {
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  identityNumber?: string;
  socialContact?: string;
  notes?: string;
}

export type IUpdateCustomerReq = Partial<ICreateCustomerReq>;

export interface IUpdateCustomerStatusReq {
  status: CustomerStatus;
}

export interface ICustomerActionRes {
  success: true;
}
