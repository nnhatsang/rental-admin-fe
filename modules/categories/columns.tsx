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
import { IconDots, IconEdit, IconEye, IconPower, IconToggleLeft, IconTrash } from '@tabler/icons-react';
import type { ColumnDef, Row } from '@tanstack/react-table';
import { categoryActiveConfig, categoryActiveOptions } from './display-config';
import { useCategories } from './category-provider';
import type { ICategoryOut } from './type';

const text = TITLE_PAGE.CATEGORY;

function CategoryStatusBadge({ isActive }: { isActive: boolean }) {
  const item = categoryActiveConfig[String(isActive) as keyof typeof categoryActiveConfig];
  return <Badge className={item.className}>{item.label}</Badge>;
}

function CategoryActions({ row }: { row: Row<ICategoryOut> }) {
  const { setCurrentRow, setOpen } = useCategories();

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="size-8 data-[state=open]:bg-muted" aria-label="Mở thao tác">
          <IconDots className="size-4" aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <ProtectedAction permission={PermissionCode.CategoriesRead}>
          <DropdownMenuItem onClick={() => { setCurrentRow(row.original); setOpen('view'); }}>
            <IconEye className="mr-2 size-4" aria-hidden="true" /> Xem
          </DropdownMenuItem>
        </ProtectedAction>
        <ProtectedAction permission={PermissionCode.CategoriesUpdate}>
          <DropdownMenuItem onClick={() => { setCurrentRow(row.original); setOpen('edit'); }}>
            <IconEdit className="mr-2 size-4" aria-hidden="true" /> Chỉnh sửa
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => { setCurrentRow(row.original); setOpen('status'); }}>
            {row.original.isActive ? <IconToggleLeft className="mr-2 size-4" /> : <IconPower className="mr-2 size-4" />}
            {row.original.isActive ? 'Tạm tắt' : 'Bật lại'}
          </DropdownMenuItem>
        </ProtectedAction>
        <ProtectedAction permission={PermissionCode.CategoriesDelete}>
          <DropdownMenuItem variant="destructive" onClick={() => { setCurrentRow(row.original); setOpen('delete'); }}>
            <IconTrash className="mr-2 size-4" aria-hidden="true" /> Xóa
          </DropdownMenuItem>
        </ProtectedAction>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export const columns: ColumnDef<ICategoryOut>[] = [
  {
    accessorKey: 'order',
    header: 'Thứ tự',
    meta: { label: 'Thứ tự' },
    cell: ({ row }) => <span className="tabular-nums">{row.original.order + 1}</span>,
    enableSorting: false,
    enableColumnFilter: false,
    size: 80,
  },
  {
    accessorKey: 'name',
    header: text.TABLE.NAME,
    meta: { label: text.TABLE.NAME },
    cell: ({ row }) => (
      <div className="min-w-0">
        <div className="truncate font-medium">{row.original.name}</div>
        <div className="truncate text-xs text-muted-foreground">{row.original.slug ?? 'Chưa đặt mã'}</div>
      </div>
    ),
    enableColumnFilter: false,
  },
  {
    accessorKey: 'productCount',
    header: text.TABLE.PRODUCT_COUNT,
    meta: { label: text.TABLE.PRODUCT_COUNT },
    cell: ({ row }) => <span className="tabular-nums">{row.original.productCount}</span>,
    enableSorting: false,
    enableColumnFilter: false,
  },
  {
    accessorKey: 'isActive',
    header: text.TABLE.STATUS,
    meta: { label: text.TABLE.STATUS, variant: 'select', options: categoryActiveOptions },
    cell: ({ row }) => <CategoryStatusBadge isActive={row.original.isActive} />,
  },
  {
    accessorKey: 'updatedAt',
    header: text.TABLE.UPDATED_AT,
    accessorFn: (row) => formatDate(row.updatedAt),
    cell: ({ getValue }) => <span className="text-sm text-muted-foreground">{getValue<string>()}</span>,
    meta: { label: text.TABLE.UPDATED_AT },
    enableColumnFilter: false,
  },
  { id: 'actions', cell: CategoryActions, meta: { disableColumnActions: true, isActionsColumn: true } },
];
