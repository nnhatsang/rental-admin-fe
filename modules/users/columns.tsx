'use client';

import { IconDotsVertical, IconEdit, IconKey, IconLock, IconLockOpen, IconTrash } from '@tabler/icons-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import { ColumnDef } from '@tanstack/react-table';
import { IUserOut, UserActivityStatus } from './type';
import { formatDate } from '@/lib/utils';

export type ActionHandlers = {
  handleOpenEdit: (user: IUserOut) => void;
  handleOpenDelete: (user: IUserOut) => void;
  handleOpenResetPassword: (user: IUserOut) => void;
  handleToggleStatus: (user: IUserOut) => void;
};

// ---- Constants ----

export const statusMeta: Record<UserActivityStatus, { label: string; color: string }> = {
  ACTIVE: {
    label: 'Hoạt động',
    color:
      'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 hover:bg-emerald-500/15 border-transparent',
  },
  BANNED: {
    label: 'Bị cấm',
    color: 'bg-red-500/10 text-red-600 dark:bg-red-500/20 dark:text-red-400 hover:bg-red-500/15 border-transparent',
  },
  LOCKED: {
    label: 'Bị khóa',
    color:
      'bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400 hover:bg-amber-500/15 border-transparent',
  },
  INACTIVE: {
    label: 'Chưa kích hoạt',
    color:
      'bg-zinc-500/10 text-zinc-600 dark:bg-zinc-500/20 dark:text-zinc-400 hover:bg-zinc-500/15 border-transparent',
  },
};

// ---- Cell Components ----

export function StatusBadge({ status }: { status: UserActivityStatus }) {
  return (
    <Badge variant="outline" className={statusMeta[status].color}>
      {statusMeta[status].label}
    </Badge>
  );
}

export function RolesCell({ roles }: { roles: IUserOut['roles'] }) {
  if (roles.length === 0) return <span className="text-muted-foreground text-xs">—</span>;
  return (
    <div className="flex flex-wrap gap-1">
      {roles.map((role) => (
        <Badge key={role.id} variant="outline" className="text-[10px] font-medium h-5">
          {role.name}
        </Badge>
      ))}
    </div>
  );
}

export function UserActionsCell({ user, handlers }: { user: IUserOut; handlers: ActionHandlers }) {
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
          Chỉnh sửa
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handlers.handleOpenResetPassword(user)}>
          <IconKey className="mr-2 size-4" />
          Đổi mật khẩu
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handlers.handleToggleStatus(user)}>
          {user.activityStatus === 'ACTIVE' ? (
            <>
              <IconLock className="mr-2 size-4 text-amber-500" />
              <span className="text-amber-600 dark:text-amber-400">Khóa tài khoản</span>
            </>
          ) : (
            <>
              <IconLockOpen className="mr-2 size-4 text-emerald-500" />
              <span className="text-emerald-600 dark:text-emerald-400">Kích hoạt lại</span>
            </>
          )}
        </DropdownMenuItem>
        <DropdownMenuItem variant="destructive" onClick={() => handlers.handleOpenDelete(user)}>
          <IconTrash className="mr-2 size-4" />
          Xóa người dùng
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// ---- Column Definitions ----

export const userColumns: ColumnDef<IUserOut>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          aria-label="Select all users"
          checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          aria-label={`Select ${row.original.fullName}`}
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
        />
      </div>
    ),
    enableHiding: false,
    enableSorting: false,
  },
  {
    accessorKey: 'fullName',
    header: 'Họ và tên / Email',
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <Avatar size="lg" className="font-medium">
          <AvatarFallback>{row.original.fullName}</AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <div className="truncate font-medium text-foreground text-sm">{row.original.fullName}</div>
          <div className="truncate text-muted-foreground text-sm">{row.original.email}</div>
        </div>
      </div>
    ),
  },
  {
    accessorKey: 'roles',
    header: 'Vai trò',
    cell: ({ row }) => <RolesCell roles={row.original.roles} />,
  },
  {
    accessorKey: 'activityStatus',
    header: 'Trạng thái',
    cell: ({ row }) => <StatusBadge status={row.original.activityStatus} />,
  },
  {
    accessorKey: 'createdAt',
    header: 'Ngày tạo',
    accessorFn: (row) => formatDate(row.createdAt),
    cell: ({ getValue }) => <span className="text-muted-foreground text-sm">{getValue<string>()}</span>,
  },
  {
    id: 'actions',
    header: () => <div className="text-right">Thao tác</div>,
    cell: ({ row, table }) => {
      const handlers = (table.options.meta as { handlers?: ActionHandlers } | undefined)?.handlers;
      if (!handlers) return null;
      return (
        <div className="text-right">
          <UserActionsCell user={row.original} handlers={handlers} />
        </div>
      );
    },
    enableHiding: false,
    enableSorting: false,
  },
];
