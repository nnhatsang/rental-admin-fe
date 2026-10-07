'use client';

import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';
import type { ColumnDef } from '@tanstack/react-table';

import { mailTemplateActiveConfig, mailTemplateActiveOptions } from './display-config';
import type { IMailLayoutOut } from './type';

function MailLayoutStatusBadge({ isActive }: { isActive: boolean }) {
  const item = mailTemplateActiveConfig[String(isActive) as keyof typeof mailTemplateActiveConfig];

  return <Badge className={item.className}>{item.label}</Badge>;
}

export const layoutColumns: ColumnDef<IMailLayoutOut>[] = [
  {
    accessorKey: 'name',
    header: 'Layout email',
    meta: { label: 'Layout email' },
    cell: ({ row }) => (
      <div className="min-w-0">
        <div className="truncate font-medium">{row.original.name}</div>

        <div className="truncate font-mono text-xs text-muted-foreground">{row.original.key}</div>
      </div>
    ),
    enableColumnFilter: false,
  },
  {
    accessorKey: 'htmlLayout',
    header: 'Mã nguồn HTML',
    meta: { label: 'Mã nguồn HTML' },
    cell: () => <span className="text-sm text-muted-foreground">Có vùng nội dung {'{{content}}'}</span>,
    enableSorting: false,
    enableColumnFilter: false,
  },
  {
    accessorKey: 'isActive',
    header: 'Trạng thái',
    meta: {
      label: 'Trạng thái',
      variant: 'select',
      options: mailTemplateActiveOptions,
    },
    cell: ({ row }) => <MailLayoutStatusBadge isActive={row.original.isActive} />,
    enableSorting: false,
  },
  {
    accessorKey: 'usedByCount',
    header: 'Đang sử dụng',
    meta: { label: 'Đang sử dụng' },
    cell: ({ row }) => (
      <Badge variant={row.original.usedByCount > 0 ? 'secondary' : 'outline'}>{row.original.usedByCount} mẫu</Badge>
    ),
    enableSorting: false,
    enableColumnFilter: false,
  },
  {
    accessorKey: 'updatedAt',
    header: 'Cập nhật',
    accessorFn: (row) => formatDate(row.updatedAt),
    meta: { label: 'Cập nhật' },
    cell: ({ getValue }) => (
      <span className="whitespace-nowrap text-sm text-muted-foreground">{getValue<string>()}</span>
    ),
    enableColumnFilter: false,
  },
];

export default layoutColumns;
