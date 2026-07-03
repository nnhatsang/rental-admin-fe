'use client';

import { IconDotsVertical, IconEdit, IconKey, IconLock, IconLockOpen, IconTrash } from '@tabler/icons-react';
import type { ColumnDef } from '@tanstack/react-table';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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
import { IUserOut, UserActivityStatus } from './type';
import { UserAvatar } from '@/components/ui/user-avatar';

export type ActionHandlers = {
  handleOpenEdit: (user: IUserOut) => void;
  handleOpenDelete: (user: IUserOut) => void;
  handleOpenResetPassword: (user: IUserOut) => void;
  handleToggleStatus: (user: IUserOut) => void;
};

export const statusMeta: Record<UserActivityStatus, { label: string; color: string; textColor: string }> = {
  ACTIVE: {
    label: 'Hoạt động',
    color:
      'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 hover:bg-emerald-500/15 border-transparent',
    textColor: 'text-emerald-600 dark:text-emerald-400',
  },
  BANNED: {
    label: 'Bị cấm',
    color: 'bg-red-500/10 text-red-600 dark:bg-red-500/20 dark:text-red-400 hover:bg-red-500/15 border-transparent',
    textColor: 'text-red-600 dark:text-red-400',
  },
  LOCKED: {
    label: 'Bị khóa',
    color:
      'bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400 hover:bg-amber-500/15 border-transparent',
    textColor: 'text-amber-600 dark:text-amber-400',
  },
  INACTIVE: {
    label: 'Chưa kích hoạt',
    color:
      'bg-zinc-500/10 text-zinc-600 dark:bg-zinc-500/20 dark:text-zinc-400 hover:bg-zinc-500/15 border-transparent',
    textColor: 'text-zinc-600 dark:text-zinc-400',
  },
};

export const statusFilterOptions = Object.entries(statusMeta).map(([value, meta]) => ({
  label: meta.label,
  value,
}));

export function StatusBadge({ status }: { status: UserActivityStatus }) {
  return (
    <Badge variant="outline" className={statusMeta[status].color}>
      {statusMeta[status].label}
    </Badge>
  );
}

export function RolesCell({ roles }: { roles: IUserOut['roles'] }) {
  if (roles.length === 0) return <span className="text-muted-foreground text-xs">-</span>;

  return (
    <div className="flex flex-wrap gap-1">
      {roles.map((role) => (
        <Badge key={role.id} variant="outline" className="h-5 text-[10px] font-medium">
          {role.name}
        </Badge>
      ))}
    </div>
  );
}

export function UserActionsCell({ user, handlers }: { user: IUserOut; handlers: ActionHandlers }) {
  const actions = TITLE_PAGE.USERS.ACTIONS;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl hover:bg-muted/80">
          <IconDotsVertical className="size-4 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={() => handlers.handleOpenEdit(user)}>
          <IconEdit className="mr-2 size-4" />
          {actions.EDIT}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handlers.handleOpenResetPassword(user)}>
          <IconKey className="mr-2 size-4" />
          {actions.RESET_PASSWORD}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handlers.handleToggleStatus(user)}>
          {user.activityStatus === 'ACTIVE' ? (
            <>
              <IconLock className="mr-2 size-4 text-amber-500" />
              <span className="text-amber-600 dark:text-amber-400">{actions.LOCK}</span>
            </>
          ) : (
            <>
              <IconLockOpen className="mr-2 size-4 text-emerald-500" />
              <span className="text-emerald-600 dark:text-emerald-400">{actions.ACTIVATE}</span>
            </>
          )}
        </DropdownMenuItem>
        <DropdownMenuItem variant="destructive" onClick={() => handlers.handleOpenDelete(user)}>
          <IconTrash className="mr-2 size-4" />
          {actions.DELETE}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export const userColumns: ColumnDef<IUserOut>[] = [
  {
    accessorKey: 'fullName',
    header: 'Họ và tên / Email',
    meta: { label: 'Họ và tên' },
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <UserAvatar name={row.original.fullName} src={row.original.avatar} className="font-medium" />
        <div className="min-w-0">
          <div className="truncate text-sm font-medium text-foreground">{row.original.fullName}</div>
          <div className="truncate text-sm text-muted-foreground">{row.original.email}</div>
        </div>
      </div>
    ),
    enableColumnFilter: false,
  },
  {
    accessorKey: 'roles',
    header: 'Vai trò',
    cell: ({ row }) => <RolesCell roles={row.original.roles} />,
    enableColumnFilter: false,
    enableSorting: false,
  },
  {
    accessorKey: 'activityStatus',
    header: 'Trạng thái',
    cell: ({ row }) => <StatusBadge status={row.original.activityStatus} />,
    meta: {
      label: 'Trạng thái',
      variant: 'select',
      options: statusFilterOptions,
    },
    enableSorting: false,
  },
  {
    accessorKey: 'createdAt',
    header: 'Ngày tạo',
    accessorFn: (row) => formatDate(row.createdAt),
    meta: { label: 'Ngày tạo' },
    cell: ({ getValue }) => <span className="text-sm text-muted-foreground">{getValue<string>()}</span>,
    enableColumnFilter: false,
  },
  {
    id: 'actions',
    header: () => <div className="text-right">Thao tác</div>,
    cell: ({ row, table }) => {
      const handlers = (table.options.meta as { handlers?: ActionHandlers } | undefined)?.handlers;
      if (!handlers) return null;

      return <UserActionsCell user={row.original} handlers={handlers} />;
    },
    meta: { disableColumnActions: true },
    enableColumnFilter: false,
    enableHiding: false,
    enableSorting: false,
  },
];
