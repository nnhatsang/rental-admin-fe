'use client';

import { Button } from '@/components/ui/button';
import { useDataTable, type DataTableInstance } from '@/components/ui/data-table';
import { useTableQueryState } from '@/hooks/use-table-query-state';
import { BrandCombobox } from '@/modules/brands/brand-combobox';
import { CategoryCombobox } from '@/modules/categories/category-combobox';
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

function getStringFilterValue(filters: { id: string; value: unknown }[], id: string) {
  const value = filters.find((filter) => filter.id === id)?.value;
  return typeof value === 'string' ? value : '';
}

function getStringArrayFilterValue(filters: { id: string; value: unknown }[], id: string) {
  const value = filters.find((filter) => filter.id === id)?.value;
  return Array.isArray(value) ? value.map(String) : [];
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
    title: text.INDEX,
    description: text.DESCRIPTION,
    isLoading,
    showLoadingOverlay: isFetching,
    onPaginationChange,
    onRowSelectionChange: setRowSelection,
    onSortingChange,
    onColumnFiltersChange,
    onGlobalFilterChange,
    renderToolbarActions: ({ table }) => (
      <div className="flex min-w-0 flex-wrap items-center gap-2">
        <CategoryCombobox
          value={getStringArrayFilterValue(columnFilters, 'categoryIds')}
          onChange={(nextValue) =>
            table.getColumn('categoryIds')?.setFilterValue(nextValue.length > 0 ? nextValue : undefined)
          }
          placeholder="Lọc theo danh mục"
          className="w-full sm:w-60"
        />
        <BrandCombobox
          value={getStringFilterValue(columnFilters, 'brandId')}
          onChange={(nextValue) => table.getColumn('brandId')?.setFilterValue(nextValue || undefined)}
          placeholder="Lọc theo thương hiệu"
          className="w-full sm:w-52"
        />
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
