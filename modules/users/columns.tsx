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
import {
  IconDots,
  IconEdit,
  IconEye,
  IconKey,
  IconKeyOff,
  IconLock,
  IconLockOpen,
  IconTrash,
} from '@tabler/icons-react';
import type { ColumnDef, Row } from '@tanstack/react-table';
import type { ComponentType } from 'react';
import { useUpdateUserActivityStatus } from './hooks/use-update-user-activity-status';
import type { IUserOut, UserActivityStatus as UserActivityStatusType } from './type';
import { useUsers } from './users-provider';

export const statusMeta: Record<
  UserActivityStatusType,
  { label: string; color: string; textColor: string; icon: ComponentType<{ className?: string }> }
> = {
  ACTIVE: {
    label: 'Hoạt động',
    color:
      'bg-teal-100/30 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 hover:bg-emerald-500/15 border-transparent',
    textColor: 'text-emerald-600 dark:text-emerald-400',
    icon: IconLockOpen,
  },
  BANNED: {
    label: 'Bị cấm',
    color: 'bg-red-500/10 text-red-600 dark:bg-red-500/20 dark:text-red-400 hover:bg-red-500/15 border-transparent',
    textColor: 'text-red-600 dark:text-red-400',
    icon: IconLock,
  },
  LOCKED: {
    label: 'Bị khóa',
    color:
      'bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400 hover:bg-amber-500/15 border-transparent',
    textColor: 'text-amber-600 dark:text-amber-400',
    icon: IconLock,
  },
  INACTIVE: {
    label: 'Chưa kích hoạt',
    color:
      'bg-zinc-500/10 text-zinc-600 dark:bg-zinc-500/20 dark:text-zinc-400 hover:bg-zinc-500/15 border-transparent',
    textColor: 'text-zinc-600 dark:text-zinc-400',
    icon: IconKeyOff,
  },
};

export const statusFilterOptions = Object.entries(statusMeta).map(([value, meta]) => ({
  label: meta.label,
  value,
}));

export function StatusBadgeRow({ row }: { row: Row<IUserOut> }) {
  const update = useUpdateUserActivityStatus();

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Badge variant="outline" className={cn('cursor-pointer', statusMeta[row.original.activityStatus].color)}>
          {statusMeta[row.original.activityStatus].label}
        </Badge>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>Thay đổi trạng thái</DropdownMenuLabel>

        <DropdownMenuSeparator />

        {Object.entries(statusMeta).map(([key, item]) => {
          const ItemIcon = item.icon;
          const isActive = key === row.original.activityStatus;

          return (
            <DropdownMenuItem
              key={key}
              disabled={isActive}
              className={cn(
                'flex items-center gap-2 mt-1 cursor-pointer',
                isActive && 'cursor-not-allowed',
                item.color,
              )}
              onClick={() => {
                update.mutate({ data: { activityStatus: key as UserActivityStatusType }, id: row.original.id });
              }}
            >
              <ItemIcon className={`size-4 ${isActive ? item.textColor : ''}`} />

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

type DataTableRowActionsProps = {
  row: Row<IUserOut>;
};

export function UserActionsRow({ row }: DataTableRowActionsProps) {
  const actions = TITLE_PAGE.USERS.ACTIONS;
  const { setOpen, setCurrentRow } = useUsers();

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="flex h-8 w-8 p-0 data-[state=open]:bg-muted">
          <IconDots className="size-4 " />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <ProtectedAction permission={PermissionCode.UsersRead}>
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
        <ProtectedAction permission={PermissionCode.UsersUpdate}>
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
        <ProtectedAction permission={PermissionCode.UsersUpdate}>
          <DropdownMenuItem
            onClick={() => {
              setCurrentRow(row.original);
              setOpen('reset-password');
            }}
          >
            <IconKey className="mr-2 size-4" />
            {actions.RESET_PASSWORD}
          </DropdownMenuItem>
        </ProtectedAction>
        <ProtectedAction permission={PermissionCode.UsersDelete}>
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

export const columns: ColumnDef<IUserOut>[] = [
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
    enableSorting: false,
    enableColumnFilter: false,
  },
  {
    accessorKey: 'activityStatus',
    header: 'Trạng thái',
    cell: StatusBadgeRow,
    meta: {
      label: 'Trạng thái',
      variant: 'select',
      options: statusFilterOptions,
    },
    // enableSorting: false,
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
    cell: UserActionsRow,
    meta: { disableColumnActions: true, isActionsColumn: true },
  },
];
