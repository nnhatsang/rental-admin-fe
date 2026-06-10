import {
  requestCreateProduct,
  requestDeleteProduct,
  requestGetProductById,
  requestGetProducts,
  requestUpdateProduct,
  requestUpdateProductStatus,
} from '@/services/products';
import type { ICreateProductReq, IGetProductsParams, IUpdateProductReq, IUpdateProductStatusReq } from '@/types/products';
import { ERROR_MESSAGES } from '@/utils/consts/message-error.const';
import { QUERY_KEYS } from '@/utils/consts/query-key.const';
import { SUCCESS_MESSAGES } from '@/utils/consts/messages-success.const';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export const useProducts = (params: IGetProductsParams) => {
  return useQuery({
    queryKey: [QUERY_KEYS.products, params],
    queryFn: async () => {
      const response = await requestGetProducts(params);
      return response.data.data;
    },
  });
};

export const useProduct = (id?: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.products, id],
    queryFn: async () => {
      const response = await requestGetProductById(id!);
      return response.data.data;
    },
    enabled: Boolean(id),
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ICreateProductReq) => requestCreateProduct(data),
    onError: () => toast.error(ERROR_MESSAGES.PRODUCTS.CREATE),
    onSuccess: () => {
      toast.success(SUCCESS_MESSAGES.PRODUCTS.CREATE);
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.products] });
    },
  });
};

export const useUpdateProduct = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: IUpdateProductReq) => requestUpdateProduct(id, data),
    onError: () => toast.error(ERROR_MESSAGES.PRODUCTS.UPDATE),
    onSuccess: () => {
      toast.success(SUCCESS_MESSAGES.PRODUCTS.UPDATE);
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.products] });
    },
  });
};

export const useUpdateProductStatus = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: IUpdateProductStatusReq) => requestUpdateProductStatus(id, data),
    onError: () => toast.error(ERROR_MESSAGES.PRODUCTS.UPDATE_STATUS),
    onSuccess: () => {
      toast.success(SUCCESS_MESSAGES.PRODUCTS.UPDATE_STATUS);
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.products] });
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => requestDeleteProduct(id),
    onError: () => toast.error(ERROR_MESSAGES.PRODUCTS.DELETE),
    onSuccess: () => {
      toast.success(SUCCESS_MESSAGES.PRODUCTS.DELETE);
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.products] });
    },
  });
};
