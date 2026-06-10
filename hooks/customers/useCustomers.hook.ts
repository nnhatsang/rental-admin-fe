import {
  requestCreateCustomer,
  requestDeleteCustomer,
  requestGetCustomerById,
  requestGetCustomers,
  requestUpdateCustomer,
  requestUpdateCustomerStatus,
} from '@/services/customers';
import type { ICreateCustomerReq, IGetCustomersParams, IUpdateCustomerReq, IUpdateCustomerStatusReq } from '@/types/customers';
import { ERROR_MESSAGES } from '@/utils/consts/message-error.const';
import { QUERY_KEYS } from '@/utils/consts/query-key.const';
import { SUCCESS_MESSAGES } from '@/utils/consts/messages-success.const';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export const useCustomers = (params: IGetCustomersParams) => {
  return useQuery({
    queryKey: [QUERY_KEYS.customers, params],
    queryFn: async () => {
      const response = await requestGetCustomers(params);
      return response.data.data;
    },
  });
};

export const useCustomer = (id?: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.customers, id],
    queryFn: async () => {
      const response = await requestGetCustomerById(id!);
      return response.data.data;
    },
    enabled: Boolean(id),
  });
};

export const useCreateCustomer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ICreateCustomerReq) => requestCreateCustomer(data),
    onError: () => toast.error(ERROR_MESSAGES.CUSTOMERS.CREATE),
    onSuccess: () => {
      toast.success(SUCCESS_MESSAGES.CUSTOMERS.CREATE);
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.customers] });
    },
  });
};

export const useUpdateCustomer = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: IUpdateCustomerReq) => requestUpdateCustomer(id, data),
    onError: () => toast.error(ERROR_MESSAGES.CUSTOMERS.UPDATE),
    onSuccess: () => {
      toast.success(SUCCESS_MESSAGES.CUSTOMERS.UPDATE);
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.customers] });
    },
  });
};

export const useUpdateCustomerStatus = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: IUpdateCustomerStatusReq) => requestUpdateCustomerStatus(id, data),
    onError: () => toast.error(ERROR_MESSAGES.CUSTOMERS.UPDATE_STATUS),
    onSuccess: () => {
      toast.success(SUCCESS_MESSAGES.CUSTOMERS.UPDATE_STATUS);
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.customers] });
    },
  });
};

export const useDeleteCustomer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => requestDeleteCustomer(id),
    onError: () => toast.error(ERROR_MESSAGES.CUSTOMERS.DELETE),
    onSuccess: () => {
      toast.success(SUCCESS_MESSAGES.CUSTOMERS.DELETE);
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.customers] });
    },
  });
};
