'use client';

import { DateTimeRangePicker, type DateTimeRange } from '@/components/shared/date-time-range-picker';
import { ProtectedAction } from '@/components/shared/protected-action';
import { CustomerCombobox, type CustomerOption } from '@/modules/customers/customer-combobox';
import { useGetCustomerById } from '@/modules/customers/hooks/use-get-customer-by-id';
import { Button } from '@/components/ui/button';
import { useDataTable, type DataTableInstance } from '@/components/ui/data-table';
import { useTableQueryState } from '@/hooks/use-table-query-state';
import { PermissionCode } from '@/utils/consts/rbac.const';
import { IconPlus, IconRefresh } from '@tabler/icons-react';
import type { RowSelectionState } from '@tanstack/react-table';
import { endOfWeek, format, startOfWeek } from 'date-fns';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { RentalOrderContextMenuItems } from '../components/actions';
import { columns } from '../columns';
import type { IGetRentalOrdersParams, RentalOrderListItem } from '../model';
import { useRentalOrders } from '../rental-orders-provider';
import { useGetRentalOrders } from './queries';

const parseDateFilter = (value: string) => {
  if (!value) return undefined;

  const [year, month, day] = value.split('-').map(Number);
  if (!year || !month || !day) return undefined;

  const date = new Date(year, month - 1, day);
  return Number.isNaN(date.getTime()) ? undefined : date;
};

const toDateFilterParam = (date: Date | undefined) => (date ? format(date, 'yyyy-MM-dd') : undefined);
const RENTAL_ORDER_WEEK_STARTS_ON = 1 as const;

const getCurrentWeekRange = () => {
  const today = new Date();

  return {
    from: startOfWeek(today, { weekStartsOn: RENTAL_ORDER_WEEK_STARTS_ON }),
    to: endOfWeek(today, { weekStartsOn: RENTAL_ORDER_WEEK_STARTS_ON }),
  };
};

