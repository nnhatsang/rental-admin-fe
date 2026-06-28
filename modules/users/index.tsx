'use client';

import { PageCardLayout } from '@/components/shared/page-card-layout';
import { TITLE_PAGE } from '@/utils/consts/title-page.const';
import { useUsersState } from './hooks/use-users-state';
import { UsersFilters } from './action';
import { UsersTable } from './table';
import { UserDialogs } from './dialog';

export default function Users() {
  const state = useUsersState();

  return (
    <PageCardLayout
      title={TITLE_PAGE.USERS.INDEX}
      description={TITLE_PAGE.USERS.DESCRIPTION}
      actions={<UsersFilters state={state} />}
    >
      <UsersTable state={state} />
      <UserDialogs state={state} />
    </PageCardLayout>
  );
}
export { Users };
