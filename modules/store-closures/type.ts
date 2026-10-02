import type { DefaultParamsRequest } from '@/types/api';

export const STORE_CLOSURE_TYPES = ['OFF', 'HOLIDAY', 'MAINTENANCE', 'INTERNAL_EVENT', 'OTHER'] as const;
export type StoreClosureType = (typeof STORE_CLOSURE_TYPES)[number];

export interface IStoreClosureOut {
  id: string;
  startDate: string;
  endDate: string;
  type: StoreClosureType;
  reason: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface IGetStoreClosuresParams extends DefaultParamsRequest {
  type?: StoreClosureType;
  fromDate?: string;
  toDate?: string;
}

export interface ICreateStoreClosureReq {
  startDate: string;
  endDate: string;
  type?: StoreClosureType;
  reason?: string;
}

export type IUpdateStoreClosureReq = Partial<ICreateStoreClosureReq>;

export interface IDeleteStoreClosuresReq {
  storeClosureIds: string[];
}
