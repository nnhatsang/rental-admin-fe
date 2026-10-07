'use client';

import { IconEye, IconPencil } from '@tabler/icons-react';
import type { Row } from '@tanstack/react-table';

import { ProtectedAction } from '@/components/shared/protected-action';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { PermissionCode } from '@/utils/consts/rbac.const';
import type { IMailTemplateOut } from '../../type';

export function MailTemplateActionItems({
  row,
  onOpen,
}: {
  row: Row<IMailTemplateOut>;
  onOpen: (id: string, readOnly: boolean) => void;
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
    </>
  );
}
