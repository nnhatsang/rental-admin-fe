'use client';

import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { useDeleteRentalOrders } from '../hooks/mutations';
import type { RentalOrderListItem } from '../model';

type RentalOrderDeleteConfirmDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orders: RentalOrderListItem[];
  onSuccess?: () => void;
};

export function RentalOrderDeleteConfirmDialog({
  open,
  onOpenChange,
  orders,
  onSuccess,
}: RentalOrderDeleteConfirmDialogProps) {
  const deleteMutation = useDeleteRentalOrders();
  const isMulti = orders.length > 1;

  const handleDelete = () => {
    if (!orders.length) return;

    onOpenChange(false);
    deleteMutation.mutate(
      orders.map((order) => order.id),
      { onSuccess },
    );
  };

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Xóa đơn thuê"
      desc={
        isMulti ? (
          `Bạn có chắc chắn muốn xóa ${orders.length} đơn thuê đã chọn? Chỉ các đơn mới tạo hoặc đã hủy được phép xóa.`
        ) : (
          <>
            Bạn có chắc chắn muốn xóa đơn <strong>{orders[0]?.code}</strong>? Chỉ đơn mới tạo hoặc đã hủy được phép xóa.
          </>
        )
      }
      confirmText="Xóa đơn"
      cancelBtnText="Đóng"
      destructive
      isLoading={deleteMutation.isPending}
      handleConfirm={handleDelete}
    />
  );
}
