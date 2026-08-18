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
import { formatCurrency, formatDate } from '@/lib/utils';
import { PermissionCode } from '@/utils/consts/rbac.const';
import { TITLE_PAGE } from '@/utils/consts/title-page.const';
import { IconDots, IconEdit, IconEye, IconPackage, IconPower, IconToggleLeft, IconTrash } from '@tabler/icons-react';
import type { ColumnDef, Row } from '@tanstack/react-table';
import Link from 'next/link';
import { productActiveConfig, productActiveOptions } from './display-config';
import { useProducts } from './products-provider';
import type { IProductOut } from './type';

const productText = TITLE_PAGE.PRODUCTS;

const formatProductCurrency = (value: number | null) => {
  if (value === null) return '-';
  return formatCurrency(value, { noDecimals: true });
};

function ProductStatusBadge({ isActive }: { isActive: boolean }) {
  const item = productActiveConfig[String(isActive) as keyof typeof productActiveConfig];

  return (
    <Badge variant="outline" className={item.className}>
      {item.label}
    </Badge>
  );
}

function ProductActionsRow({ row }: { row: Row<IProductOut> }) {
  const { setCurrentRow, setOpen } = useProducts();
  const actions = productText.ACTIONS;

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="flex h-8 w-8 p-0 data-[state=open]:bg-muted">
          <IconDots className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <ProtectedAction permission={PermissionCode.ProductsRead}>
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
        <ProtectedAction permission={PermissionCode.ProductsUpdate}>
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
        <DropdownMenuItem asChild>
          <Link href={`/asset-units?productId=${row.original.id}`}>
            <IconPackage className="mr-2 size-4" />
            {actions.VIEW_ASSET_UNITS}
          </Link>
        </DropdownMenuItem>
        <ProtectedAction permission={PermissionCode.ProductsUpdate}>
          <DropdownMenuItem
            onClick={() => {
              setCurrentRow(row.original);
              setOpen('status');
            }}
          >
            {row.original.isActive ? <IconToggleLeft className="mr-2 size-4" /> : <IconPower className="mr-2 size-4" />}
            {row.original.isActive ? actions.DISABLE : actions.ENABLE}
          </DropdownMenuItem>
        </ProtectedAction>
        <ProtectedAction permission={PermissionCode.ProductsDelete}>
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

export const columns: ColumnDef<IProductOut>[] = [
  {
    accessorKey: 'name',
    header: productText.TABLE.PRODUCT_SKU,
    meta: { label: productText.TABLE.PRODUCT },
    cell: ({ row }) => (
      <div className="min-w-0">
        <div className="truncate text-sm font-medium text-foreground">{row.original.name}</div>
        <div className="truncate text-xs text-muted-foreground">{row.original.sku}</div>
      </div>
    ),
    enableColumnFilter: false,
  },
  {
    accessorKey: 'category',
    header: productText.TABLE.CATEGORY,
    cell: ({ row }) => row.original.category?.name ?? <span className="text-muted-foreground">-</span>,
    enableSorting: false,
    enableColumnFilter: false,
  },
  {
    accessorKey: 'brand',
    header: productText.TABLE.BRAND,
    cell: ({ row }) => row.original.brand?.name ?? <span className="text-muted-foreground">-</span>,
    enableSorting: false,
    enableColumnFilter: false,
  },
  {
    accessorKey: 'dailyPrice',
    header: productText.TABLE.DAILY_PRICE,
    cell: ({ row }) => <span className="font-medium">{formatProductCurrency(row.original.dailyPrice)}</span>,
    meta: { label: productText.TABLE.DAILY_PRICE },
    enableColumnFilter: false,
  },
  {
    accessorKey: 'depositAmount',
    header: productText.TABLE.DEPOSIT_AMOUNT,
    cell: ({ row }) => <span>{formatProductCurrency(row.original.depositAmount)}</span>,
    meta: { label: productText.TABLE.DEPOSIT_AMOUNT },
    enableColumnFilter: false,
  },
  {
    accessorKey: 'isActive',
    header: productText.TABLE.STATUS,
    cell: ({ row }) => <ProductStatusBadge isActive={row.original.isActive} />,
    meta: {
      label: productText.TABLE.STATUS,
      variant: 'select',
      options: productActiveOptions,
    },
  },
  {
    accessorKey: 'updatedAt',
    header: productText.TABLE.UPDATED_AT,
    accessorFn: (row) => formatDate(row.updatedAt),
    cell: ({ getValue }) => <span className="text-sm text-muted-foreground">{getValue<string>()}</span>,
    meta: { label: productText.TABLE.UPDATED_AT },
    enableColumnFilter: false,
  },
  {
    id: 'actions',
    cell: ProductActionsRow,
    meta: { disableColumnActions: true, isActionsColumn: true },
  },
];
