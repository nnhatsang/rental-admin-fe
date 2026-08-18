'use client';

import { Button } from '@/components/ui/button';
import { useDataTable, type DataTableInstance } from '@/components/ui/data-table';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useTableQueryState } from '@/hooks/use-table-query-state';
import { formatCurrency } from '@/lib/utils';
import { availabilityQueryKeys } from '@/modules/availability/hooks/keys';
import { useGetAvailabilityAssets } from '@/modules/availability/hooks/use-get-availability-assets';
import type { IAvailabilityAsset, IGetAvailabilityAssetsParams } from '@/modules/availability/type';
import { IconPlus } from '@tabler/icons-react';
import { useQueryClient } from '@tanstack/react-query';
import type { ColumnDef, RowSelectionState } from '@tanstack/react-table';
import { useCallback, useMemo, useState } from 'react';
import type { ICustomerOut, IGetCustomersParams } from '../type';
import { rentalOrderCustomerQueryKeys } from './keys';
import { useGetCustomers } from './use-get-customers';

type UseRentalOrderCreateSelectionLogicProps = {
  open: boolean;
  startDate: string;
  endDate: string;
  hasValidRange: boolean;
  selectedCustomerId?: string;
  selectedCustomer?: ICustomerOut | null;
  selectedAssetUnitIds: string[];
  excludeOrderId?: string;
  onAddAssets: (assets: IAvailabilityAsset[]) => void;
  onRemoveAsset: (assetUnitId: string) => void;
  onSelectCustomer?: (customer: ICustomerOut) => void;
  onCreateCustomer?: () => void;
  enableCustomerTable?: boolean;
};

type UseRentalOrderCreateSelectionLogicReturn = {
  assetTable: DataTableInstance<IAvailabilityAsset>;
  customerTable: DataTableInstance<ICustomerOut>;
  bookingHoldAmountPerUnit: number;
  resetTables: () => void;
};

