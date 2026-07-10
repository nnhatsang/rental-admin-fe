'use client';

import { DataTable } from '@/components/ui/data-table';
import { useRoleLogic } from './hooks/role-logic';
import { RolesProvider } from './roles-provider';

function Content() {
  const { table } = useRoleLogic();
  return (
    <>
      <DataTable table={table} />
      {/* <BulkActions table={state.table} />
      <UserDialogs table={state.table} /> */}
    </>
  );
}
export default function Roles() {
  return (
    <RolesProvider>
      <Content />
    </RolesProvider>
  );
}
