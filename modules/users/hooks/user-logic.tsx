'use client';

import { Button } from '@/components/ui/button';
import { useDataTable, type DataTableInstance } from '@/components/ui/data-table';
import { useTableQueryState } from '@/hooks/use-table-query-state';
import { TITLE_PAGE } from '@/utils/consts/title-page.const';
import { IconPlus } from '@tabler/icons-react';
import type { RowSelectionState } from '@tanstack/react-table';
import { useState } from 'react';
import { columns } from '../columns';
import { IGetUsersParams, IUserOut } from '../type';
import { useUsers } from '../users-provider';
import { useGetUsers } from './use-get-users';

export interface IUsersLogic {
  table: DataTableInstance<IUserOut>;
}

export const useUsersState = (): IUsersLogic => {
  const { setCurrentRow, setOpen } = useUsers();
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
  } = useTableQueryState<IGetUsersParams>({
    defaultPageSize: 10,
    columns,
  });

  const { data, isLoading, isFetching } = useGetUsers(queryParams);

  const table = useDataTable<IUserOut>({
    data: data?.items ?? [],
    columns,
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
    exportFileName: 'users',
    title: TITLE_PAGE.USERS.INDEX,
    description: TITLE_PAGE.USERS.DESCRIPTION,
    isLoading,
    showLoadingOverlay: isFetching,
    onPaginationChange,
    onRowSelectionChange: setRowSelection,
    onSortingChange,
    onColumnFiltersChange,
    onGlobalFilterChange,
    renderToolbarActions: () => (
      <Button
        size="lg"
        onClick={() => {
          setCurrentRow(null);
          setOpen('add');
        }}
      >
        <IconPlus className="mr-1.5 size-4" /> {TITLE_PAGE.USERS.ACTIONS.CREATE}
      </Button>
    ),
  });

  return {
    table,
  };
};
