import type { IMailLayoutListParams, IMailTemplateListParams } from '../type';

export const mailTemplateQueryKeys = {
  all: ['mail-templates'] as const,
  lists: () => [...mailTemplateQueryKeys.all, 'list'] as const,
  list: (params: IMailTemplateListParams) => [...mailTemplateQueryKeys.lists(), params] as const,
  details: () => [...mailTemplateQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...mailTemplateQueryKeys.details(), id] as const,
  catalog: () => [...mailTemplateQueryKeys.all, 'catalog'] as const,
  layouts: (params: IMailLayoutListParams) => [...mailTemplateQueryKeys.all, 'layouts', params] as const,
  layout: (id: string) => [...mailTemplateQueryKeys.all, 'layout', id] as const,
};
