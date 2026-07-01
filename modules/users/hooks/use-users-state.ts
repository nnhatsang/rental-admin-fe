'use client';

import { useState, useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  type PaginationState,
  type RowSelectionState,
  type Table,
} from '@tanstack/react-table';
import { useGetUsers } from './use-get-users';
import { useDeleteUser } from './use-delete-user';
import { useUpdateUserActivityStatus } from './use-update-user-activity-status';
import { IUserOut, UserActivityStatus } from '../type';
import { userColumns, type ActionHandlers } from '../columns';

export interface IUsersState {
  table: Table<IUserOut>;
  isLoading: boolean;
  isDeleting: boolean;
  isUpdatingStatus: boolean;
  totalCount: number;
  search: string;
  status: UserActivityStatus | undefined;
  roleCode: string | undefined;
  setSearch: (val: string) => void;
  setStatus: (val: UserActivityStatus | undefined) => void;
  setRoleCode: (val: string | undefined) => void;
  selectedUser: IUserOut | null;
  setSelectedUser: (user: IUserOut | null) => void;
  // Single form dialog (create when selectedUser=null, edit when selectedUser set)
  isFormOpen: boolean;
  setIsFormOpen: (open: boolean) => void;
  isDeleteOpen: boolean;
  setIsDeleteOpen: (open: boolean) => void;
  isResetPasswordOpen: boolean;
  setIsResetPasswordOpen: (open: boolean) => void;
  handleConfirmDelete: () => void;
  handleOpenEdit: (user: IUserOut) => void;
  handleOpenDelete: (user: IUserOut) => void;
  handleOpenResetPassword: (user: IUserOut) => void;
  handleToggleStatus: (user: IUserOut) => void;
}

export const useUsersState = (): IUsersState => {
  const [search, setSearchRaw] = useState('');
  const [status, setStatusRaw] = useState<UserActivityStatus | undefined>(undefined);
  const [roleCode, setRoleCodeRaw] = useState<string | undefined>(undefined);
  const [selectedUser, setSelectedUser] = useState<IUserOut | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isResetPasswordOpen, setIsResetPasswordOpen] = useState(false);
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 });
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const { data, isLoading } = useGetUsers({
    page: pagination.pageIndex + 1,
    perPage: pagination.pageSize,
    search: search || undefined,
    status,
    roleCode,
  });

  const usersData = data?.data?.items ?? [];
  const totalCount = data?.data?.pagination?.total ?? 0;
  const pageCount = data?.data?.pagination?.totalPage ?? 1;

  const { mutate: deleteUser, isPending: isDeleting } = useDeleteUser();
  const { mutate: updateStatus, isPending: isUpdatingStatus } = useUpdateUserActivityStatus();

  const resetPage = () => setPagination((p) => ({ ...p, pageIndex: 0 }));
  const setSearch = (val: string) => { setSearchRaw(val); resetPage(); };
  const setStatus = (val: UserActivityStatus | undefined) => { setStatusRaw(val); resetPage(); };
  const setRoleCode = (val: string | undefined) => { setRoleCodeRaw(val); resetPage(); };

  // Open create: selectedUser=null, open edit: selectedUser=user
  const handleOpenEdit = (user: IUserOut) => { setSelectedUser(user); setIsFormOpen(true); };
  const handleOpenDelete = (user: IUserOut) => { setSelectedUser(user); setIsDeleteOpen(true); };
  const handleOpenResetPassword = (user: IUserOut) => { setSelectedUser(user); setIsResetPasswordOpen(true); };
  const handleToggleStatus = (user: IUserOut) => {
    const newStatus: UserActivityStatus = user.activityStatus === 'ACTIVE' ? 'BANNED' : 'ACTIVE';
    updateStatus({ id: user.id, data: { activityStatus: newStatus } });
  };
  const handleConfirmDelete = () => {
    if (!selectedUser) return;
    deleteUser(selectedUser.id, {
      onSuccess: () => { setIsDeleteOpen(false); setSelectedUser(null); },
    });
  };

  const handlers: ActionHandlers = useMemo(
    () => ({ handleOpenEdit, handleOpenDelete, handleOpenResetPassword, handleToggleStatus }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const table = useReactTable<IUserOut>({
    data: usersData,
    columns: userColumns,
    pageCount,
    state: { pagination, rowSelection },
    getRowId: (row) => row.id,
    manualPagination: true,
    enableRowSelection: true,
    onPaginationChange: setPagination,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    meta: { handlers },
  });

  return {
    table, isLoading, isDeleting, isUpdatingStatus, totalCount,
    search, status, roleCode, setSearch, setStatus, setRoleCode,
    selectedUser, setSelectedUser,
    isFormOpen, setIsFormOpen,
    isDeleteOpen, setIsDeleteOpen,
    isResetPasswordOpen, setIsResetPasswordOpen,
    handleConfirmDelete,
    handleOpenEdit, handleOpenDelete, handleOpenResetPassword, handleToggleStatus,
  };
};
