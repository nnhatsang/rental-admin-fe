'use client';

import { DataTable } from "@/components/ui/data-table";
import { useUsersLogic } from "./hooks/user-logic";
import { BulkActions } from "./bulk-action";
import { UserDialogs } from "./dialog";
import { UsersProvider } from "./users-provider";

function Content() {
  const { table } = useUsersLogic();

  return (
    <>
      <DataTable table={table} />
      <BulkActions table={table} />
      <UserDialogs table={table} />
    </>
  );
}

export default function Users() {
  return (
    <UsersProvider>
      <Content />
    </UsersProvider>
  );
}
