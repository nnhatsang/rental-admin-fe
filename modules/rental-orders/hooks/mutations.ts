import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  requestCancelRentalOrder,
  requestConfirmRentalOrderPayment,
  requestConfirmRentalOrderRefund,
  requestCloseCancelledRentalOrder,
  requestCreateRentalOrder,
  requestCreateRentalOrderRefund,
  requestCreateRentalQuote,
  requestHandoverRentalOrder,
  requestInspectRentalOrder,
  requestRecordRentalOrderPayment,
  requestRejectRentalOrderPayment,
  requestReturnRentalOrder,
  requestSettleRentalOrder,
  requestUpdateRentalOrder,
} from '../api';
import type { CreateRentalOrderInput, CreateRentalQuoteInput, UpdateRentalOrderInput } from '../model';
import { rentalOrderQueryKeys } from './keys';

const invalidate = (client: ReturnType<typeof useQueryClient>, id?: string) => {
  void client.invalidateQueries({ queryKey: rentalOrderQueryKeys.lists() });
  if (id) void client.invalidateQueries({ queryKey: rentalOrderQueryKeys.detail(id) });
};

export const useCreateRentalQuote = () => useMutation({ mutationFn: async (data: CreateRentalQuoteInput) => (await requestCreateRentalQuote(data)).data.data });

export const useCreateRentalOrder = () => {
  const client = useQueryClient();
  return useMutation({ mutationFn: async (data: CreateRentalOrderInput) => (await requestCreateRentalOrder(data)).data.data, onSuccess: () => { toast.success('Tạo đơn thuê thành công'); invalidate(client); } });
};

export const useUpdateRentalOrder = () => {
  const client = useQueryClient();
  return useMutation({ mutationFn: async ({ id, data }: { id: string; data: UpdateRentalOrderInput }) => (await requestUpdateRentalOrder(id, data)).data.data, onSuccess: (data) => { toast.success('Cập nhật đơn thuê thành công'); invalidate(client, data.id); } });
};

export const useRentalOrderActions = () => {
  const client = useQueryClient();
  const onSuccess = (data: { id: string }, message: string) => { toast.success(message); invalidate(client, data.id); };
  return {
    cancel: useMutation({ mutationFn: async ({ id, data }: { id: string; data: Parameters<typeof requestCancelRentalOrder>[1] }) => (await requestCancelRentalOrder(id, data)).data.data, onSuccess: (data) => onSuccess(data, 'Đã hủy đơn thuê') }),
    payment: useMutation({ mutationFn: async ({ id, data }: { id: string; data: Parameters<typeof requestRecordRentalOrderPayment>[1] }) => (await requestRecordRentalOrderPayment(id, data)).data.data, onSuccess: (data) => onSuccess(data, 'Đã ghi nhận giao dịch') }),
    confirmPayment: useMutation({ mutationFn: async ({ id, paymentId }: { id: string; paymentId: string }) => (await requestConfirmRentalOrderPayment(id, paymentId)).data.data, onSuccess: (data) => onSuccess(data, 'Đã xác nhận thanh toán') }),
    rejectPayment: useMutation({ mutationFn: async ({ id, paymentId, note }: { id: string; paymentId: string; note?: string }) => (await requestRejectRentalOrderPayment(id, paymentId, { note })).data.data, onSuccess: (data) => onSuccess(data, 'Đã từ chối thanh toán') }),
    refund: useMutation({ mutationFn: async ({ id, data }: { id: string; data: Parameters<typeof requestCreateRentalOrderRefund>[1] }) => (await requestCreateRentalOrderRefund(id, data)).data.data, onSuccess: (data) => onSuccess(data, 'Đã tạo yêu cầu hoàn tiền') }),
    confirmRefund: useMutation({ mutationFn: async ({ id, refundId }: { id: string; refundId: string }) => (await requestConfirmRentalOrderRefund(id, refundId)).data.data, onSuccess: (data) => onSuccess(data, 'Đã xác nhận hoàn tiền') }),
    closeCancellation: useMutation({ mutationFn: async ({ id, note }: { id: string; note: string }) => (await requestCloseCancelledRentalOrder(id, { note })).data.data, onSuccess: (data) => onSuccess(data, 'Đã chốt phần tiền còn lại của đơn hủy') }),
    handover: useMutation({ mutationFn: async ({ id, data }: { id: string; data: Parameters<typeof requestHandoverRentalOrder>[1] }) => (await requestHandoverRentalOrder(id, data)).data.data, onSuccess: (data) => onSuccess(data, 'Đã bàn giao thiết bị') }),
    returnOrder: useMutation({ mutationFn: async ({ id, data }: { id: string; data: Parameters<typeof requestReturnRentalOrder>[1] }) => (await requestReturnRentalOrder(id, data)).data.data, onSuccess: (data) => onSuccess(data, 'Đã ghi nhận trả máy') }),
    inspect: useMutation({ mutationFn: async ({ id, data }: { id: string; data: unknown }) => (await requestInspectRentalOrder(id, data)).data.data, onSuccess: (data) => onSuccess(data, 'Đã lưu kiểm tra thiết bị') }),
    settle: useMutation({ mutationFn: async ({ id, note }: { id: string; note?: string }) => (await requestSettleRentalOrder(id, { note })).data.data, onSuccess: (data) => onSuccess(data, 'Đã quyết toán đơn thuê') }),
  };
};
