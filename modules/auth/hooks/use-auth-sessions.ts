import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import {
  requestGetAuthSessions,
  requestRevokeAuthSession,
  requestRevokeOtherAuthSessions,
} from '../services';
import { authQueryKeys } from './keys';

export const useGetAuthSessions = () => {
  return useQuery({
    queryKey: authQueryKeys.sessions(),
    queryFn: async () => {
      const { data } = await requestGetAuthSessions();
      return data.data;
    },
  });
};

export const useRevokeAuthSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sessionId: string) => requestRevokeAuthSession(sessionId),
    onSuccess: async () => {
      toast.success('Đã thu hồi thiết bị đăng nhập.');
      await queryClient.invalidateQueries({ queryKey: authQueryKeys.sessions() });
    },
  });
};

export const useRevokeOtherAuthSessions = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => requestRevokeOtherAuthSessions(),
    onSuccess: async () => {
      toast.success('Đã đăng xuất các thiết bị khác.');
      await queryClient.invalidateQueries({ queryKey: authQueryKeys.sessions() });
    },
  });
};
