import { Button } from '@/components/ui/button';
import { DataTableBulkActions } from '@/components/ui/data-table/components/menus/bulk-actions';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { TITLE_PAGE } from '@/utils/consts/title-page.const';
import type { Table } from '@tanstack/react-table';
import { Trash2 } from 'lucide-react';
import { useAssetUnits } from './asset-units-provider';

type DataTableBulkActionsProps<TData> = {
  table: Table<TData>;
};

export function BulkActions<TData>({ table }: DataTableBulkActionsProps<TData>) {
  const { setOpen } = useAssetUnits();
  const actionText = TITLE_PAGE.ASSET_UNITS.ACTIONS.DELETE_MULTI;

  return (
    <DataTableBulkActions table={table} entityName="asset unit">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="destructive"
            size="icon"
            onClick={() => setOpen('delete-multi')}
            className="size-8"
            aria-label={actionText}
            title={actionText}
          >
            <Trash2 />
            <span className="sr-only">{actionText}</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{actionText}</p>
        </TooltipContent>
      </Tooltip>
    </DataTableBulkActions>
  );
}
