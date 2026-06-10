import {
  requestAssignRoleUsers,
  requestCreateRole,
  requestDeleteRole,
  requestGetRoleById,
  requestGetRoles,
  requestUpdateRole,
  requestUpdateRolePermissions,
} from '@/services/roles';
import type {
  IAssignRoleUsersReq,
  ICreateRoleReq,
  IGetRolesParams,
  IUpdateRolePermissionsReq,
  IUpdateRoleReq,
} from '@/types/roles';
import { ERROR_MESSAGES } from '@/utils/consts/message-error.const';
import { QUERY_KEYS } from '@/utils/consts/query-key.const';
import { SUCCESS_MESSAGES } from '@/utils/consts/messages-success.const';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export const useRoles = (params: IGetRolesParams) => {
  return useQuery({
    queryKey: [QUERY_KEYS.roles, params],
    queryFn: async () => {
      const response = await requestGetRoles(params);
      return response.data.data;
    },
  });
};

export const useRole = (id?: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.roles, id],
    queryFn: async () => {
      const response = await requestGetRoleById(id!);
      return response.data.data;
    },
    enabled: Boolean(id),
  });
};

export const useCreateRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ICreateRoleReq) => requestCreateRole(data),
    onError: () => toast.error(ERROR_MESSAGES.ROLES.CREATE),
    onSuccess: () => {
      toast.success(SUCCESS_MESSAGES.ROLES.CREATE);
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.roles] });
    },
  });
};

export const useUpdateRole = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: IUpdateRoleReq) => requestUpdateRole(id, data),
    onError: () => toast.error(ERROR_MESSAGES.ROLES.UPDATE),
    onSuccess: () => {
      toast.success(SUCCESS_MESSAGES.ROLES.UPDATE);
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.roles] });
    },
  });
};

export const useUpdateRolePermissions = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: IUpdateRolePermissionsReq) => requestUpdateRolePermissions(id, data),
    onError: () => toast.error(ERROR_MESSAGES.ROLES.UPDATE_PERMISSIONS),
    onSuccess: () => {
      toast.success(SUCCESS_MESSAGES.ROLES.UPDATE_PERMISSIONS);
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.roles] });
    },
  });
};

export const useAssignRoleUsers = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: IAssignRoleUsersReq) => requestAssignRoleUsers(data),
    onError: () => toast.error(ERROR_MESSAGES.ROLES.ASSIGN_USERS),
    onSuccess: () => {
      toast.success(SUCCESS_MESSAGES.ROLES.ASSIGN_USERS);
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.roles] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.users] });
    },
  });
};

export const useDeleteRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => requestDeleteRole(id),
    onError: () => toast.error(ERROR_MESSAGES.ROLES.DELETE),
    onSuccess: () => {
      toast.success(SUCCESS_MESSAGES.ROLES.DELETE);
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.roles] });
    },
  });
};
