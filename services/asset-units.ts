import { apiAuth } from '@/axios';
import type { DefaultResponse, DefaultResponseWithPagination } from '@/types/api';
import type {
  IAssetUnitActionRes,
  IAssetUnitOut,
  ICreateAssetUnitReq,
  IGetAssetUnitsParams,
  IUpdateAssetUnitReq,
  IUpdateAssetUnitStatusReq,
} from '@/types/asset-units';
import type { AxiosRequestConfig, AxiosResponse } from 'axios';

const url = '/asset-units';

export const requestGetAssetUnits = (
  params: IGetAssetUnitsParams,
): Promise<AxiosResponse<DefaultResponseWithPagination<IAssetUnitOut>>> => {
  const config: AxiosRequestConfig = {
    method: 'GET',
    url,
    params,
  };

  return apiAuth(config);
};

export const requestGetAssetUnitById = (id: string): Promise<AxiosResponse<DefaultResponse<IAssetUnitOut>>> => {
  const config: AxiosRequestConfig = {
    method: 'GET',
    url: `${url}/${id}`,
  };

  return apiAuth(config);
};

export const requestCreateAssetUnit = (data: ICreateAssetUnitReq): Promise<AxiosResponse<DefaultResponse<IAssetUnitOut>>> => {
  const config: AxiosRequestConfig = {
    method: 'POST',
    url,
    data,
  };

  return apiAuth(config);
};

export const requestUpdateAssetUnit = (
  id: string,
  data: IUpdateAssetUnitReq,
): Promise<AxiosResponse<DefaultResponse<IAssetUnitOut>>> => {
  const config: AxiosRequestConfig = {
    method: 'PATCH',
    url: `${url}/${id}`,
    data,
  };

  return apiAuth(config);
};

export const requestUpdateAssetUnitStatus = (
  id: string,
  data: IUpdateAssetUnitStatusReq,
): Promise<AxiosResponse<DefaultResponse<IAssetUnitOut>>> => {
  const config: AxiosRequestConfig = {
    method: 'PATCH',
    url: `${url}/${id}/status`,
    data,
  };

  return apiAuth(config);
};

export const requestDeleteAssetUnit = (id: string): Promise<AxiosResponse<DefaultResponse<IAssetUnitActionRes>>> => {
  const config: AxiosRequestConfig = {
    method: 'DELETE',
    url: `${url}/${id}`,
  };

  return apiAuth(config);
};
