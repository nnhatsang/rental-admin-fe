'use client';

import { Button } from '@/components/ui/button';
import { useDataTable, type DataTableInstance } from '@/components/ui/data-table';
import { useTableQueryState } from '@/hooks/use-table-query-state';
import { TITLE_PAGE } from '@/utils/consts/title-page.const';
import { IconPlus, IconRefresh } from '@tabler/icons-react';
import type { RowSelectionState } from '@tanstack/react-table';
import { useState } from 'react';
import { columns } from '../columns';
import { useCustomers } from '../customer-provider';
import type { ICustomerOut, IGetCustomersParams } from '../type';
import { useGetCustomers } from './use-get-customers';

export interface ICustomersLogic {
  table: DataTableInstance<ICustomerOut>;
}

export const useCustomersLogic = (): ICustomersLogic => {
  const { setCurrentRow, setOpen } = useCustomers();
  const text = TITLE_PAGE.CUSTOMER;
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
  } = useTableQueryState<IGetCustomersParams>({
    defaultPageSize: 10,
    columns,
  });
  const { data, isLoading, isFetching, refetch } = useGetCustomers(queryParams);

  const table = useDataTable<ICustomerOut>({
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
    exportFileName: 'customers',
    title: text.INDEX,
    description: text.DESCRIPTION,
    isLoading,
    showLoadingOverlay: isFetching,
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
          <IconPlus className="mr-1.5 size-4" /> {text.ACTIONS.CREATE}
        </Button>
        <Button variant="outline" disabled={isFetching} onClick={() => void refetch()}>
          <IconRefresh className="mr-1.5 size-4" />
          Làm mới
        </Button>
      </div>
    ),
  });

  return { table };
};