export function useRentalOrderCreateSelectionLogic({
  open,
  startDate,
  endDate,
  hasValidRange,
  selectedCustomerId,
  selectedCustomer,
  selectedAssetUnitIds,
  excludeOrderId,
  onAddAssets,
  onRemoveAsset,
  onSelectCustomer = () => undefined,
  onCreateCustomer = () => undefined,
  enableCustomerTable = true,
}: UseRentalOrderCreateSelectionLogicProps): UseRentalOrderCreateSelectionLogicReturn {
  const queryClient = useQueryClient();
  const [assetRowSelection, setAssetRowSelection] = useState<RowSelectionState>({});
  const selectedAssetUnitIdSet = useMemo(() => new Set(selectedAssetUnitIds), [selectedAssetUnitIds]);
  const selectedAssetRowSelection = useMemo<RowSelectionState>(
    () => Object.fromEntries(selectedAssetUnitIds.map((assetUnitId) => [assetUnitId, true])),
    [selectedAssetUnitIds],
  );
  const customerRowSelection = useMemo<RowSelectionState>(
    () => (selectedCustomerId ? { [selectedCustomerId]: true } : {}),
    [selectedCustomerId],
  );
  const assetTableRowSelection = useMemo<RowSelectionState>(
    () => ({ ...selectedAssetRowSelection, ...assetRowSelection }),
    [assetRowSelection, selectedAssetRowSelection],
  );


  const assetColumns = useMemo<ColumnDef<IAvailabilityAsset>[]>(
    () => [
      {
        accessorKey: 'serialNumber',
        header: 'Máy',
        cell: ({ row }) => (
          <div className="min-w-0">
            <div className="truncate text-sm font-medium">{row.original.serialNumber}</div>
            <div className="truncate text-xs text-muted-foreground">
              {row.original.product.name} {' · '} {row.original.product.sku}
            </div>
          </div>
        ),
      },
      {
        id: 'price',
        header: 'Giá thuê',
        meta: { label: 'Giá thuê' },
        cell: ({ row }) => (
          <div className="text-sm tabular-nums">
            <div>{formatCurrency(row.original.product.dailyPrice)}/ngày</div>
            <div className="text-xs text-muted-foreground">
              Cọc {formatCurrency(row.original.product.depositAmount)}
            </div>
          </div>
        ),
        enableSorting: false,
      },
      {
        id: 'selected',
        header: 'Thao tác',
        meta: { label: 'Thao tác' },
        cell: ({ row }) => {
          const isSelected = selectedAssetUnitIdSet.has(row.original.assetUnitId);

          return (
            <Button
              type="button"
              size="sm"
              variant={isSelected ? 'secondary' : 'outline'}
              onClick={(event) => {
                event.stopPropagation();

                if (isSelected) {
                  onRemoveAsset(row.original.assetUnitId);
                  return;
                }

                onAddAssets([row.original]);
              }}
            >
              {!isSelected && <IconPlus className="mr-1.5 size-4" />}
              {isSelected ? 'Hủy' : 'Thêm'}
            </Button>
          );
        },
        enableSorting: false,
      },
    ],
    [onAddAssets, onRemoveAsset, selectedAssetUnitIdSet],
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
    queryParams: assetQueryParams,
    pagination: assetPagination,
    globalFilter: assetGlobalFilter,
    onPaginationChange: onAssetPaginationChange,
    onGlobalFilterChange: onAssetGlobalFilterChange,
  } = useTableQueryState<IGetAvailabilityAssetsParams>({
    defaultPageSize: 10,
    columns: assetColumns,
    syncToUrl: false,
  });

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

  const resetTables = useCallback(() => {
    setAssetRowSelection({});
    onAssetGlobalFilterChange('');
    onCustomerGlobalFilterChange('');
    onAssetPaginationChange({ pageIndex: 0, pageSize: 10 });
    onCustomerPaginationChange({ pageIndex: 0, pageSize: 10 });
    queryClient.removeQueries({ queryKey: availabilityQueryKeys.assets() });
    queryClient.removeQueries({ queryKey: rentalOrderCustomerQueryKeys.all });
  }, [
    onAssetGlobalFilterChange,
    onAssetPaginationChange,
    onCustomerGlobalFilterChange,
    onCustomerPaginationChange,
    queryClient,
  ]);

  const assetsQuery = useGetAvailabilityAssets(
    {
      ...assetQueryParams,
      availability: 'AVAILABLE',
      startDate,
      endDate,
      excludeOrderId,
    },
    open && hasValidRange,
  );
  const customersQuery = useGetCustomers(
    { ...customerQueryParams, status: 'ACTIVE' },
    enableCustomerTable && open && hasValidRange,
  );

  const assetTable = useDataTable<IAvailabilityAsset>({
    data: open ? (assetsQuery.data?.items ?? []) : [],
    columns: assetColumns,
    pageCount: assetsQuery.data?.pagination?.totalPage ?? 1,
    state: {
      pagination: assetPagination,
      globalFilter: assetGlobalFilter,
      rowSelection: assetTableRowSelection,
    },
    getRowId: (row) => row.assetUnitId,
    manualPagination: true,
    manualFiltering: true,
    // enableRowSelection: (row) => !selectedAssetUnitIdSet.has(row.original.assetUnitId),
    enableRowSelection: false,
    enableGlobalFilter: true,
    enableColumnFilters: false,
    enableSorting: false,

    enableExport: false,
    enableColumnActions: false,
    enableFullscreenToggle: false,

    enableDensityToggle: false,
    enableStickyHeader: true,
    enableStickyFooter: true,
    isLoading: assetsQuery.isLoading,
    showLoadingOverlay: assetsQuery.isFetching,
    onPaginationChange: onAssetPaginationChange,
    onGlobalFilterChange: onAssetGlobalFilterChange,
    onRowSelectionChange: (updater) => {
      setAssetRowSelection((current) => {
        const next = typeof updater === 'function' ? updater(current) : updater;
        return Object.fromEntries(
          Object.entries(next).filter(
            ([assetUnitId, selected]) => selected && !selectedAssetUnitIdSet.has(assetUnitId),
          ),
        );
      });
    },
    onRowDoubleClick: ({ row }) => onAddAssets([row.original]),
    exportFileName: '',
  });

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
    onRowClick: ({ row }) => onSelectCustomer(row.original),
    exportFileName: '',
    renderToolbarInternalActions: () => (
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm text-muted-foreground">
          {selectedCustomer ? (
            <>
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
            </>
          ) : null}
        </span>
        <Button type="button" variant="outline" onClick={onCreateCustomer}>
          <IconPlus className="mr-1.5 size-4" />
          Tạo nhanh
        </Button>
      </div>
    ),
  });

  return {
    assetTable,
    customerTable,
    bookingHoldAmountPerUnit: assetsQuery.data?.bookingHoldAmountPerUnit ?? 0,
    resetTables,
  };
}
