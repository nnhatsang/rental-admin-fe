'use client';

import { ProtectedAction } from '@/components/shared/protected-action';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatDate } from '@/lib/utils';
import { PermissionCode } from '@/utils/consts/rbac.const';
import { TITLE_PAGE } from '@/utils/consts/title-page.const';
import { IconDots, IconEdit, IconEye, IconTool, IconTrash } from '@tabler/icons-react';
import type { ColumnDef, Row } from '@tanstack/react-table';
import { useAssetUnits } from './asset-units-provider';
import {
  assetActiveConfig,
  assetActiveOptions,
  assetConditionConfig,
  assetConditionOptions,
  assetStatusConfig,
  assetStatusOptions,
} from './display-config';
import type { IAssetUnitOut } from './type';
import { BadgeCustom } from '@/components/shared/badge-custom';

const text = TITLE_PAGE.ASSET_UNITS;


function AssetUnitActionsRow({ row }: { row: Row<IAssetUnitOut> }) {
  const { setCurrentRow, setOpen } = useAssetUnits();
  const actions = text.ACTIONS;

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="flex h-8 w-8 p-0 data-[state=open]:bg-muted">
          <IconDots className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <ProtectedAction permission={PermissionCode.AssetsRead}>
          <DropdownMenuItem
            onClick={() => {
              setCurrentRow(row.original);
              setOpen('view');
            }}
          >
            <IconEye className="mr-2 size-4" />
            {actions.VIEW}
          </DropdownMenuItem>
        </ProtectedAction>
        <ProtectedAction permission={PermissionCode.AssetsUpdate}>
          <DropdownMenuItem
            onClick={() => {
              setCurrentRow(row.original);
              setOpen('edit');
            }}
          >
            <IconEdit className="mr-2 size-4" />
            {actions.EDIT}
          </DropdownMenuItem>
        </ProtectedAction>
        <ProtectedAction permission={PermissionCode.AssetsUpdate}>
          <DropdownMenuItem
            onClick={() => {
              setCurrentRow(row.original);
              setOpen('status');
            }}
          >
            <IconTool className="mr-2 size-4" />
            {actions.STATUS}
          </DropdownMenuItem>
        </ProtectedAction>
        <ProtectedAction permission={PermissionCode.AssetsDelete}>
          <DropdownMenuItem
            variant="destructive"
            onClick={() => {
              setCurrentRow(row.original);
              setOpen('delete');
            }}
          >
            <IconTrash className="mr-2 size-4" />
            {actions.DELETE}
          </DropdownMenuItem>
        </ProtectedAction>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export const columns: ColumnDef<IAssetUnitOut>[] = [
  {
    accessorKey: 'serialNumber',
    header: text.TABLE.SERIAL_PRODUCT,
    meta: { label: text.TABLE.SERIAL_NUMBER },
    cell: ({ row }) => (
      <div className="min-w-0">
        <div className="truncate text-sm font-medium text-foreground">{row.original.serialNumber} </div>
        <div className="truncate text-xs text-muted-foreground">
          {row.original.product.name} · {row.original.product.sku}
        </div>
      </div>
    ),
    enableColumnFilter: false,
  },
  {
    accessorKey: 'product',
    header: text.TABLE.PRODUCT,
    // cell: ({ row }) => row.original.product.name,
    cell: ({ row }) => (
      <div className="grid gap-2">
        <span>{row.original.product.name}</span>

        {row.original.product.deletedAt && (
          <Badge variant="destructive">{formatDate(row.original.product.deletedAt)}</Badge>
        )}
      </div>
    ),
    enableSorting: false,
    enableColumnFilter: false,
  },
  {
    accessorKey: 'status',
    header: text.TABLE.STATUS,
          cell: ({ row }) => <BadgeCustom status={row.original.status} config={assetStatusConfig} />,
    meta: {
      label: text.TABLE.STATUS,
      variant: 'select',
      options: assetStatusOptions,
    },
  },
  {
    accessorKey: 'condition',
    header: text.TABLE.CONDITION,
    cell: ({ row }) => <BadgeCustom status={row.original.condition} config={assetConditionConfig} />,
    meta: {
      label: text.TABLE.CONDITION,
      variant: 'select',
      options: assetConditionOptions,
    },
  },
  {
    accessorKey: 'isActive',
    header: text.TABLE.ACTIVE_STATE,
    cell: ({ row }) => <BadgeCustom status={String(row.original.isActive)} config={assetActiveConfig} />,
    meta: {
      label: text.TABLE.ACTIVE_STATE,
      variant: 'select',
      options: assetActiveOptions,
    },
  },
  {
    accessorKey: 'updatedAt',
    header: text.TABLE.UPDATED_AT,
    accessorFn: (row) => formatDate(row.updatedAt),
    cell: ({ getValue }) => <span className="text-sm text-muted-foreground">{getValue<string>()}</span>,
    meta: { label: text.TABLE.UPDATED_AT },
    enableColumnFilter: false,
  },
  {
    id: 'actions',
    cell: AssetUnitActionsRow,
    meta: { disableColumnActions: true, isActionsColumn: true },
  },
];
