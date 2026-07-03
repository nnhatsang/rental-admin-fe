'use client';

import { IconPlus } from '@tabler/icons-react';
import { PageCardLayout } from '@/components/shared/page-card-layout';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { TITLE_PAGE } from '@/utils/consts/title-page.const';
import { RoleDialogs } from './dialog';
import { useRolesState } from './hooks/use-roles-state';

export default function Roles() {
  const state = useRolesState();

  return (
    <PageCardLayout
      title={TITLE_PAGE.ROLES.INDEX}
      description={TITLE_PAGE.ROLES.DESCRIPTION}
      actions={
        <Button
          size="lg"
          onClick={() => {
            state.setSelectedRole(null);
            state.setIsFormOpen(true);
          }}
        >
          <IconPlus className="mr-1.5 size-4" /> {TITLE_PAGE.ROLES.ACTIONS.CREATE}
        </Button>
      }
    >
      <DataTable table={state.table} pageSizeOptions={[10, 20, 30, 50]} />
      <RoleDialogs state={state} />
    </PageCardLayout>
  );
}

export { Roles };
