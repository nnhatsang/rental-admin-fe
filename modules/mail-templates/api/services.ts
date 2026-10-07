import { apiAuth } from '@/axios';
import type { DefaultResponse, DefaultResponseWithPagination } from '@/types/api';
import type { AxiosRequestConfig, AxiosResponse } from 'axios';
import type {
  ICreateMailLayoutReq,
  IMailLayoutActionRes,
  IMailLayoutListParams,
  IMailLayoutOut,
  IMailTemplateCatalogOut,
  IMailTemplateListParams,
  IMailTemplateOut,
  IPreviewMailTemplateReq,
  IRenderedMailTemplateOut,
  ISendTestMailTemplateOut,
  ISendTestMailTemplateReq,
  IUpdateMailLayoutReq,
  IUpdateMailTemplateReq,
} from '../type';

const url = '/mail-templates';

export const requestGetMailTemplates = (
  params: IMailTemplateListParams,
): Promise<AxiosResponse<DefaultResponseWithPagination<IMailTemplateOut>>> => {
  const config: AxiosRequestConfig = { method: 'GET', url, params };
  return apiAuth(config);
};

export const requestGetMailTemplate = (
  id: string,
): Promise<AxiosResponse<DefaultResponse<IMailTemplateOut>>> => {
  const config: AxiosRequestConfig = { method: 'GET', url: `${url}/${id}` };
  return apiAuth(config);
};

export const requestGetMailTemplateCatalog = (): Promise<AxiosResponse<DefaultResponse<IMailTemplateCatalogOut[]>>> => {
  const config: AxiosRequestConfig = { method: 'GET', url: `${url}/catalog` };
  return apiAuth(config);
};

export const requestGetMailLayouts = (
  params: IMailLayoutListParams,
): Promise<AxiosResponse<DefaultResponseWithPagination<IMailLayoutOut>>> => {
  const config: AxiosRequestConfig = { method: 'GET', url: `${url}/layouts`, params };
  return apiAuth(config);
};

export const requestGetMailLayout = (
  id: string,
): Promise<AxiosResponse<DefaultResponse<IMailLayoutOut>>> => {
  const config: AxiosRequestConfig = { method: 'GET', url: `${url}/layouts/${id}` };
  return apiAuth(config);
};

export const requestCreateMailLayout = (
  data: ICreateMailLayoutReq,
): Promise<AxiosResponse<DefaultResponse<IMailLayoutOut>>> => {
  const config: AxiosRequestConfig = { method: 'POST', url: `${url}/layouts`, data };
  return apiAuth(config);
};

export const requestUpdateMailLayout = (
  id: string,
  data: IUpdateMailLayoutReq,
): Promise<AxiosResponse<DefaultResponse<IMailLayoutOut>>> => {
  const config: AxiosRequestConfig = { method: 'PATCH', url: `${url}/layouts/${id}`, data };
  return apiAuth(config);
};

export const requestDeleteMailLayout = (
  id: string,
): Promise<AxiosResponse<DefaultResponse<IMailLayoutActionRes>>> => {
  const config: AxiosRequestConfig = { method: 'DELETE', url: `${url}/layouts/${id}` };
  return apiAuth(config);
};

export const requestUpdateMailTemplate = (
  id: string,
  data: IUpdateMailTemplateReq,
): Promise<AxiosResponse<DefaultResponse<IMailTemplateOut>>> => {
  const config: AxiosRequestConfig = { method: 'PATCH', url: `${url}/${id}`, data };
  return apiAuth(config);
};

export const requestPreviewMailTemplate = (
  id: string,
  data: IPreviewMailTemplateReq,
): Promise<AxiosResponse<DefaultResponse<IRenderedMailTemplateOut>>> => {
  const config: AxiosRequestConfig = { method: 'POST', url: `${url}/${id}/preview`, data };
  return apiAuth(config);
};

export const requestSendTestMailTemplate = (
  id: string,
  data: ISendTestMailTemplateReq,
): Promise<AxiosResponse<DefaultResponse<ISendTestMailTemplateOut>>> => {
  const config: AxiosRequestConfig = { method: 'POST', url: `${url}/${id}/send-test`, data };
  return apiAuth(config);
};
