'use client';

import { DateTimeRangePicker } from '@/components/shared/date-time-range-picker';
import { Button } from '@/components/ui/button';
import { useDataTable } from '@/components/ui/data-table';
import { useTableQueryState } from '@/hooks/use-table-query-state';
import { formatCurrency, formatDate } from '@/lib/utils';
import { TITLE_PAGE } from '@/utils/consts/title-page.const';
import { zodResolver } from '@hookform/resolvers/zod';
import { IconArrowRight, IconCircleCheckFilled, IconLock, IconPackages, IconRefresh } from '@tabler/icons-react';
import type { RowSelectionState } from '@tanstack/react-table';
import { format } from 'date-fns';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { useAvailability } from '../availability-provider';
import { createAvailabilityColumns } from '../columns';
import { availabilityFilterSchema, type IAvailabilityFilterInput } from '../schema';
import type { IAvailabilityProduct } from '../type';
import { useAvailabilitySocket } from './use-availability-socket';
import { useGetAvailabilityProducts } from './use-get-availability-products';

type AvailabilityTableQueryParams = {
  page: number;
  perPage: number;
  search?: string;
  sort?: 'asc' | 'desc';
  sortBy?: string;
  availability?: 'ALL' | 'AVAILABLE' | 'UNAVAILABLE';
};

const toLocalDateTimeInput = (date: Date) => format(date, "yyyy-MM-dd'T'HH:mm");

const parseLocalDateTime = (value?: string | null) => {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
};

