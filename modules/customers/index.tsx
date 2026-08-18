'use client';

import { DataTable } from '@/components/ui/data-table';
import { BulkActions } from './bulk-action';
import { CustomersProvider } from './customer-provider';
import { CustomerDialogs } from './dialog';
import { useCustomersLogic } from './hooks/customer-logic';

function Content() {
  const { table } = useCustomersLogic();

  return (
    <>
      <DataTable table={table} />
      <BulkActions table={table} />
      <CustomerDialogs table={table} />
    </>
  );
}

export default function Customers() {
  return (
    <CustomersProvider>
      <Content />
    </CustomersProvider>
  );
}
