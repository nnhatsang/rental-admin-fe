import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { requestChangePassword, requestUpdateProfile } from '@/modules/auth/services';
import type { IChangePasswordReq, IUpdateProfileReq } from '@/modules/auth/types';
import { useAuthStore } from '@/modules/auth/store';
import { authQueryKeys } from '@/modules/auth/hooks/keys';

export const useUpdateAccountProfile = () => {
  return useMutation({
    mutationFn: (data: Partial<IUpdateProfileReq>) => requestUpdateProfile(data),
    onSuccess: async () => {
      await useAuthStore.getState().fetchProfile();
      toast.success('Cập nhật tài khoản thành công.');
    },
  });
};

export const useChangeAccountPassword = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: IChangePasswordReq) => requestChangePassword(data),
    onSuccess: async () => {
      toast.success('Đổi mật khẩu thành công.');
      await queryClient.invalidateQueries({ queryKey: authQueryKeys.sessions() });
    },
  });
};
