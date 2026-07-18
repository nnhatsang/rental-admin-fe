'use client';

import { Button } from '@/components/ui/button';
import { useDataTable, type DataTableInstance } from '@/components/ui/data-table';
import { useTableQueryState } from '@/hooks/use-table-query-state';
import { TITLE_PAGE } from '@/utils/consts/title-page.const';
import { IconPlus } from '@tabler/icons-react';
import type { RowSelectionState } from '@tanstack/react-table';
import { useSearchParams } from 'next/navigation';
import { useMemo, useState } from 'react';
import { useAssetUnits } from '../asset-units-provider';
import { columns } from '../columns';
import { ProductCombobox } from '../product-combobox';
import type { IAssetUnitOut, IGetAssetUnitsParams } from '../type';
import { useGetAssetUnits } from './use-get-asset-units';

export interface IAssetUnitsLogic {
  table: DataTableInstance<IAssetUnitOut>;
}

export const useAssetUnitsLogic = (): IAssetUnitsLogic => {
  const { setCurrentRow, setOpen } = useAssetUnits();
  const text = TITLE_PAGE.ASSET_UNITS;
  const searchParams = useSearchParams();
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
  } = useTableQueryState<IGetAssetUnitsParams>({
    defaultPageSize: 10,
    columns,
  });
  const productId = searchParams.get('productId') || undefined;
  const params = useMemo(() => ({ ...queryParams, productId }), [productId, queryParams]);
  const { data, isLoading, isFetching } = useGetAssetUnits(params);

  const table = useDataTable<IAssetUnitOut>({
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
    exportFileName: 'asset-units',
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
        <div className="min-w-68">
          <ProductCombobox placeholder={text.FORM.FILTER_PRODUCT_PLACEHOLDER} syncToUrl />
        </div>
        <Button
          size="lg"
          onClick={() => {
            setCurrentRow(null);
            setOpen('add');
          }}
        >
          <IconPlus className="mr-1.5 size-4" /> {text.ACTIONS.CREATE}
        </Button>
      </div>
    ),
  });

  return { table };
};
