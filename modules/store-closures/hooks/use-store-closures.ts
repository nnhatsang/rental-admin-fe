import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  requestCreateStoreClosure,
  requestDeleteStoreClosures,
  requestGetStoreClosures,
  requestUpdateStoreClosure,
} from '../services';
import type {
  ICreateStoreClosureReq,
  IDeleteStoreClosuresReq,
  IGetStoreClosuresParams,
  IUpdateStoreClosureReq,
} from '../type';
import { storeClosureQueryKeys } from './keys';

export const useGetStoreClosures = (params: IGetStoreClosuresParams) => {
  return useQuery({
    queryKey: storeClosureQueryKeys.list(params),
    queryFn: async () => {
      const { data } = await requestGetStoreClosures(params);
      return data.data;
    },
    placeholderData: (previousData) => previousData,
  });
};

export const useCreateStoreClosure = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ICreateStoreClosureReq) => requestCreateStoreClosure(data),
    onSuccess: async () => {
      toast.success('Đã thêm ngày đóng cửa.');
      await queryClient.invalidateQueries({ queryKey: storeClosureQueryKeys.all });
    },
  });
};

export const useUpdateStoreClosure = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: IUpdateStoreClosureReq }) => requestUpdateStoreClosure(id, data),
    onSuccess: async () => {
      toast.success('Đã cập nhật ngày đóng cửa.');
      await queryClient.invalidateQueries({ queryKey: storeClosureQueryKeys.all });
    },
  });
};

export const useDeleteStoreClosures = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: IDeleteStoreClosuresReq) => requestDeleteStoreClosures(data),
    onSuccess: async () => {
      toast.success('Đã xóa ngày đóng cửa.');
      await queryClient.invalidateQueries({ queryKey: storeClosureQueryKeys.all });
    },
  });
};
