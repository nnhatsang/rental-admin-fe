'use client';

import { Button } from '@/components/ui/button';
import { useDataTable, type DataTableInstance } from '@/components/ui/data-table';
import { useTableQueryState } from '@/hooks/use-table-query-state';
import { TITLE_PAGE } from '@/utils/consts/title-page.const';
import { IconPlus, IconRefresh } from '@tabler/icons-react';
import type { RowSelectionState } from '@tanstack/react-table';
import { useState } from 'react';
import { columns } from '../columns';
import { useProducts } from '../products-provider';
import type { IGetProductsParams, IProductOut } from '../type';
import { useGetProducts } from './use-get-products';

export interface IProductsLogic {
  table: DataTableInstance<IProductOut>;
}

export const useProductsLogic = (): IProductsLogic => {
  const { setCurrentRow, setOpen } = useProducts();
  const text = TITLE_PAGE.PRODUCTS;
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
  } = useTableQueryState<IGetProductsParams>({
    defaultPageSize: 10,
    columns,
  });
  const { data, isLoading, isFetching, refetch } = useGetProducts(queryParams);

  const table = useDataTable<IProductOut>({
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
    exportFileName: 'products',
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
