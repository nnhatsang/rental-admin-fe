import { useQuery } from '@tanstack/react-query';
import {
  requestGetMailLayout,
  requestGetMailLayouts,
  requestGetMailTemplate,
  requestGetMailTemplateCatalog,
  requestGetMailTemplates,
} from './services';
import type { IMailLayoutListParams, IMailTemplateListParams } from '../type';
import { mailTemplateQueryKeys } from '../hooks/keys';

export const useGetMailTemplates = (params: IMailTemplateListParams) => {
  return useQuery({
    queryKey: mailTemplateQueryKeys.list(params),
    queryFn: async () => {
      const { data } = await requestGetMailTemplates(params);
      return data.data;
    },
    placeholderData: (previousData) => previousData,
  });
};

export const useGetMailTemplate = (id: string) => {
  return useQuery({
    queryKey: mailTemplateQueryKeys.detail(id),
    queryFn: async () => {
      const { data } = await requestGetMailTemplate(id);
      return data.data;
    },
    enabled: Boolean(id),
  });
};

export const useGetMailTemplateCatalog = () => {
  return useQuery({
    queryKey: mailTemplateQueryKeys.catalog(),
    queryFn: async () => {
      const { data } = await requestGetMailTemplateCatalog();
      return data.data;
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useGetMailLayouts = (params: IMailLayoutListParams) => {
  return useQuery({
    queryKey: mailTemplateQueryKeys.layouts(params),
    queryFn: async () => {
      const { data } = await requestGetMailLayouts(params);
      return data.data;
    },
    placeholderData: (previousData) => previousData,
  });
};

export const useGetMailLayout = (id: string) => {
  return useQuery({
    queryKey: mailTemplateQueryKeys.layout(id),
    queryFn: async () => {
      const { data } = await requestGetMailLayout(id);
      return data.data;
    },
    enabled: Boolean(id),
  });
};
