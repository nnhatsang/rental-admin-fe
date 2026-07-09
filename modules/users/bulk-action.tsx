import { Button } from '@/components/ui/button';
import { DataTableBulkActions } from '@/components/ui/data-table/components/menus/bulk-actions';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { TITLE_PAGE } from '@/utils/consts/title-page.const';
import { Table } from '@tanstack/react-table';
import { Trash2 } from 'lucide-react';
import { useUsers } from './users-provider';

type DataTableBulkActionsProps<TData> = {
  table: Table<TData>;
};
export function BulkActions<TData>({ table }: DataTableBulkActionsProps<TData>) {
  //   const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  //   const selectedRows = table.getFilteredSelectedRowModel().rows;

  const { setOpen } = useUsers();

  //   const handleBulkStatusChange = (status: 'active' | 'inactive') => {
  //     const selectedUsers = selectedRows.map((row) => row.original as User);
  //     toast.promise(sleep(2000), {
  //       loading: `${status === 'active' ? 'Activating' : 'Deactivating'} users...`,
  //       success: () => {
  //         table.resetRowSelection();
  //         return `${status === 'active' ? 'Activated' : 'Deactivated'} ${selectedUsers.length} user${selectedUsers.length > 1 ? 's' : ''}`;
  //       },
  //       error: `Error ${status === 'active' ? 'activating' : 'deactivating'} users`,
  //     });
  //     table.resetRowSelection();
  //   };

  //   const handleBulkInvite = () => {
  //     const selectedUsers = selectedRows.map((row) => row.original as User);
  //     toast.promise(sleep(2000), {
  //       loading: 'Inviting users...',
  //       success: () => {
  //         table.resetRowSelection();
  //         return `Invited ${selectedUsers.length} user${selectedUsers.length > 1 ? 's' : ''}`;
  //       },
  //       error: 'Error inviting users',
  //     });
  //     table.resetRowSelection();
  //   };

  return (
    <>
      <DataTableBulkActions table={table} entityName="user">
        {/* <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              onClick={handleBulkInvite}
              className="size-8"
              aria-label="Invite selected users"
              title="Invite selected users"
            >
              <Mail />
              <span className="sr-only">Invite selected users</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Invite selected users</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleBulkStatusChange('active')}
              className="size-8"
              aria-label="Activate selected users"
              title="Activate selected users"
            >
              <UserCheck />
              <span className="sr-only">Activate selected users</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Activate selected users</p>
          </TooltipContent>
        </Tooltip> */}

        {/* <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleBulkStatusChange('inactive')}
              className="size-8"
              aria-label="Deactivate selected users"
              title="Deactivate selected users"
            >
              <UserX />
              <span className="sr-only">Deactivate selected users</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Deactivate selected users</p>
          </TooltipContent>
        </Tooltip> */}

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="destructive"
              size="icon"
              onClick={() => setOpen('delete-multi')}
              className="size-8"
              aria-label={TITLE_PAGE.USERS.ACTIONS.DELETE_MULTI}
              title={TITLE_PAGE.USERS.ACTIONS.DELETE_MULTI}
            >
              <Trash2 />
              <span className="sr-only">{TITLE_PAGE.USERS.ACTIONS.DELETE_MULTI}</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Delete selected users</p>
          </TooltipContent>
        </Tooltip>
      </DataTableBulkActions>
    </>
  );
}