export const useAvailabilityProductsLogic = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { setSelectedProduct, setAssetDrawerOpen, setAssetTab, setRange } = useAvailability();
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [isDatePickerOpen, setDatePickerOpen] = useState(false);
  const form = useForm<IAvailabilityFilterInput>({
    resolver: zodResolver(availabilityFilterSchema),
    defaultValues: {
      startDate: searchParams.get('startDate') ?? '',
      endDate: searchParams.get('endDate') ?? '',
      search: '',
      availability: 'ALL',
    },
    mode: 'onChange',
  });
  const values = useWatch({ control: form.control });

  const handleDateRangeChange = useCallback(
    (range: { from: Date | undefined; to: Date | undefined }) => {
      const nextStartDate = range.from ? toLocalDateTimeInput(range.from) : '';
      const nextEndDate = range.to ? toLocalDateTimeInput(range.to) : '';
      form.setValue('startDate', nextStartDate, { shouldDirty: true, shouldValidate: true });
      form.setValue('endDate', nextEndDate, { shouldDirty: true, shouldValidate: true });

      const params = new URLSearchParams(searchParams.toString());
      params.delete('page');
      if (nextStartDate) params.set('startDate', nextStartDate);
      else params.delete('startDate');
      if (nextEndDate) params.set('endDate', nextEndDate);
      else params.delete('endDate');
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [form, pathname, router, searchParams],
  );

  const handleViewAssets = useCallback(
    (product: IAvailabilityProduct) => {
      setSelectedProduct(product);
      setAssetTab('AVAILABLE');
      setAssetDrawerOpen(true);
    },
    [setAssetDrawerOpen, setAssetTab, setSelectedProduct],
  );

  const columns = useMemo(() => createAvailabilityColumns({ onViewAssets: handleViewAssets }), [handleViewAssets]);
  const tableState = useTableQueryState<AvailabilityTableQueryParams>({ defaultPageSize: 10, columns });
  const parsed = availabilityFilterSchema.safeParse({
    startDate: values.startDate ?? '',
    endDate: values.endDate ?? '',
    search: tableState.queryParams.search,
    availability: tableState.queryParams.availability ?? 'ALL',
  });
  const hasValidTime = parsed.success;
  const startDate = parsed.success ? new Date(parsed.data.startDate).toISOString() : '';
  const endDate = parsed.success ? new Date(parsed.data.endDate).toISOString() : '';
  const params = useMemo(
    () => ({
      ...tableState.queryParams,
      startDate,
      endDate,
      availability: tableState.queryParams.availability ?? 'ALL',
    }),
    [endDate, startDate, tableState.queryParams],
  );
  const productsQuery = useGetAvailabilityProducts(params, hasValidTime);

  useEffect(() => {
    if (hasValidTime) setRange(startDate, endDate);
  }, [endDate, hasValidTime, setRange, startDate]);

  const handleSocketChanged = useCallback(() => {
    if (hasValidTime) void productsQuery.refetch();
  }, [hasValidTime, productsQuery]);
  useAvailabilitySocket(handleSocketChanged);

  const table = useDataTable<IAvailabilityProduct>({
    data: hasValidTime ? (productsQuery.data?.items ?? []) : [],
    columns,
    pageCount: hasValidTime ? (productsQuery.data?.pagination?.totalPage ?? 1) : 1,
    state: {
      pagination: tableState.pagination,
      rowSelection,
      sorting: tableState.sorting,
      columnFilters: tableState.columnFilters,
      globalFilter: tableState.globalFilter,
    },
    getRowId: (row) => row.productId,
    defaultGlobalFilterMode: 'fuzzy',
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    enableRowSelection: false,
    enableGlobalFilter: true,
    enableExport: true,
    exportFileName: 'availability-products',
    title: TITLE_PAGE.AVAILABILITY.INDEX,
    description: hasValidTime
      ? `Khóa lịch đến ${productsQuery.data?.blockedEndDate ? formatDate(productsQuery.data?.blockedEndDate) : '-'}`
      : 'Chọn khoảng thời gian thuê để xem các sản phẩm còn trống.',
    isLoading: hasValidTime && productsQuery.isLoading,
    showLoadingOverlay: productsQuery.isFetching,
    onPaginationChange: tableState.onPaginationChange,
    onRowSelectionChange: setRowSelection,
    onSortingChange: tableState.onSortingChange,
    onColumnFiltersChange: tableState.onColumnFiltersChange,
    onGlobalFilterChange: tableState.onGlobalFilterChange,
    renderToolbarActions: () => (
      <div className="flex flex-col gap-2 xl:flex-row xl:items-start">
        <div className="w-full sm:min-w-[360px] xl:w-[420px]">
          <DateTimeRangePicker
            value={{ from: parseLocalDateTime(values.startDate), to: parseLocalDateTime(values.endDate) }}
            open={isDatePickerOpen}
            setOpen={setDatePickerOpen}
            updateMode="manual"
            onUpdate={({ range }) => handleDateRangeChange(range)}
          />
          {(form.formState.errors.startDate || form.formState.errors.endDate) && (
            <p className="mt-1 text-xs text-destructive">
              {form.formState.errors.startDate?.message ?? form.formState.errors.endDate?.message}
            </p>
          )}
        </div>
        <Button
          variant="outline"
          disabled={!hasValidTime || productsQuery.isFetching}
          onClick={() => void productsQuery.refetch()}
        >
          <IconRefresh className="mr-1.5 size-4" />
          Làm mới
        </Button>
      </div>
    ),
    renderDetailPanel: ({ row }) => {
      const product = row.original;
      const { dailyPrice, halfDayPrice, inventory, rentalPriceTiers = [] } = product;
      return (
        <div className="-mx-6 bg-muted/20 px-6 py-4">
          <div className="grid gap-6 grid-cols-[1.4fr_1fr_220px]">
            <div>
              <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">Giá thuê</h4>{' '}
              <div className="space-y-2 divide-y p-3">
                <div className="flex items-center justify-between text-sm">
                  <span>Giá ngày</span>
                  <span className="font-semibold">{formatCurrency(dailyPrice, { noDecimals: true })}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Giá thuê theo buổi (6 tiếng)</span>
                  <span className="font-semibold">
                    {halfDayPrice ? formatCurrency(halfDayPrice, { noDecimals: true }) : '-'}
                  </span>
                </div>
                {rentalPriceTiers
                  .toSorted((a, b) => (a.minDays ?? 0) - (b.minDays ?? 0))
                  .map(({ minDays = 1, maxDays, dailyPrice }, idx) => {
                    const tierPrice = dailyPrice;

                    const isExactCombo = typeof maxDays === 'number' && maxDays === minDays;
                    const isOpenRange = typeof maxDays !== 'number';

                    const rangeText = isOpenRange
                      ? `Thuê từ ngày thứ ${minDays}`
                      : isExactCombo
                        ? `Thuê ${minDays} ngày`
                        : `Thuê ${minDays} - ${maxDays} ngày`;

                    let displayPrice: string;

                    if (isExactCombo) {
                      // Ví dụ: 2 ngày x 400k = 800k
                      displayPrice = formatCurrency(tierPrice * minDays);
                    } else {
                      // Ví dụ: 2-3 ngày hoặc từ ngày thứ 4 => 400k/ngày
                      displayPrice = `${formatCurrency(tierPrice)}/ngày`;
                    }

                    return (
                      <div key={idx} className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{rangeText}</span>

                        <span className="font-medium">{displayPrice}</span>
                      </div>
                    );
                  })}
              </div>
            </div>
            <div>
              <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">Kho</h4>{' '}
              <div className="space-y-2 divide-y p-3">
                <div className="flex justify-between">
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <IconPackages className="size-4 text-slate-500" />
                    Tổng kho
                  </span>
                  <span>{inventory.total}</span>
                </div>
                <div className="flex justify-between">
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <IconLock className="size-4 text-amber-500" />
                    Đã đặt
                  </span>
                  <span>{inventory.reserved}</span>
                </div>
                <div className="flex justify-between">
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <IconCircleCheckFilled className="size-4 text-emerald-500" />
                    Còn trống
                  </span>
                  <span>{inventory.available}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-center border-l pl-6">
              <Button variant="link" onClick={() => handleViewAssets(product)}>
                Danh sách thiết bị
                <IconArrowRight className="ml-2 size-4" />
              </Button>
            </div>
          </div>
        </div>
      );
    },
  });

  return { table };
};
