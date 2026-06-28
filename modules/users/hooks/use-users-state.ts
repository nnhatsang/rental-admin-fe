import { useState } from 'react';
import { useGetUsers } from './use-get-users';
import { useDeleteUser } from './use-delete-user';
import { useUpdateUserActivityStatus } from './use-update-user-activity-status';
import { IUserOut, UserActivityStatus } from '../type';

export const useUsersState = () => {
  // 1. Table, pagination and filters state
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<UserActivityStatus | undefined>(undefined);
  const [roleCode, setRoleCode] = useState<string | undefined>(undefined);

  // 2. Dialog open/close state & active user selection
  const [selectedUser, setSelectedUser] = useState<IUserOut | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isResetPasswordOpen, setIsResetPasswordOpen] = useState(false);

  // 3. Main query
  const { data, isLoading } = useGetUsers({
    page,
    perPage: pageSize,
    search: search || undefined,
    status,
    roleCode,
  });

  // 4. Mutations
  const { mutate: deleteUser, isPending: isDeleting } = useDeleteUser();
  const { mutate: updateStatus, isPending: isUpdatingStatus } = useUpdateUserActivityStatus();

  // 5. Action handlers
  const handleOpenEdit = (user: IUserOut) => {
    setSelectedUser(user);
    setIsEditOpen(true);
  };

  const handleOpenDelete = (user: IUserOut) => {
    setSelectedUser(user);
    setIsDeleteOpen(true);
  };

  const handleOpenResetPassword = (user: IUserOut) => {
    setSelectedUser(user);
    setIsResetPasswordOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!selectedUser) return;
    deleteUser(selectedUser.id, {
      onSuccess: () => {
        setIsDeleteOpen(false);
        setSelectedUser(null);
      },
    });
  };

  const handleToggleStatus = (user: IUserOut) => {
    const newStatus: UserActivityStatus = user.activityStatus === 'ACTIVE' ? 'BANNED' : 'ACTIVE';
    updateStatus({
      id: user.id,
      data: { activityStatus: newStatus },
    });
  };

  return {
    // States
    page,
    pageSize,
    search,
    status,
    roleCode,
    isCreateOpen,
    isEditOpen,
    isDeleteOpen,
    isResetPasswordOpen,
    selectedUser,
    usersData: data?.data?.items ?? [],
    totalCount: data?.data?.pagination?.total ?? 0,
    totalPages: data?.data?.pagination?.totalPage ?? 1,
    isLoading,
    isDeleting,
    isUpdatingStatus,

    // Setters / Control
    setPage,
    setPageSize,
    setSearch,
    setStatus,
    setRoleCode,
    setIsCreateOpen,
    setIsEditOpen,
    setIsDeleteOpen,
    setIsResetPasswordOpen,
    setSelectedUser,

    // Handlers
    handleOpenEdit,
    handleOpenDelete,
    handleOpenResetPassword,
    handleConfirmDelete,
    handleToggleStatus,
  };
};

export type IUsersState = ReturnType<typeof useUsersState>;
