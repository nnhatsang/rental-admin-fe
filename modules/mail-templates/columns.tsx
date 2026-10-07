'use client';

import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';
import type { ColumnDef } from '@tanstack/react-table';
import { mailTemplateActiveConfig, mailTemplateActiveOptions } from './display-config';
import type { IMailTemplateOut } from './type';

function MailTemplateStatusBadge({ isActive }: { isActive: boolean }) {
  const item = mailTemplateActiveConfig[String(isActive) as keyof typeof mailTemplateActiveConfig];

  return <Badge className={item.className}>{item.label}</Badge>;
}

export const columns: ColumnDef<IMailTemplateOut>[] = [
  {
    accessorKey: 'name',
    header: 'Mẫu email',
    meta: { label: 'Mẫu email' },
    cell: ({ row }) => (
      <div className="min-w-0">
        <div className="truncate font-medium">{row.original.name}</div>
        <div className="truncate font-mono text-xs text-muted-foreground">{row.original.key}</div>
      </div>
    ),
    enableColumnFilter: false,
  },
  {
    accessorKey: 'subject',
    header: 'Subject',
    meta: { label: 'Subject' },
    cell: ({ row }) => <span className="line-clamp-2 text-sm text-muted-foreground">{row.original.subject}</span>,
    enableSorting: false,
    enableColumnFilter: false,
  },
  {
    accessorKey: 'layoutName',
    header: 'Layout',
    meta: { label: 'Layout' },
    cell: ({ row }) => <span className="truncate text-sm">{row.original.layoutName || 'Không dùng layout'}</span>,
    enableSorting: false,
    enableColumnFilter: false,
  },
  {
    id: 'variablesCount',
    accessorFn: (row) => row.variables.length,
    header: 'Biến',
    meta: { label: 'Số biến' },
    cell: ({ getValue }) => <span className="tabular-nums">{getValue<number>()}</span>,
    enableSorting: false,
    enableColumnFilter: false,
  },
  {
    accessorKey: 'isActive',
    header: 'Trạng thái',
    meta: { label: 'Trạng thái', variant: 'select', options: mailTemplateActiveOptions },
    cell: ({ row }) => <MailTemplateStatusBadge isActive={row.original.isActive} />,
  },
  {
    accessorKey: 'updatedAt',
    header: 'Cập nhật',
    accessorFn: (row) => formatDate(row.updatedAt),
    meta: { label: 'Cập nhật' },
    cell: ({ getValue }) => <span className="whitespace-nowrap text-sm text-muted-foreground">{getValue<string>()}</span>,
    enableColumnFilter: false,
  },
];

export default columns;
