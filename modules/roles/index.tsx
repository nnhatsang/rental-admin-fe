'use client';

import { DataTable } from '@/components/ui/data-table';
import { useRoleLogic } from './hooks/use-role-logic';
import { RolesProvider } from './roles-provider';
import { RoleDialogs } from './dialog';
import { BulkActions } from './bulk-action';

function Content() {
  const { table } = useRoleLogic();
  return (
    <>
      <DataTable table={table} />
      <BulkActions table={table} />
      <RoleDialogs table={table} />
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
