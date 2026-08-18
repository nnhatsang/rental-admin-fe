'use client';

import { Button } from '@/components/ui/button';
import { useDataTable, type DataTableInstance } from '@/components/ui/data-table';
import { useTableQueryState } from '@/hooks/use-table-query-state';
import { formatCurrency } from '@/lib/utils';
import { availabilityQueryKeys } from '@/modules/availability/hooks/keys';
import { useGetAvailabilityAssets } from '@/modules/availability/hooks/use-get-availability-assets';
import type { IAvailabilityAsset, IGetAvailabilityAssetsParams } from '@/modules/availability/type';
import { IconPlus } from '@tabler/icons-react';
import { useQueryClient } from '@tanstack/react-query';
import type { ColumnDef, RowSelectionState } from '@tanstack/react-table';
import { useCallback, useMemo, useState } from 'react';
import type { UseFieldArrayAppend, UseFieldArrayRemove } from 'react-hook-form';
import type { ICreateRentalOrderInput } from '../schema';
import type { OrderLineDraft } from '../type';
import { createOrderLineDraft } from '../utils';

type UseRentalOrderCreateAssetSelectionProps = {
  open: boolean;
  startDate: string;
  endDate: string;
  hasValidRange: boolean;
  items: OrderLineDraft[];
  append: UseFieldArrayAppend<ICreateRentalOrderInput, 'items'>;
  remove: UseFieldArrayRemove;
  resetAvailability: () => void;
};

type UseRentalOrderCreateAssetSelectionReturn = {
  assetTable: DataTableInstance<IAvailabilityAsset>;
  bookingHoldAmountPerUnit: number;
  removeAssetByLineId: (lineId: string) => void;
  resetAssetTable: () => void;
};

export function useRentalOrderCreateAssetSelection({
  open,
  startDate,
  endDate,
  hasValidRange,
  items,
  append,
  remove,
  resetAvailability,
}: UseRentalOrderCreateAssetSelectionProps): UseRentalOrderCreateAssetSelectionReturn {
  const queryClient = useQueryClient();
  const [assetRowSelection, setAssetRowSelection] = useState<RowSelectionState>({});
  const selectedAssetUnitIds = useMemo(() => items.map((item) => item.assetUnitId), [items]);
  const selectedAssetUnitIdSet = useMemo(() => new Set(selectedAssetUnitIds), [selectedAssetUnitIds]);
  const selectedAssetRowSelection = useMemo<RowSelectionState>(
    () => Object.fromEntries(selectedAssetUnitIds.map((assetUnitId) => [assetUnitId, true])),
    [selectedAssetUnitIds],
  );
  const assetTableRowSelection = useMemo<RowSelectionState>(
    () => ({ ...selectedAssetRowSelection, ...assetRowSelection }),
    [assetRowSelection, selectedAssetRowSelection],
  );

  const removeAssetByAssetUnitId = useCallback(
    (assetUnitId: string) => {
      const index = items.findIndex((item) => item.assetUnitId === assetUnitId);
      if (index === -1) return;

      remove(index);
      resetAvailability();
    },
    [items, remove, resetAvailability],
  );

  const addAssets = useCallback(
    (assets: IAvailabilityAsset[]) => {
      const existingAssetUnitIds = new Set(items.map((item) => item.assetUnitId));
      const nextLines: OrderLineDraft[] = [];

      assets.forEach((asset) => {
        if (asset.availability !== 'AVAILABLE') return;
        if (existingAssetUnitIds.has(asset.assetUnitId)) return;

        existingAssetUnitIds.add(asset.assetUnitId);
        nextLines.push(createOrderLineDraft(asset));
      });

      if (!nextLines.length) return;

      append(nextLines);
      resetAvailability();
    },
    [append, items, resetAvailability],
  );

  const removeAssetByLineId = useCallback(
    (lineId: string) => {
      const index = items.findIndex((item) => item.id === lineId);
      if (index === -1) return;

      remove(index);
      resetAvailability();
    },
    [items, remove, resetAvailability],
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
                  removeAssetByAssetUnitId(row.original.assetUnitId);
                  return;
                }

                addAssets([row.original]);
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
    [addAssets, removeAssetByAssetUnitId, selectedAssetUnitIdSet],
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

  const resetAssetTable = useCallback(() => {
    setAssetRowSelection({});
    onAssetGlobalFilterChange('');
    onAssetPaginationChange({ pageIndex: 0, pageSize: 10 });
    queryClient.removeQueries({ queryKey: availabilityQueryKeys.assets() });
  }, [onAssetGlobalFilterChange, onAssetPaginationChange, queryClient]);

  const assetsQuery = useGetAvailabilityAssets(
    {
      ...assetQueryParams,
      availability: 'AVAILABLE',
      startDate,
      endDate,
    },
    open && hasValidRange,
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
    onRowDoubleClick: ({ row }) => addAssets([row.original]),
    exportFileName: '',
  });

  return {
    assetTable,
    bookingHoldAmountPerUnit: assetsQuery.data?.bookingHoldAmountPerUnit ?? 0,
    removeAssetByLineId,
    resetAssetTable,
  };
}
