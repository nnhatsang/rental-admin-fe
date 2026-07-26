'use client';

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { RentalOrderCreateWizard } from './create';
import { useRentalOrders } from './rental-orders-provider';

export function RentalOrderDialogs() {
  const { open, setOpen } = useRentalOrders();
  const isCreateOpen = open === 'create';

  return (
    <Dialog open={isCreateOpen} onOpenChange={(nextOpen) => setOpen(nextOpen ? 'create' : null)}>
      <DialogContent className="max-h-[92dvh] overflow-y-auto sm:max-w-6xl">
        <DialogHeader>
          <DialogTitle>Tạo đơn thuê</DialogTitle>
          <DialogDescription>Kiểm tra lịch trống, chọn sản phẩm và tạo đơn nháp trong một flow.</DialogDescription>
        </DialogHeader>
        <RentalOrderCreateWizard mode="dialog" onCreated={() => setOpen(null)} />
      </DialogContent>
    </Dialog>
  );
}
