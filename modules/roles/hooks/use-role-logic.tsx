'use client';
import { useDataTable, type DataTableInstance } from '@/components/ui/data-table';
import { useRoles } from '../roles-provider';
import { IGetRolesParams, IRoleOut } from '../type';
import { Button } from '@/components/ui/button';
import { useTableQueryState } from '@/hooks/use-table-query-state';
import { TITLE_PAGE } from '@/utils/consts/title-page.const';
import { IconPlus, IconRefresh } from '@tabler/icons-react';
import { RowSelectionState } from '@tanstack/react-table';
import { useState } from 'react';
import columns from '../columns';
import { useGetRoles } from './use-get-roles';

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
  const { data, isLoading, isFetching, refetch } = useGetRoles(queryParams);
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
    initialState: {
      columnPinning: {
        right: ['actions'],
      },
    },
    onPaginationChange,
    onRowSelectionChange: setRowSelection,
    onSortingChange,
    onColumnFiltersChange,
    onGlobalFilterChange,
    renderToolbarActions: () => (
      <div className="flex flex-wrap items-center gap-2">
        <Button
          onClick={() => {
            setCurrentRow(null);
            setOpen('add');
          }}
        >
          <IconPlus className="mr-1.5 size-4" /> {TITLE_PAGE.ROLES.ACTIONS.CREATE}
        </Button>
        <Button variant="outline" disabled={isFetching} onClick={() => void refetch()}>
          <IconRefresh className="mr-1.5 size-4" />
          Làm mới
        </Button>
      </div>
    ),
  });

  return {
    table,
  };
};
