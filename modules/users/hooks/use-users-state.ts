'use client';

import { useCallback, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useDataTable, type DataTableInstance } from '@/components/ui/data-table';
import { useTableQueryState } from '@/hooks/use-table-query-state';
import { useGetUsers } from './use-get-users';
import { useDeleteUser } from './use-delete-user';
import { useUpdateUserActivityStatus } from './use-update-user-activity-status';
import { IUserOut, UserActivityStatus } from '../type';
import { userColumns, type ActionHandlers } from '../columns';

const USER_COLUMN_FILTER_QUERY_PARAMS = { activityStatus: 'status' };

function isUserActivityStatus(value: unknown): value is UserActivityStatus {
  return typeof value === 'string' && Object.values(UserActivityStatus).includes(value as UserActivityStatus);
}

export interface IUsersState {
  table: DataTableInstance<IUserOut>;
  isLoading: boolean;
  isDeleting: boolean;
  isUpdatingStatus: boolean;
  totalCount: number;
  selectedUser: IUserOut | null;
  setSelectedUser: (user: IUserOut | null) => void;
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
  data: IUserOut[];
}

export const useUsersState = (): IUsersState => {
  const searchParams = useSearchParams();
  const initialStatus = searchParams.get('status');
  const initialColumnFilters = useMemo(
    () => (isUserActivityStatus(initialStatus) ? [{ id: 'activityStatus', value: initialStatus }] : []),
    [initialStatus],
  );

  const [selectedUser, setSelectedUser] = useState<IUserOut | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isResetPasswordOpen, setIsResetPasswordOpen] = useState(false);

  const tableQuery = useTableQueryState({
    initialPageSize: 10,
    initialColumnFilters,
    columnFilterQueryParamMap: USER_COLUMN_FILTER_QUERY_PARAMS,
    syncUrl: true,
  });
  const { clearSelection } = tableQuery;

  const statusFilter = useMemo(() => {
    const value = tableQuery.columnFilters.find((filter) => filter.id === 'activityStatus')?.value;
    return isUserActivityStatus(value) ? value : undefined;
  }, [tableQuery.columnFilters]);

  const params = useMemo(
    () => ({
      ...tableQuery.queryParams,
      status: statusFilter,
    }),
    [statusFilter, tableQuery.queryParams],
  );

  const { data, isLoading, isFetching } = useGetUsers(params);

  const usersData = data?.data?.items ?? [];
  const totalCount = data?.data?.pagination?.total ?? 0;
  const pageCount = data?.data?.pagination?.totalPage ?? 1;

  const { mutate: deleteUser, isPending: isDeleting } = useDeleteUser();
  const { mutate: updateStatus, isPending: isUpdatingStatus } = useUpdateUserActivityStatus();

  const handleOpenEdit = useCallback((user: IUserOut) => {
    setSelectedUser(user);
    setIsFormOpen(true);
  }, []);

  const handleOpenDelete = useCallback((user: IUserOut) => {
    setSelectedUser(user);
    setIsDeleteOpen(true);
  }, []);

  const handleOpenResetPassword = useCallback((user: IUserOut) => {
    setSelectedUser(user);
    setIsResetPasswordOpen(true);
  }, []);

  const handleToggleStatus = useCallback(
    (user: IUserOut) => {
      const activityStatus: UserActivityStatus = user.activityStatus === 'ACTIVE' ? 'BANNED' : 'ACTIVE';
      updateStatus({ id: user.id, data: { activityStatus } });
    },
    [updateStatus],
  );

  const handleConfirmDelete = useCallback(() => {
    if (!selectedUser) return;

    deleteUser(selectedUser.id, {
      onSuccess: () => {
        setIsDeleteOpen(false);
        setSelectedUser(null);
        clearSelection();
      },
    });
  }, [clearSelection, deleteUser, selectedUser]);

  const handlers: ActionHandlers = useMemo(
    () => ({ handleOpenEdit, handleOpenDelete, handleOpenResetPassword, handleToggleStatus }),
    [handleOpenDelete, handleOpenEdit, handleOpenResetPassword, handleToggleStatus],
  );

  const table = useDataTable<IUserOut>({
    data: usersData,
    columns: userColumns,
    pageCount,
    state: {
      pagination: tableQuery.pagination,
      rowSelection: tableQuery.rowSelection,
      sorting: tableQuery.sorting,
      columnFilters: tableQuery.columnFilters,
      globalFilter: tableQuery.globalFilter,
    },
    getRowId: (row) => row.id,
    defaultGlobalFilterMode: 'fuzzy',
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    enableRowSelection: true,
    enableColumnFilters: true,
    enableColumnFilterModes: false,
    enableGlobalFilter: true,
    enableEditing: false,
    enableExport: true,
    exportFileName: 'users',
    isLoading,
    showLoadingOverlay: isFetching,
    onPaginationChange: tableQuery.onPaginationChange,
    onRowSelectionChange: tableQuery.onRowSelectionChange,
    onSortingChange: tableQuery.onSortingChange,
    onColumnFiltersChange: tableQuery.onColumnFiltersChange,
    onGlobalFilterChange: tableQuery.onGlobalFilterChange,
    meta: { handlers },
  });

  return {
    table,
    isLoading,
    isDeleting,
    isUpdatingStatus,
    totalCount,
    selectedUser,
    setSelectedUser,
    isFormOpen,
    setIsFormOpen,
    isDeleteOpen,
    setIsDeleteOpen,
    isResetPasswordOpen,
    setIsResetPasswordOpen,
    handleConfirmDelete,
    handleOpenEdit,
    handleOpenDelete,
    handleOpenResetPassword,
    handleToggleStatus,
    data: usersData,
  };
};
