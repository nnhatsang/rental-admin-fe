'use client';

import { IconDots, IconDotsVertical, IconEdit, IconTrash } from '@tabler/icons-react';
import type { ColumnDef, Row } from '@tanstack/react-table';
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
import { useRoles } from './roles-provider';

export type RoleActionHandlers = {
  handleOpenEdit: (role: IRoleOut) => void;
  handleOpenDelete: (role: IRoleOut) => void;
};

function SystemBadge({ isSystem }: { isSystem: boolean }) {
  return (
    <Badge
      variant="outline"
      className={
        isSystem ? 'border-transparent bg-blue-500/10 text-blue-600' : 'border-transparent bg-zinc-500/10 text-zinc-600'
      }
    >
      {isSystem ? 'Hệ thống' : 'Tùy chỉnh'}
    </Badge>
  );
}

function RoleActionsCell({ row }: { row: Row<IRoleOut> }) {
  const actions = TITLE_PAGE.ROLES.ACTIONS;
  const { setOpen, setCurrentRow } = useRoles();

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="flex h-8 w-8 p-0 data-[state=open]:bg-muted">
          <IconDots className="size-4 " />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        {/* <DropdownMenuItem disabled={role.isSystem} onClick={() => handlers.handleOpenEdit(role)}>
          <IconEdit className="mr-2 size-4" />
          {actions.EDIT}
        </DropdownMenuItem> */}
        {/* <DropdownMenuItem
          variant="destructive"
          disabled={role.isSystem}
          onClick={() => handlers.handleOpenDelete(role)}
        >
          <IconTrash className="mr-2 size-4" />
          {actions.DELETE}
        </DropdownMenuItem> */}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

const columns: ColumnDef<IRoleOut>[] = [
  {
    accessorKey: 'name',
    header: 'Tên nhóm quyền',
    cell: ({ getValue }) => <div className="truncate text-sm font-medium text-foreground">{getValue<string>()}</div>,
    enableColumnFilter: false,
  },
  {
    accessorKey: 'code',
    header: 'Mã nhóm quyền',
    cell: ({ getValue }) => <div className="truncate text-xs text-foreground">{getValue<string>()}</div>,
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
    meta: {
      variant: 'checkbox',
      label: 'Quyền hệ thống',

    },
  },
  {
    accessorKey: 'usersCount',
    header: 'Số lượng',
    cell: ({ row }) => <span className="text-sm tabular-nums text-center">{row.original.usersCount}</span>,
    enableColumnFilter: false,
    enableSorting: false,
  },
  {
    accessorKey: 'createdAt',
    header: 'Ngày tạo',
    accessorFn: (row) => formatDate(row.createdAt),
    cell: ({ getValue }) => <span className="text-sm text-muted-foreground">{getValue<string>()}</span>,
    enableColumnFilter: false,
  },
  {
    accessorKey: 'updatedAt',
    header: 'Ngày cập nhật',
    accessorFn: (row) => formatDate(row.createdAt),
    cell: ({ getValue }) => <span className="text-sm text-muted-foreground">{getValue<string>()}</span>,
    enableColumnFilter: false,
  },
  {
    id: 'actions',
    cell: RoleActionsCell,
    meta: { disableColumnActions: true },
  },
];

export default columns;
