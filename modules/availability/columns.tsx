'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Field, FieldLabel } from '@/components/ui/field';
import { Progress } from '@/components/ui/progress';
import { formatCurrency } from '@/lib/utils';
import { IconListDetails } from '@tabler/icons-react';
import type { ColumnDef, Row } from '@tanstack/react-table';
import { availabilityFilterOptions, productAvailabilityConfig, type ProductAvailabilityState } from './display-config';
import type { IAvailabilityProduct } from './type';

export type AvailabilityColumnHandlers = {
  onAdd?: (product: IAvailabilityProduct) => void;
  onViewAssets: (product: IAvailabilityProduct) => void;
};

function ProductAvailabilityActions({
  row,
  handlers,
}: {
  row: Row<IAvailabilityProduct>;
  handlers?: AvailabilityColumnHandlers;
}) {
  return (
    <div className="flex justify-end gap-2">
      <Button size="icon-lg" variant="outline" onClick={() => handlers?.onViewAssets(row.original)}>
        <IconListDetails className="size-4" />
      </Button>
    </div>
  );
}

export const createAvailabilityColumns = (handlers?: AvailabilityColumnHandlers): ColumnDef<IAvailabilityProduct>[] => [
  {
    accessorKey: 'name',
    header: 'Sản phẩm',
    meta: { label: 'Sản phẩm' },
    cell: ({ row }) => (
      <div className="min-w-0">
        <div className="truncate text-sm font-medium text-foreground">{row.original.name}</div>
        <div className="truncate text-xs text-muted-foreground">{row.original.sku}</div>
      </div>
    ),
    enableColumnFilter: false,
  },
  {
    accessorKey: 'dailyPrice',
    header: 'Giá thuê/ngày',
    cell: ({ row }) => <span>{formatCurrency(row.original.dailyPrice)}</span>,
    meta: {
      label: 'Giá thuê',
    },
    enableSorting: false,
    enableColumnFilter: false,
  },
  {
    id: 'inventory',
    header: 'Tồn kho',
    cell: ({ row }) => {
      const { total, available, reserved } = row.original.inventory;
      const percent = total ? Math.round((available / total) * 100) : 0;

      return (
        <Field className="max-w-sm">
          <FieldLabel htmlFor={`availability-progress-${row.original.productId}`}>
            <span className="font-medium">Khả dụng</span>
            <span className="ml-auto text-sm font-medium">
              {available}/{total} máy
            </span>
          </FieldLabel>

          <Progress value={percent} id={`availability-progress-${row.original.productId}`} className="h-2" />

          <span className="text-xs text-muted-foreground">Đã đặt: {reserved} máy</span>
        </Field>
      );
    },
    enableSorting: false,
    enableColumnFilter: false,
  },
  {
    accessorKey: 'availability',
    header: 'Trạng thái',
    cell: ({ row }) => {
      const state: ProductAvailabilityState =
        row.original.inventory.available === 0
          ? 'UNAVAILABLE'
          : row.original.inventory.available <= 2
            ? 'LOW_STOCK'
            : 'AVAILABLE';
      const meta = productAvailabilityConfig[state];

      return (
        <Badge variant="outline" className={meta.className}>
          {meta.label}
        </Badge>
      );
    },
    meta: {
      label: 'Trạng thái',
      variant: 'select',
      options: availabilityFilterOptions,
    },
    enableSorting: false,
  },
  {
    id: 'actions',
    cell: ({ row }) => <ProductAvailabilityActions row={row} handlers={handlers} />,
    meta: {
      disableColumnActions: true,
      isActionsColumn: true,
    },
  },
];
