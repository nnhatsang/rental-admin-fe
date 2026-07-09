'use client';

import { useCallback, useMemo, useState } from 'react';
import type { RowSelectionState } from '@tanstack/react-table';
import { useDataTable, type DataTableInstance } from '@/components/ui/data-table';
import { useTableQueryState } from '@/hooks/use-table-query-state';
import { roleColumns, type RoleActionHandlers } from '../columns';
import { useDeleteRole } from './use-delete-role';
import { useGetRoles } from './use-get-roles';
import type { IRoleOut } from '../type';

export interface IRolesState {
  table: DataTableInstance<IRoleOut>;
  isLoading: boolean;
  isDeleting: boolean;
  totalCount: number;
  selectedRole: IRoleOut | null;
  setSelectedRole: (role: IRoleOut | null) => void;
  isFormOpen: boolean;
  setIsFormOpen: (open: boolean) => void;
  isDeleteOpen: boolean;
  setIsDeleteOpen: (open: boolean) => void;
  handleConfirmDelete: () => void;
  handleOpenEdit: (role: IRoleOut) => void;
  handleOpenDelete: (role: IRoleOut) => void;
  data: IRoleOut[];
}

export const useRolesState = (): IRolesState => {
  const [selectedRole, setSelectedRole] = useState<IRoleOut | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  // Module UI state stays local. `useTableQueryState` only owns URL/API query
  // state, so selection is kept here for bulk/delete flows.
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  // TODO(use-table-url): when the URL-state hook is finalized, this module only
  // needs to remap query/filter config here; table UI state should remain local.
  const tableQuery = useTableQueryState({
    defaultPageSize: 10,
  });

  const { data, isLoading, isFetching } = useGetRoles(tableQuery.queryParams);
  const rolesData = data?.data?.items ?? [];
  const totalCount = data?.data?.pagination?.total ?? 0;
  const pageCount = data?.data?.pagination?.totalPage ?? 1;

  const { mutate: deleteRole, isPending: isDeleting } = useDeleteRole();

  const handleOpenEdit = useCallback((role: IRoleOut) => {
    if (role.isSystem) return;
    setSelectedRole(role);
    setIsFormOpen(true);
  }, []);

  const handleOpenDelete = useCallback((role: IRoleOut) => {
    if (role.isSystem) return;
    setSelectedRole(role);
    setIsDeleteOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(() => {
    if (!selectedRole) return;

    deleteRole([selectedRole.id], {
      onSuccess: () => {
        setIsDeleteOpen(false);
        setSelectedRole(null);
        setRowSelection({});
      },
    });
  }, [deleteRole, selectedRole]);

  const handlers: RoleActionHandlers = useMemo(
    () => ({ handleOpenEdit, handleOpenDelete }),
    [handleOpenDelete, handleOpenEdit],
  );

  const table = useDataTable<IRoleOut>({
    data: rolesData,
    columns: roleColumns,
    pageCount,
    state: {
      pagination: tableQuery.pagination,
      rowSelection,
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
    enableColumnFilters: false,
    enableColumnFilterModes: false,
    enableGlobalFilter: true,
    enableExport: true,
    exportFileName: 'roles',
    isLoading,
    showLoadingOverlay: isFetching,
    onPaginationChange: tableQuery.onPaginationChange,
    onRowSelectionChange: setRowSelection,
    onSortingChange: tableQuery.onSortingChange,
    onColumnFiltersChange: tableQuery.onColumnFiltersChange,
    onGlobalFilterChange: tableQuery.onGlobalFilterChange,
    meta: { handlers },
  });

  return {
    table,
    isLoading,
    isDeleting,
    totalCount,
    selectedRole,
    setSelectedRole,
    isFormOpen,
    setIsFormOpen,
    isDeleteOpen,
    setIsDeleteOpen,
    handleConfirmDelete,
    handleOpenEdit,
    handleOpenDelete,
    data: rolesData,
  };
};
