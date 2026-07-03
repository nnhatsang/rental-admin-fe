'use client';

import { IconDotsVertical, IconEdit, IconTrash } from '@tabler/icons-react';
import type { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatDate } from '@/lib/utils';
import { TITLE_PAGE } from '@/utils/consts/title-page.const';
import type { IRoleOut } from './type';

export type RoleActionHandlers = {
  handleOpenEdit: (role: IRoleOut) => void;
  handleOpenDelete: (role: IRoleOut) => void;
};

function SystemBadge({ isSystem }: { isSystem: boolean }) {
  return (
    <Badge variant="outline" className={isSystem ? 'border-transparent bg-blue-500/10 text-blue-600' : 'border-transparent bg-zinc-500/10 text-zinc-600'}>
      {isSystem ? 'Hệ thống' : 'Tùy chỉnh'}
    </Badge>
  );
}

function PermissionSummary({ role }: { role: IRoleOut }) {
  const visible = role.permissions.slice(0, 3);
  const remaining = role.permissions.length - visible.length;

  if (role.permissions.length === 0) return <span className="text-sm text-muted-foreground">-</span>;

  return (
    <div className="flex flex-wrap gap-1">
      {visible.map((permission) => (
        <Badge key={permission.code} variant="outline" className="h-5 text-[10px] font-medium">
          {permission.code}
        </Badge>
      ))}
      {remaining > 0 && (
        <Badge variant="outline" className="h-5 text-[10px] font-medium text-muted-foreground">
          +{remaining}
        </Badge>
      )}
    </div>
  );
}

function RoleActionsCell({ role, handlers }: { role: IRoleOut; handlers: RoleActionHandlers }) {
  const actions = TITLE_PAGE.ROLES.ACTIONS;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl hover:bg-muted/80">
          <IconDotsVertical className="size-4 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuItem disabled={role.isSystem} onClick={() => handlers.handleOpenEdit(role)}>
          <IconEdit className="mr-2 size-4" />
          {actions.EDIT}
        </DropdownMenuItem>
        <DropdownMenuItem variant="destructive" disabled={role.isSystem} onClick={() => handlers.handleOpenDelete(role)}>
          <IconTrash className="mr-2 size-4" />
          {actions.DELETE}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export const roleColumns: ColumnDef<IRoleOut>[] = [
  {
    accessorKey: 'name',
    header: 'Vai trò',
    meta: { label: 'Vai trò' },
    cell: ({ row }) => (
      <div className="min-w-0">
        <div className="truncate text-sm font-medium text-foreground">{row.original.name}</div>
        <div className="truncate text-xs text-muted-foreground">{row.original.code}</div>
      </div>
    ),
    enableColumnFilter: false,
  },
  {
    accessorKey: 'description',
    header: 'Mô tả',
    cell: ({ row }) => (
      <span className="line-clamp-2 text-sm text-muted-foreground">{row.original.description || '-'}</span>
    ),
    enableColumnFilter: false,
    enableSorting: false,
  },
  {
    accessorKey: 'isSystem',
    header: 'Loại',
    cell: ({ row }) => <SystemBadge isSystem={row.original.isSystem} />,
    enableColumnFilter: false,
    enableSorting: false,
  },
  {
    id: 'permissions',
    header: 'Quyền',
    cell: ({ row }) => <PermissionSummary role={row.original} />,
    enableColumnFilter: false,
    enableSorting: false,
  },
  {
    accessorKey: 'usersCount',
    header: 'Người dùng',
    cell: ({ row }) => <span className="text-sm tabular-nums">{row.original.usersCount}</span>,
    enableColumnFilter: false,
  },
  {
    accessorKey: 'createdAt',
    header: 'Ngày tạo',
    accessorFn: (row) => formatDate(row.createdAt),
    cell: ({ getValue }) => <span className="text-sm text-muted-foreground">{getValue<string>()}</span>,
    enableColumnFilter: false,
  },
  {
    id: 'actions',
    header: () => <div className="text-right">Thao tác</div>,
    cell: ({ row, table }) => {
      const handlers = (table.options.meta as { handlers?: RoleActionHandlers } | undefined)?.handlers;
      if (!handlers) return null;

      return (
        <div className="text-right">
          <RoleActionsCell role={row.original} handlers={handlers} />
        </div>
      );
    },
    meta: { disableColumnActions: true },
    enableColumnFilter: false,
    enableHiding: false,
    enableSorting: false,
  },
];
