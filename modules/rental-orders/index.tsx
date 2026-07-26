'use client';

import { DataTable } from '@/components/ui/data-table';
import { RentalOrderDialogs } from './dialog';
import { useRentalOrdersLogic } from './hooks/rental-order-logic';
import { RentalOrdersProvider } from './rental-orders-provider';

function Content() {
  const { table } = useRentalOrdersLogic();

  return (
    <>
      <DataTable table={table} />
      <RentalOrderDialogs />
    </>
  );
}

export default function RentalOrders() {
  return (
    <RentalOrdersProvider>
      <Content />
    </RentalOrdersProvider>
  );
}
