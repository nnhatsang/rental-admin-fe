import { Button } from '@/components/ui/button';
import { DataTableBulkActions } from '@/components/ui/data-table/components/menus/bulk-actions';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { TITLE_PAGE } from '@/utils/consts/title-page.const';
import { PermissionCode } from '@/utils/consts/rbac.const';
import { Table } from '@tanstack/react-table';
import { Trash2 } from 'lucide-react';
import { ProtectedAction } from '@/components/shared/protected-action';
import { useRoles } from './roles-provider';
import type { IRoleOut } from './type';

type DataTableBulkActionsProps = {
  table: Table<IRoleOut>;
};

export function BulkActions({ table }: DataTableBulkActionsProps) {
  const { setOpen } = useRoles();
  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const hasDeletableSelection = selectedRows.some((row) => !row.original.isSystem);
  const deleteLabel = TITLE_PAGE.ROLES.ACTIONS.DELETE;

  return (
    <DataTableBulkActions table={table} entityName="role">
      <ProtectedAction permission={PermissionCode.RolesDelete}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="destructive"
              size="icon"
              disabled={!hasDeletableSelection}
              onClick={() => setOpen('delete-multi')}
              className="size-8"
              aria-label={deleteLabel}
              title={deleteLabel}
            >
              <Trash2 />
              <span className="sr-only">{deleteLabel}</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{deleteLabel}</p>
          </TooltipContent>
        </Tooltip>
      </ProtectedAction>
    </DataTableBulkActions>
  );
}
