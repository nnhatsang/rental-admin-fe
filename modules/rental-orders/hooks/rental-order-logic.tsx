'use client';

import { DateTimeRangePicker, type DateTimeRange } from '@/components/shared/date-time-range-picker';
import { Button } from '@/components/ui/button';
import { useDataTable, type DataTableInstance } from '@/components/ui/data-table';
import { useTableQueryState } from '@/hooks/use-table-query-state';
import { IconPlus, IconRefresh } from '@tabler/icons-react';
import type { RowSelectionState } from '@tanstack/react-table';
import { format } from 'date-fns';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useMemo, useState } from 'react';
import { columns } from '../columns';
import { useRentalOrders } from '../rental-orders-provider';
import type { IGetRentalOrdersParams, IRentalOrderListItemOut } from '../type';
import { useGetRentalOrders } from './use-get-rental-orders';

export interface IRentalOrdersLogic {
  table: DataTableInstance<IRentalOrderListItemOut>;
}

const parseDateFilter = (value: string) => {
  if (!value) return undefined;
  const [year, month, day] = value.split('-').map(Number);
  if (!year || !month || !day) return undefined;
  const date = new Date(year, month - 1, day);
  return Number.isNaN(date.getTime()) ? undefined : date;
};

const toDateFilterParam = (date: Date | undefined) => (date ? format(date, 'yyyy-MM-dd') : undefined);

export const useRentalOrdersLogic = (): IRentalOrdersLogic => {
  const { setOpen } = useRentalOrders();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [dateRangeOpen, setDateRangeOpen] = useState(false);
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
  } = useTableQueryState<IGetRentalOrdersParams>({
    defaultPageSize: 10,
    columns,
  });
  const fromDateInput = searchParams.get('fromDate') ?? '';
  const toDateInput = searchParams.get('toDate') ?? '';
  const dateRangeFilter = useMemo<DateTimeRange>(
    () => ({
      from: parseDateFilter(fromDateInput),
      to: parseDateFilter(toDateInput),
    }),
    [fromDateInput, toDateInput],
  );
  const rentalOrderQueryParams = useMemo<IGetRentalOrdersParams>(
    () => ({
      ...queryParams,
      fromDate: fromDateInput ? `${fromDateInput}T00:00:00.000` : undefined,
      toDate: toDateInput ? `${toDateInput}T23:59:59.999` : undefined,
    }),
    [fromDateInput, queryParams, toDateInput],
  );
  const { data, isLoading, isFetching, refetch } = useGetRentalOrders(rentalOrderQueryParams);

  const setDateRangeFilter = useCallback(
    (range: DateTimeRange) => {
      const params = new URLSearchParams(searchParams.toString());
      params.delete('page');
      const nextFromDate = toDateFilterParam(range.from);
      const nextToDate = toDateFilterParam(range.to);

      if (nextFromDate) params.set('fromDate', nextFromDate);
      else params.delete('fromDate');

      if (nextToDate) params.set('toDate', nextToDate);
      else params.delete('toDate');

      const nextQuery = params.toString();
      router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const table = useDataTable<IRentalOrderListItemOut>({
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
    exportFileName: 'rental-orders',
    title: 'Quản lý đơn thuê',
    description: 'Theo dõi đơn thuê, trạng thái vận hành và thanh toán',
    isLoading,
    showLoadingOverlay: isFetching,
    onPaginationChange,
    onRowSelectionChange: setRowSelection,
    onSortingChange,
    onColumnFiltersChange,
    onGlobalFilterChange,
    renderToolbarActions: () => (
      <div className="flex flex-wrap items-center gap-2">
        <DateTimeRangePicker
          value={dateRangeFilter}
          onUpdate={({ range }) => setDateRangeFilter(range)}
          open={dateRangeOpen}
          setOpen={setDateRangeOpen}
          updateMode="manual"
          enableTime={false}
          allowPastDates
          className="w-full sm:w-[320px]"
        />
        <Button onClick={() => setOpen('create')}>
          <IconPlus className="mr-1.5 size-4" />
          Tạo đơn thuê
        </Button>
        <Button
          variant="outline"
          disabled={isFetching}
          onClick={() => void refetch()}
        >
          <IconRefresh className="mr-1.5 size-4" />
          Làm mới
        </Button>
      </div>
    ),
  });

  return { table };
};
