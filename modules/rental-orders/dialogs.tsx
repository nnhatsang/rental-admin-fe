'use client';

import { CreateRentalOrderDialog } from './components/create/create-rental-order-dialog';
import { RentalOrderActionDialog, type RentalOrderAction } from './components/actions/rental-order-action-dialog';
import { RentalOrderDetailDialog } from './components/detail/rental-order-detail-dialog';
import { UpdateRentalOrderDialog } from './components/update/update-rental-order-dialog';
import { useRentalOrders } from './rental-orders-provider';

export function RentalOrderDialogs() {
  const { open, setOpen, currentRow } = useRentalOrders();
  const action: RentalOrderAction | null = open && !['create', 'update', 'detail'].includes(open) ? open as RentalOrderAction : null;
  return <>
    <CreateRentalOrderDialog open={open === 'create'} onOpenChange={(next) => setOpen(next ? 'create' : null)} />
    <UpdateRentalOrderDialog
      open={open === 'update'}
      orderId={currentRow?.id ?? null}
      orderCode={currentRow?.code}
      onOpenChange={(next) => setOpen(next ? 'update' : null)}
    />
    <RentalOrderDetailDialog open={open === 'detail'} onOpenChange={(next) => setOpen(next ? 'detail' : null)} />
    <RentalOrderActionDialog open={Boolean(action)} action={action} orderId={currentRow?.id ?? null} onOpenChange={(next) => setOpen(next && action ? action : null)} />
  </>;
}
