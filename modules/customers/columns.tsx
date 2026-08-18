'use client';

import { ProtectedAction } from '@/components/shared/protected-action';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { UserAvatar } from '@/components/ui/user-avatar';
import { cn, formatDate } from '@/lib/utils';
import { PermissionCode } from '@/utils/consts/rbac.const';
import { TITLE_PAGE } from '@/utils/consts/title-page.const';
import { IconDots, IconEdit, IconEye, IconTrash } from '@tabler/icons-react';
import type { ColumnDef, Row } from '@tanstack/react-table';
import { customerStatusConfig, customerStatusOptions } from './display-config';
import { useUpdateCustomerStatus } from './hooks/use-update-customer-status';
import type { CustomerStatus as CustomerStatusType, ICustomerOut } from './type';
import { useCustomers } from './customer-provider';

const text = TITLE_PAGE.CUSTOMER;

function StatusBadgeRow({ row }: { row: Row<ICustomerOut> }) {
  const update = useUpdateCustomerStatus();
  const currentStatus = customerStatusConfig[row.original.status];

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Badge variant="outline" className={cn('cursor-pointer', currentStatus.className)}>
          {currentStatus.label}
        </Badge>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>Thay đổi trạng thái</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {Object.entries(customerStatusConfig).map(([key, item]) => {
          const ItemIcon = item.icon;
          const isActive = key === row.original.status;

          return (
            <DropdownMenuItem
              key={key}
              disabled={isActive}
              className={cn('mt-1 flex cursor-pointer items-center gap-2', isActive && 'cursor-not-allowed')}
              onClick={() => {
                update.mutate({ id: row.original.id, data: { status: key as CustomerStatusType } });
              }}
            >
              <ItemIcon className="size-4" />
              <div className="flex flex-col">
                <span>{item.label}</span>
                {isActive && <span className="text-xs text-muted-foreground">Trạng thái hiện tại</span>}
              </div>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function CustomerActionsRow({ row }: { row: Row<ICustomerOut> }) {
  const { setCurrentRow, setOpen } = useCustomers();
  const actions = text.ACTIONS;

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="flex h-8 w-8 p-0 data-[state=open]:bg-muted">
          <IconDots className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <ProtectedAction permission={PermissionCode.CustomersRead}>
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
        <ProtectedAction permission={PermissionCode.CustomersUpdate}>
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
        <ProtectedAction permission={PermissionCode.CustomersDelete}>
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

export const columns: ColumnDef<ICustomerOut>[] = [
  {
    accessorKey: 'name',
    header: 'Khách hàng',
    meta: { label: 'Khách hàng' },
    cell: ({ row }) => (
      <div className="flex min-w-0 items-center gap-3">
        <UserAvatar name={row.original.name} src={row.original.avatar} className="font-medium" />
        <div className="min-w-0">
          <div className="truncate text-sm font-medium text-foreground">{row.original.name}</div>
          <div className="truncate text-xs text-muted-foreground">{row.original.code ?? row.original.email}</div>
        </div>
      </div>
    ),
    enableColumnFilter: false,
  },
  {
    accessorKey: 'phone',
    header: 'Liên hệ',
    cell: ({ row }) => (
      <div className="min-w-0">
        <div className="truncate text-sm">{row.original.phone ?? '-'}</div>
        <div className="truncate text-xs text-muted-foreground">{row.original.email ?? '-'}</div>
      </div>
    ),
    meta: { label: 'Liên hệ' },
    enableColumnFilter: false,
  },
  {
    accessorKey: 'identityNumber',
    header: 'CCCD / CMND',
    cell: ({ row }) => row.original.identityNumber ?? <span className="text-muted-foreground">-</span>,
    meta: { label: 'CCCD / CMND' },
    enableColumnFilter: false,
  },
  {
    accessorKey: 'status',
    header: 'Trạng thái',
    cell: StatusBadgeRow,
    meta: {
      label: 'Trạng thái',
      variant: 'select',
      options: customerStatusOptions,
    },
  },
  {
    accessorKey: 'updatedAt',
    header: 'Cập nhật',
    accessorFn: (row) => formatDate(row.updatedAt),
    cell: ({ getValue }) => <span className="text-sm text-muted-foreground">{getValue<string>()}</span>,
    meta: { label: 'Cập nhật' },
    enableColumnFilter: false,
  },
  {
    id: 'actions',
    cell: CustomerActionsRow,
    meta: { disableColumnActions: true, isActionsColumn: true },
  },
];
