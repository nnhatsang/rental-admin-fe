import {
  requestCreateUser,
  requestDeleteUser,
  requestGetUserById,
  requestGetUsers,
  requestResetUserPassword,
  requestUpdateUser,
  requestUpdateUserActivityStatus,
  requestUpdateUserRoles,
} from '@/services/users';
import type {
  ICreateUserReq,
  IGetUsersParams,
  IResetUserPasswordReq,
  IUpdateUserActivityStatusReq,
  IUpdateUserReq,
  IUpdateUserRolesReq,
} from '@/types/users';
import { ERROR_MESSAGES } from '@/utils/consts/message-error.const';
import { QUERY_KEYS } from '@/utils/consts/query-key.const';
import { SUCCESS_MESSAGES } from '@/utils/consts/messages-success.const';
import { queryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export const usersQueryOptions = (params: IGetUsersParams) =>
  queryOptions({
    queryKey: [QUERY_KEYS.users, params],
    queryFn: async () => {
      const response = await requestGetUsers(params);
      return response.data.data;
    },
  });

export const useUsers = (params: IGetUsersParams) => {
  return useQuery(usersQueryOptions(params));
};
// export const useUsers = (params: IGetUsersParams) => {
//   return useQuery({
//     queryKey: [QUERY_KEYS.users, params],
//     queryFn: async () => {
//       const response = await requestGetUsers(params);
//       return response.data.data;
//     },
//   });
// };

export const useUser = (id?: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.users, id],
    queryFn: async () => {
      const response = await requestGetUserById(id!);
      return response.data.data;
    },
    enabled: Boolean(id),
  });
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ICreateUserReq) => requestCreateUser(data),
    onError: () => toast.error(ERROR_MESSAGES.USERS.CREATE),
    onSuccess: () => {
      toast.success(SUCCESS_MESSAGES.USERS.CREATE);
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.users] });
    },
  });
};

export const useUpdateUser = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: IUpdateUserReq) => requestUpdateUser(id, data),
    onError: () => toast.error(ERROR_MESSAGES.USERS.UPDATE),
    onSuccess: () => {
      toast.success(SUCCESS_MESSAGES.USERS.UPDATE);
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.users] });
    },
  });
};

export const useUpdateUserActivityStatus = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: IUpdateUserActivityStatusReq) => requestUpdateUserActivityStatus(id, data),
    onError: () => toast.error(ERROR_MESSAGES.USERS.UPDATE_STATUS),
    onSuccess: () => {
      toast.success(SUCCESS_MESSAGES.USERS.UPDATE_STATUS);
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.users] });
    },
  });
};

export const useUpdateUserRoles = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: IUpdateUserRolesReq) => requestUpdateUserRoles(id, data),
    onError: () => toast.error(ERROR_MESSAGES.USERS.UPDATE_ROLES),
    onSuccess: () => {
      toast.success(SUCCESS_MESSAGES.USERS.UPDATE_ROLES);
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.users] });
    },
  });
};

export const useResetUserPassword = (id: string) => {
  return useMutation({
    mutationFn: (data: IResetUserPasswordReq) => requestResetUserPassword(id, data),
    onError: () => toast.error(ERROR_MESSAGES.USERS.RESET_PASSWORD),
    onSuccess: () => toast.success(SUCCESS_MESSAGES.USERS.RESET_PASSWORD),
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => requestDeleteUser(id),
    onError: () => toast.error(ERROR_MESSAGES.USERS.DELETE),
    onSuccess: () => {
      toast.success(SUCCESS_MESSAGES.USERS.DELETE);
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.users] });
    },
  });
};
