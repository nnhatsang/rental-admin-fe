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
import { AssetCondition, AssetStatus, type IAssetUnitOut } from './type';

const text = TITLE_PAGE.ASSET_UNITS;

export const assetStatusLabels: Record<AssetStatus, string> = {
  [AssetStatus.AVAILABLE]: text.TABLE.STATUS_AVAILABLE,
  [AssetStatus.RESERVED]: text.TABLE.STATUS_RESERVED,
  [AssetStatus.RENTED]: text.TABLE.STATUS_RENTED,
  [AssetStatus.INSPECTING]: text.TABLE.STATUS_INSPECTING,
  [AssetStatus.MAINTENANCE]: text.TABLE.STATUS_MAINTENANCE,
  [AssetStatus.CLEANING]: text.TABLE.STATUS_CLEANING,
  [AssetStatus.TRANSFERRING]: text.TABLE.STATUS_TRANSFERRING,
  [AssetStatus.RETIRED]: text.TABLE.STATUS_RETIRED,
  [AssetStatus.LOST]: text.TABLE.STATUS_LOST,
};

export const assetConditionLabels: Record<AssetCondition, string> = {
  [AssetCondition.NEW]: text.TABLE.CONDITION_NEW,
  [AssetCondition.GOOD]: text.TABLE.CONDITION_GOOD,
  [AssetCondition.FAIR]: text.TABLE.CONDITION_FAIR,
  [AssetCondition.DAMAGED]: text.TABLE.CONDITION_DAMAGED,
  [AssetCondition.LOST]: text.TABLE.CONDITION_LOST,
};

export const assetStatusOptions = Object.values(AssetStatus).map((value) => ({
  value,
  label: assetStatusLabels[value],
}));

export const assetConditionOptions = Object.values(AssetCondition).map((value) => ({
  value,
  label: assetConditionLabels[value],
}));

const activeFilterOptions = [
  { label: text.TABLE.ACTIVE, value: 'true' },
  { label: text.TABLE.INACTIVE, value: 'false' },
];

function AssetStatusBadge({ status }: { status: AssetStatus }) {
  const className =
    status === AssetStatus.AVAILABLE
      ? 'border-transparent bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/15'
      : status === AssetStatus.RENTED || status === AssetStatus.RESERVED || status === AssetStatus.TRANSFERRING
        ? 'border-transparent bg-blue-500/10 text-blue-600 hover:bg-blue-500/15'
        : status === AssetStatus.MAINTENANCE || status === AssetStatus.CLEANING || status === AssetStatus.INSPECTING
          ? 'border-transparent bg-amber-500/10 text-amber-600 hover:bg-amber-500/15'
          : 'border-transparent bg-zinc-500/10 text-zinc-600 hover:bg-zinc-500/15';

  return (
    <Badge variant="outline" className={className}>
      {assetStatusLabels[status]}
    </Badge>
  );
}

function AssetConditionBadge({ condition }: { condition: AssetCondition }) {
  const className =
    condition === AssetCondition.NEW || condition === AssetCondition.GOOD
      ? 'border-transparent bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/15'
      : condition === AssetCondition.FAIR
        ? 'border-transparent bg-amber-500/10 text-amber-600 hover:bg-amber-500/15'
        : 'border-transparent bg-red-500/10 text-red-600 hover:bg-red-500/15';

  return (
    <Badge variant="outline" className={className}>
      {assetConditionLabels[condition]}
    </Badge>
  );
}

function ActiveBadge({ isActive }: { isActive: boolean }) {
  return (
    <Badge
      variant="outline"
      className={
        isActive
          ? 'border-transparent bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/15'
          : 'border-transparent bg-zinc-500/10 text-zinc-600 hover:bg-zinc-500/15'
      }
    >
      {isActive ? text.TABLE.ACTIVE : text.TABLE.INACTIVE}
    </Badge>
  );
}

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
    cell: ({ row }) => <AssetStatusBadge status={row.original.status} />,
    meta: {
      label: text.TABLE.STATUS,
      variant: 'select',
      options: assetStatusOptions,
    },
  },
  {
    accessorKey: 'condition',
    header: text.TABLE.CONDITION,
    cell: ({ row }) => <AssetConditionBadge condition={row.original.condition} />,
    meta: {
      label: text.TABLE.CONDITION,
      variant: 'select',
      options: assetConditionOptions,
    },
  },
  {
    accessorKey: 'isActive',
    header: text.TABLE.ACTIVE_STATE,
    cell: ({ row }) => <ActiveBadge isActive={row.original.isActive} />,
    meta: {
      label: text.TABLE.ACTIVE_STATE,
      variant: 'select',
      options: activeFilterOptions,
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
