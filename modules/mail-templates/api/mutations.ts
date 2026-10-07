import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  requestCreateMailLayout,
  requestDeleteMailLayout,
  requestPreviewMailTemplate,
  requestSendTestMailTemplate,
  requestUpdateMailLayout,
  requestUpdateMailTemplate,
} from './services';
import type {
  ICreateMailLayoutReq,
  IPreviewMailTemplateReq,
  ISendTestMailTemplateReq,
  IUpdateMailLayoutReq,
  IUpdateMailTemplateReq,
} from '../type';
import { mailTemplateQueryKeys } from '../hooks/keys';

export const useCreateMailLayout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ICreateMailLayoutReq) => requestCreateMailLayout(data),
    onSuccess: async () => {
      toast.success('Đã tạo layout email.');
      await queryClient.invalidateQueries({ queryKey: mailTemplateQueryKeys.all });
    },
  });
};

export const useUpdateMailLayout = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: IUpdateMailLayoutReq) => requestUpdateMailLayout(id, data),
    onSuccess: async ({ data }) => {
      toast.success('Đã lưu layout email.');
      queryClient.setQueryData(mailTemplateQueryKeys.layout(id), data.data);
      await queryClient.invalidateQueries({ queryKey: mailTemplateQueryKeys.all });
    },
  });
};

export const useDeleteMailLayout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => requestDeleteMailLayout(id),
    onSuccess: async () => {
      toast.success('\u0110\u00e3 x\u00f3a layout email.');
      await queryClient.invalidateQueries({ queryKey: mailTemplateQueryKeys.all });
    },
  });
};

export const useUpdateMailTemplate = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: IUpdateMailTemplateReq) => requestUpdateMailTemplate(id, data),
    onSuccess: async ({ data }) => {
      toast.success('Đã lưu mẫu email.');
      queryClient.setQueryData(mailTemplateQueryKeys.detail(id), data.data);
      await queryClient.invalidateQueries({ queryKey: mailTemplateQueryKeys.lists() });
    },
  });
};

export const usePreviewMailTemplate = (id: string) => {
  return useMutation({
    mutationFn: (data: IPreviewMailTemplateReq) => requestPreviewMailTemplate(id, data),
  });
};

export const useSendTestMailTemplate = (id: string) => {
  return useMutation({
    mutationFn: (data: ISendTestMailTemplateReq) => requestSendTestMailTemplate(id, data),
    onSuccess: () => {
      toast.success('Email thử đã được đưa vào hàng đợi.');
    },
  });
};
