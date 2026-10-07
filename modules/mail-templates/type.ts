import type { DefaultParamsRequest } from '@/types/api';

export type MailTemplateSortBy = 'key' | 'name' | 'isActive' | 'createdAt' | 'updatedAt';

export type MailLayoutSortBy = 'key' | 'name' | 'createdAt' | 'updatedAt';

export interface IMailLayoutListParams extends DefaultParamsRequest {
  isActive?: boolean;
  sortBy?: MailLayoutSortBy;
}

export interface IMailLayoutOut {
  id: string;
  key: string;
  name: string;
  htmlLayout: string;
  isActive: boolean;
  usedByCount: number;
  createdBy: string | null;
  updatedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface IMailLayoutActionRes {
  success: boolean;
}

export interface IMailTemplateOut {
  id: string;
  key: string;
  name: string;
  layoutId: string | null;
  layoutName: string | null;
  subject: string;
  htmlBody: string;
  description: string | null;
  variables: string[];
  isActive: boolean;
  createdBy: string | null;
  updatedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface IMailTemplateVariableOut {
  key: string;
  label: string;
  type: 'text' | 'url' | 'number';
  required: boolean;
  sampleValue: string | number;
}

export interface IMailTemplateCatalogOut {
  key: string;
  label: string;
  category: string;
  description: string;
  templateId: string | null;
  isConfigured: boolean;
  isActive: boolean;
  variables: IMailTemplateVariableOut[];
  samplePayload: Record<string, unknown>;
}

export interface IMailTemplateListParams extends DefaultParamsRequest {
  isActive?: boolean;
  sortBy?: MailTemplateSortBy;
}

export interface ICreateMailLayoutReq {
  key: string;
  name: string;
  htmlLayout: string;
  isActive?: boolean;
}

export interface IUpdateMailLayoutReq {
  key?: string;
  name?: string;
  htmlLayout?: string;
  isActive?: boolean;
}

export interface IUpdateMailTemplateReq {
  name?: string;
  layoutId?: string | null;
  subject?: string;
  htmlBody?: string;
  description?: string | null;
  isActive?: boolean;
}

export interface IPreviewMailTemplateReq {
  payload: Record<string, unknown>;
  subject?: string;
  htmlBody?: string;
  layoutId?: string | null;
}

export interface IRenderedMailTemplateOut {
  subject: string;
  htmlBody: string;
}

export interface ISendTestMailTemplateReq extends IPreviewMailTemplateReq {
  toEmail: string;
}

export interface ISendTestMailTemplateOut {
  accepted: boolean;
  jobId: string;
}
