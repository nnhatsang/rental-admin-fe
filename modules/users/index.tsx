'use client';

import { DataTable } from '@/components/ui/data-table';
import { UserDialogs } from './dialog';
import { useUsersState } from './hooks/user-logic';
import { UsersProvider } from './users-provider';
import { BulkActions } from './bulk-action';

function UsersContent() {
  const state = useUsersState();

  return (
    <>
      <DataTable table={state.table} />
      <BulkActions table={state.table} />
      <UserDialogs table={state.table} />
    </>
  );
}

export default function Users() {
  return (
    <UsersProvider>
      <UsersContent />
    </UsersProvider>
  );
}

export { Users };
