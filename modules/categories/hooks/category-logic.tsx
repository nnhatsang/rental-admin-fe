'use client';

import { Button } from '@/components/ui/button';
import { useDataTable, type DataTableInstance } from '@/components/ui/data-table';
import { useTableQueryState } from '@/hooks/use-table-query-state';
import { TITLE_PAGE } from '@/utils/consts/title-page.const';
import { IconPlus, IconRefresh } from '@tabler/icons-react';
import type { RowSelectionState } from '@tanstack/react-table';
import { useCallback, useEffect, useState } from 'react';

import { columns } from '../columns';
import { useCategories } from '../category-provider';
import type { ICategoryOut, IGetCategoriesParams } from '../type';
import { useGetCategories } from './use-get-categories';
import { useReorderCategories } from './use-reorder-categories';

const CATEGORY_LIST_PAGE_SIZE = 100;

export interface ICategoriesLogic {
  table: DataTableInstance<ICategoryOut>;
}

export const useCategoriesLogic = (): ICategoriesLogic => {
  const { setCurrentRow, setOpen } = useCategories();
  const text = TITLE_PAGE.CATEGORY;
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [orderedData, setOrderedData] = useState<ICategoryOut[]>([]);
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
  } = useTableQueryState<IGetCategoriesParams>({
    defaultPageSize: CATEGORY_LIST_PAGE_SIZE,
    columns,
  });
  const { data, isLoading, isFetching, refetch } = useGetCategories(queryParams);
  const reorderMutation = useReorderCategories();

  useEffect(() => {
    setOrderedData(data?.items ?? []);
  }, [data?.items]);

  const isOrderableView =
    !queryParams.search &&
    queryParams.isActive === undefined &&
    sorting.length === 0 &&
    Boolean(data && data.items.length === data.pagination.total);

  const handleRowOrderChange = useCallback(
    (activeRowId: string, overRowId: string) => {
      if (!isOrderableView || reorderMutation.isPending || activeRowId === overRowId) return;

      const fromIndex = orderedData.findIndex((row) => row.id === activeRowId);
      const toIndex = orderedData.findIndex((row) => row.id === overRowId);
      if (fromIndex < 0 || toIndex < 0) return;

      const previousData = orderedData;
      const nextData = [...orderedData];
      const [movedRow] = nextData.splice(fromIndex, 1);
      if (!movedRow) return;

      nextData.splice(toIndex, 0, movedRow);
      const normalizedData = nextData.map((row, order) => ({ ...row, order }));
      setOrderedData(normalizedData);

      reorderMutation.mutate(
        { categoryIds: normalizedData.map((row) => row.id) },
        { onError: () => setOrderedData(previousData) },
      );
    },
    [isOrderableView, orderedData, reorderMutation],
  );

  const table = useDataTable<ICategoryOut>({
    data: data ? orderedData : [],
    columns,
    pageCount: data?.pagination?.totalPage ?? 1,
    state: { pagination, rowSelection, sorting, columnFilters, globalFilter },
    getRowId: (row) => row.id,
    defaultGlobalFilterMode: 'fuzzy',
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    enablePagination: false,
    enableRowSelection: true,
    enableRowOrdering: isOrderableView && !reorderMutation.isPending,
    enableGlobalFilter: true,
    title: text.INDEX,
    description: text.DESCRIPTION,
    isLoading,
    isSaving: reorderMutation.isPending,
    showLoadingOverlay: isFetching,
    onPaginationChange,
    onRowSelectionChange: setRowSelection,
    onRowOrderChange: handleRowOrderChange,
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
          <IconRefresh className="mr-1.5 size-4" /> Làm mới
        </Button>
      </div>
    ),
  });

  return { table };
};
