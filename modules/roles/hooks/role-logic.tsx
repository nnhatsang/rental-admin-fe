'use client';
import { IGetRolesParams, IRoleOut } from '../type';
import { useRoles } from '../roles-provider';
import { useDataTable, type DataTableInstance } from '@/components/ui/data-table';

import { useTableQueryState } from '@/hooks/use-table-query-state';
import { useState } from 'react';
import { RowSelectionState } from '@tanstack/react-table';
import { useGetRoles } from './use-get-roles';
import { TITLE_PAGE } from '@/utils/consts/title-page.const';
import columns from '../columns';

export interface IRoleLogic {
  table: DataTableInstance<IRoleOut>;
}
export const useRoleLogic = (): IRoleLogic => {
  const { setCurrentRow, setOpen } = useRoles();
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const {
    queryParams,
    pagination,
    sorting,
    columnFilters,
    globalFilter,
    onColumnFiltersChange,
    onGlobalFilterChange,
    onPaginationChange,
    onSortingChange,
  } = useTableQueryState<IGetRolesParams>({
    defaultPageSize: 10,
    columns,
  });
  const { data, isLoading, isFetching } = useGetRoles(queryParams);
  const table = useDataTable<IRoleOut>({
    data: data?.items ?? [],
    columns: columns,
    pageCount: data?.pagination?.totalPage ?? 1,
    state: {
      pagination,
      rowSelection,
      sorting,
      columnFilters,
      globalFilter,
    },
    getRowId: (row) => row.id,
    defaultGlobalFilterMode: 'fuzzy',

    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    enableRowSelection: true,
    enableGlobalFilter: true,
    enableExport: true,
    exportFileName: 'roles',
    title: TITLE_PAGE.ROLES.INDEX,
    description: TITLE_PAGE.ROLES.DESCRIPTION,
    isLoading,
    showLoadingOverlay: isFetching,
    onPaginationChange,
    onRowSelectionChange: setRowSelection,
    onSortingChange,
    onColumnFiltersChange,
    onGlobalFilterChange,
    renderToolbarActions: () => (
      <></>
      // <Button
      //   size="lg"
      //   onClick={() => {
      //     setCurrentRow(null);
      //     setOpen('add');
      //   }}
      // >
      //   <IconPlus className="mr-1.5 size-4" /> {TITLE_PAGE.USERS.ACTIONS.CREATE}
      // </Button>
    ),
  });
  return {
    table,
  };
};
