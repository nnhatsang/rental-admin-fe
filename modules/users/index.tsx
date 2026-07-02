'use client';

import { IconPlus } from '@tabler/icons-react';
import { PageCardLayout } from '@/components/shared/page-card-layout';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { TITLE_PAGE } from '@/utils/consts/title-page.const';
import { UserDialogs } from './dialog';
import { useUsersState } from './hooks/use-users-state';

export default function Users() {
  const state = useUsersState();

  return (
    <PageCardLayout
      title={TITLE_PAGE.USERS.INDEX}
      description={TITLE_PAGE.USERS.DESCRIPTION}
      actions={
        <Button
          size="lg"
          onClick={() => {
            state.setSelectedUser(null);
            state.setIsFormOpen(true);
          }}
        >
          <IconPlus className="mr-1.5 size-4" /> {TITLE_PAGE.USERS.ACTIONS.CREATE}
        </Button>
      }
    >
      <DataTable table={state.table} pageSizeOptions={[10, 20, 30, 50]} />
      <UserDialogs state={state} />
    </PageCardLayout>
  );
}

export { Users };
