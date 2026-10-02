import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { requestGetSystemSettings, requestUpdateSystemSettings } from '../services';
import type { IUpdateSystemSettingsReq } from '../type';
import { systemSettingsQueryKeys } from './keys';

export const useGetSystemSettings = () => {
  return useQuery({
    queryKey: systemSettingsQueryKeys.detail(),
    queryFn: async () => {
      const { data } = await requestGetSystemSettings();
      return data.data;
    },
  });
};

export const useUpdateSystemSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: IUpdateSystemSettingsReq) => requestUpdateSystemSettings(data),
    onSuccess: async () => {
      toast.success('Đã lưu quy tắc thuê máy.');
      await queryClient.invalidateQueries({ queryKey: systemSettingsQueryKeys.all });
    },
  });
};
