'use client';

import { IconEye, IconPencil, IconTrash } from '@tabler/icons-react';
import type { Row } from '@tanstack/react-table';

import { ProtectedAction } from '@/components/shared/protected-action';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { PermissionCode } from '@/utils/consts/rbac.const';
import type { IMailLayoutOut } from '../../type';

export function MailLayoutActionItems({
  row,
  onOpen,
  onDelete,
}: {
  row: Row<IMailLayoutOut>;
  onOpen: (id: string, readOnly: boolean) => void;
  onDelete: (layout: IMailLayoutOut) => void;
}) {
  return (
    <>
      <ProtectedAction permission={PermissionCode.EmailTemplatesRead}>
        <DropdownMenuItem onClick={() => onOpen(row.original.id, true)}>
          <IconEye className="mr-2 size-4" />
          Xem
        </DropdownMenuItem>
      </ProtectedAction>
      <ProtectedAction permission={PermissionCode.EmailTemplatesUpdate}>
        <DropdownMenuItem onClick={() => onOpen(row.original.id, false)}>
          <IconPencil className="mr-2 size-4" />
          Chỉnh sửa
        </DropdownMenuItem>
      </ProtectedAction>
      <ProtectedAction permission={PermissionCode.EmailTemplatesUpdate}>
        <DropdownMenuItem
          variant="destructive"
          disabled={row.original.usedByCount > 0}
          title={row.original.usedByCount > 0 ? 'Layout dang duoc su dung boi mau email' : undefined}
          onClick={() => onDelete(row.original)}
        >
          <IconTrash className="mr-2 size-4" />
          {'X\u00f3a'}
        </DropdownMenuItem>
      </ProtectedAction>
    </>
  );
}