export function useRentalOrdersLogic(): { table: DataTableInstance<RentalOrderListItem> } {
  const { setCurrentRow, setOpen } = useRentalOrders();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [dateRangeOpen, setDateRangeOpen] = useState(false);
  const defaultWeekRange = useMemo(getCurrentWeekRange, []);
  const defaultWeekFromDate = toDateFilterParam(defaultWeekRange.from) ?? '';
  const defaultWeekToDate = toDateFilterParam(defaultWeekRange.to) ?? '';
  const defaultWeekSyncedRef = useRef(false);
  const detailDeepLinkRef = useRef<string | null>(null);
  const tableState = useTableQueryState<IGetRentalOrdersParams>({ defaultPageSize: 10, columns });

  const customerIdInput = searchParams.get('customerId') ?? '';
  const fromDateInput = searchParams.get('fromDate') ?? '';
  const toDateInput = searchParams.get('toDate') ?? '';
  const detailOrderIdInput = searchParams.get('detailOrderId') ?? '';
  const detailOrderCodeInput = searchParams.get('detailOrderCode') ?? '';
  const hasExplicitDateFilter = Boolean(fromDateInput || toDateInput);
  const effectiveFromDateInput = fromDateInput || (!hasExplicitDateFilter ? defaultWeekFromDate : '');
  const effectiveToDateInput = toDateInput || (!hasExplicitDateFilter ? defaultWeekToDate : '');
  const selectedCustomerQuery = useGetCustomerById(customerIdInput || undefined);
  const selectedCustomer = useMemo<CustomerOption | null>(() => {
    const customer = selectedCustomerQuery.data;
    return customer ? { id: customer.id, name: customer.name, phone: customer.phone } : null;
  }, [selectedCustomerQuery.data]);

  const dateRangeFilter = useMemo<DateTimeRange>(
    () => ({
      from: parseDateFilter(effectiveFromDateInput),
      to: parseDateFilter(effectiveToDateInput),
    }),
    [effectiveFromDateInput, effectiveToDateInput],
  );

  const rentalOrderQueryParams = useMemo<IGetRentalOrdersParams>(
    () => ({
      ...tableState.queryParams,
      customerId: customerIdInput || undefined,
      fromDate: effectiveFromDateInput ? `${effectiveFromDateInput}T00:00:00.000` : undefined,
      toDate: effectiveToDateInput ? `${effectiveToDateInput}T23:59:59.999` : undefined,
    }),
    [customerIdInput, effectiveFromDateInput, effectiveToDateInput, tableState.queryParams],
  );

  const { data, isLoading, isFetching, refetch } = useGetRentalOrders(rentalOrderQueryParams);

  useEffect(() => {
    if (defaultWeekSyncedRef.current) return;
    defaultWeekSyncedRef.current = true;

    if (hasExplicitDateFilter) return;

    const params = new URLSearchParams(searchParams.toString());
    params.set('fromDate', defaultWeekFromDate);
    params.set('toDate', defaultWeekToDate);

    const nextQuery = params.toString();
    router.replace(`${pathname}?${nextQuery}`, { scroll: false });
  }, [defaultWeekFromDate, defaultWeekToDate, hasExplicitDateFilter, pathname, router, searchParams]);

  useEffect(() => {
    if (!detailOrderIdInput || detailDeepLinkRef.current === detailOrderIdInput) return;

    detailDeepLinkRef.current = detailOrderIdInput;
    setCurrentRow({ id: detailOrderIdInput, code: detailOrderCodeInput || detailOrderIdInput });
    setOpen('detail');

    const params = new URLSearchParams(searchParams.toString());
    params.delete('detailOrderId');
    params.delete('detailOrderCode');
    const nextQuery = params.toString();
    router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, { scroll: false });
  }, [detailOrderCodeInput, detailOrderIdInput, pathname, router, searchParams, setCurrentRow, setOpen]);

  const setCustomerFilter = useCallback(
    (customerId: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.delete('page');

      if (customerId) params.set('customerId', customerId);
      else params.delete('customerId');

      const nextQuery = params.toString();
      router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams],
  );
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

  const clearAllFilters = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    for (const key of [
      'page',
      'search',
      'status',
      'settlementStatus',
      'source',
      'pickupMethod',
      'customerId',
      'fromDate',
      'toDate',
    ]) {
      params.delete(key);
    }

    const nextQuery = params.toString();
    router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, { scroll: false });
  }, [pathname, router, searchParams]);

  const hasActiveFilters = Boolean(
    customerIdInput ||
    fromDateInput ||
    toDateInput ||
    searchParams.get('search') ||
    searchParams.get('status') ||
    searchParams.get('settlementStatus') ||
    searchParams.get('source') ||
    searchParams.get('pickupMethod'),
  );
  const table = useDataTable<RentalOrderListItem>({
    data: data?.items ?? [],
    columns,
    pageCount: data?.pagination.totalPage ?? 1,
    state: {
      pagination: tableState.pagination,
      rowSelection,
      sorting: tableState.sorting,
      columnFilters: tableState.columnFilters,
      globalFilter: tableState.globalFilter,
    },
    getRowId: (row) => row.id,
    defaultGlobalFilterMode: 'fuzzy',
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    enableRowContextMenu: true,
    renderRowContextMenuItems: ({ row }) => <RentalOrderContextMenuItems row={row} />,
    hasExternalFilters: hasActiveFilters,
    onClearExternalFilters: clearAllFilters,
    enableRowSelection: true,
    enableGlobalFilter: true,
    title: 'Quản lý đơn thuê',
    description: 'Theo dõi lịch thuê, trạng thái vận hành, thanh toán và quyết toán',
    isLoading,
    showLoadingOverlay: isFetching,
    onPaginationChange: tableState.onPaginationChange,
    onRowSelectionChange: setRowSelection,
    onSortingChange: tableState.onSortingChange,
    onColumnFiltersChange: tableState.onColumnFiltersChange,
    onGlobalFilterChange: tableState.onGlobalFilterChange,
    renderToolbarActions: () => (
      <div className="flex flex-wrap items-center gap-2">

        <CustomerCombobox
          value={customerIdInput || undefined}
          selectedCustomer={selectedCustomer}
          onCustomerChange={(customer) => setCustomerFilter(customer?.id ?? '')}
          placeholder="Lọc theo khách hàng..."
          className="w-full sm:w-[340px]"
        />

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
        <ProtectedAction permission={PermissionCode.OrdersCreate}>
          <Button
            onClick={() => {
              setCurrentRow(null);
              setOpen('create');
            }}
          >
            <IconPlus aria-hidden="true" data-icon="inline-start" />
            Tạo đơn thuê
          </Button>
        </ProtectedAction>
        <Button variant="outline" disabled={isFetching} onClick={() => void refetch()}>
          <IconRefresh aria-hidden="true" data-icon="inline-start" />
          Làm mới
        </Button>
      </div>
    ),
  });

  return { table };
}
