'use client';

import { Button } from '@/components/ui/button';
import { useDataTable, type DataTableInstance } from '@/components/ui/data-table';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useTableQueryState } from '@/hooks/use-table-query-state';
import { useGetCustomers } from '@/modules/customers/hooks/use-get-customers';
import { customerQueryKeys } from '@/modules/customers/hooks/keys';
import type { ICustomerOut, IGetCustomersParams } from '@/modules/customers/type';
import { IconPlus } from '@tabler/icons-react';
import { useQueryClient } from '@tanstack/react-query';
import type { ColumnDef, RowSelectionState } from '@tanstack/react-table';
import { useCallback, useMemo, useState } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import type { ICreateRentalOrderInput } from '../schema';

type UseRentalOrderCreateCustomerSelectionProps = {
  open: boolean;
  hasValidRange: boolean;
  form: UseFormReturn<ICreateRentalOrderInput>;
};

type UseRentalOrderCreateCustomerSelectionReturn = {
  customerTable: DataTableInstance<ICustomerOut>;
  customerDialogOpen: boolean;
  setCustomerDialogOpen: (open: boolean) => void;
  selectedCustomer: ICustomerOut | null;
  handleCustomerCreated: (customer: ICustomerOut) => void;
  resetCustomerSelection: () => void;
};

export function useRentalOrderCreateCustomerSelection({
  open,
  hasValidRange,
  form,
}: UseRentalOrderCreateCustomerSelectionProps): UseRentalOrderCreateCustomerSelectionReturn {
  const queryClient = useQueryClient();
  const [customerDialogOpen, setCustomerDialogOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<ICustomerOut | null>(null);
  const selectedCustomerId = form.watch('customerId');
  const customerRowSelection = useMemo<RowSelectionState>(
    () => (selectedCustomerId ? { [selectedCustomerId]: true } : {}),
    [selectedCustomerId],
  );

  const selectCustomer = useCallback(
    (customer: ICustomerOut) => {
      setSelectedCustomer(customer);
      form.setValue('customerId', customer.id, { shouldDirty: true, shouldValidate: true });
    },
    [form],
  );

  const handleCustomerCreated = useCallback(
    (customer: ICustomerOut) => {
      selectCustomer(customer);
      setCustomerDialogOpen(false);
    },
    [selectCustomer],
  );

  const customerColumns = useMemo<ColumnDef<ICustomerOut>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Khách hàng',
        meta: { label: 'Khách hàng' },
        cell: ({ row }) => (
          <div className="min-w-0">
            <div className="truncate text-sm font-medium">{row.original.name}</div>
            <div className="truncate text-xs text-muted-foreground">
              {[row.original.phone, row.original.email].filter(Boolean).join(' · ') || 'Chưa có thông tin liên hệ'}
            </div>
          </div>
        ),
      },
      {
        accessorKey: 'address',
        header: 'Địa chỉ',
        meta: { label: 'Địa chỉ' },
        cell: ({ row }) => (
          <span className="block truncate text-sm text-muted-foreground">{row.original.address || '-'}</span>
        ),
        enableSorting: false,
      },
    ],
    [],
  );

  const {
    queryParams: customerQueryParams,
    pagination: customerPagination,
    globalFilter: customerGlobalFilter,
    onPaginationChange: onCustomerPaginationChange,
    onGlobalFilterChange: onCustomerGlobalFilterChange,
  } = useTableQueryState<IGetCustomersParams>({
    defaultPageSize: 10,
    columns: customerColumns,
    syncToUrl: false,
  });

  const resetCustomerSelection = useCallback(() => {
    setCustomerDialogOpen(false);
    setSelectedCustomer(null);
    onCustomerGlobalFilterChange('');
    onCustomerPaginationChange({ pageIndex: 0, pageSize: 10 });
    queryClient.removeQueries({ queryKey: customerQueryKeys.all });
  }, [onCustomerGlobalFilterChange, onCustomerPaginationChange, queryClient]);

  const customersQuery = useGetCustomers(
    { ...customerQueryParams, status: 'ACTIVE' },
    open && hasValidRange,
  );

  const customerTable = useDataTable<ICustomerOut>({
    data: open ? (customersQuery.data?.items ?? []) : [],
    columns: customerColumns,
    pageCount: customersQuery.data?.pagination?.totalPage ?? 1,
    state: {
      pagination: customerPagination,
      globalFilter: customerGlobalFilter,
      rowSelection: customerRowSelection,
    },
    getRowId: (row) => row.id,
    manualPagination: true,
    manualFiltering: true,
    enableRowSelection: false,
    enableMultiRowSelection: false,
    enableGlobalFilter: true,
    enableColumnFilters: false,
    enableSorting: false,
    enableExport: false,
    enableColumnActions: false,
    enableFullscreenToggle: false,
    enableDensityToggle: false,
    enableStickyHeader: true,
    enableStickyFooter: true,
    isLoading: customersQuery.isLoading,
    showLoadingOverlay: customersQuery.isFetching,
    onPaginationChange: onCustomerPaginationChange,
    onGlobalFilterChange: onCustomerGlobalFilterChange,
    onRowClick: ({ row }) => selectCustomer(row.original),
    exportFileName: '',
    renderToolbarInternalActions: () => (
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm text-muted-foreground">
          {selectedCustomer ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="inline-flex cursor-help items-center gap-1">
                  Đã chọn khách: <span className="font-medium text-foreground">{selectedCustomer.name}</span>
                </span>
              </TooltipTrigger>
              <TooltipContent align="start" className="max-w-xs">
                <div className="space-y-1 text-sm">
                  <div>
                    <span className="text-muted-foreground">Tên:</span>{' '}
                    <span className="font-medium">{selectedCustomer.name}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">SĐT:</span> {selectedCustomer.phone ?? '-'}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Email:</span> {selectedCustomer.email ?? '-'}
                  </div>
                </div>
              </TooltipContent>
            </Tooltip>
          ) : null}
        </span>
        <Button type="button" variant="outline" onClick={() => setCustomerDialogOpen(true)}>
          <IconPlus className="mr-1.5 size-4" />
          Tạo nhanh
        </Button>
      </div>
    ),
  });

  return {
    customerTable,
    customerDialogOpen,
    setCustomerDialogOpen,
    selectedCustomer,
    handleCustomerCreated,
    resetCustomerSelection,
  };
}
