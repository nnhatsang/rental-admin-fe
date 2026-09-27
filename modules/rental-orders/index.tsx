'use client';

import { DataTable } from '@/components/ui/data-table';
import { RentalOrderBulkActions } from './bulk-action';
import { RentalOrderDialogs } from './dialogs';
import { useRentalOrdersLogic } from './hooks/rental-order-logic';
import { RentalOrdersProvider } from './rental-orders-provider';

function Content() {
  const { table } = useRentalOrdersLogic();
  return (
    <>
      <DataTable table={table} />
      <RentalOrderBulkActions table={table} />
      <RentalOrderDialogs table={table} />
    </>
  );
}

export default function RentalOrders() {
  return <RentalOrdersProvider><Content /></RentalOrdersProvider>;
}
