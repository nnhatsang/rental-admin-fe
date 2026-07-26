'use client';

import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { ColumnDef } from '@tanstack/react-table';
import type { IRentalOrderOut, OrderStatus, PaymentStatus } from './type';

export const orderStatusLabels: Record<OrderStatus, string> = {
  DRAFT: 'Nháp',
  CONFIRMED: 'Đã xác nhận',
  PREPARING: 'Đang chuẩn bị',
  READY_FOR_PICKUP: 'Sẵn sàng giao',
  DELIVERING: 'Đang giao',
  RENTING: 'Đang thuê',
  OVERDUE: 'Quá hạn',
  RETURNED: 'Đã trả',
  COMPLETED: 'Hoàn tất',
  CANCELLED: 'Đã hủy',
  REFUNDING: 'Đang hoàn tiền',
  REFUNDED: 'Đã hoàn tiền',
  DISPUTED: 'Tranh chấp',
};

export const paymentStatusLabels: Record<PaymentStatus, string> = {
  UNPAID: 'Chưa thanh toán',
  PARTIALLY_PAID: 'Thanh toán một phần',
  PAID: 'Đã thanh toán',
  PARTIALLY_REFUNDED: 'Hoàn một phần',
  REFUNDED: 'Đã hoàn tiền',
};

export const orderStatusOptions = Object.entries(orderStatusLabels).map(([value, label]) => ({ value, label }));
export const paymentStatusOptions = Object.entries(paymentStatusLabels).map(([value, label]) => ({ value, label }));

function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const className =
    status === 'DRAFT'
      ? 'border-transparent bg-zinc-500/10 text-zinc-600 hover:bg-zinc-500/15'
      : status === 'CONFIRMED' || status === 'PREPARING' || status === 'READY_FOR_PICKUP'
        ? 'border-transparent bg-blue-500/10 text-blue-600 hover:bg-blue-500/15'
        : status === 'RENTING' || status === 'COMPLETED' || status === 'RETURNED'
          ? 'border-transparent bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/15'
          : status === 'OVERDUE' || status === 'DISPUTED'
            ? 'border-transparent bg-rose-500/10 text-rose-600 hover:bg-rose-500/15'
            : 'border-transparent bg-amber-500/10 text-amber-600 hover:bg-amber-500/15';

  return (
    <Badge variant="outline" className={className}>
      {orderStatusLabels[status]}
    </Badge>
  );
}

function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  const className =
    status === 'PAID'
      ? 'border-transparent bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/15'
      : status === 'UNPAID'
        ? 'border-transparent bg-zinc-500/10 text-zinc-600 hover:bg-zinc-500/15'
        : 'border-transparent bg-amber-500/10 text-amber-600 hover:bg-amber-500/15';

  return (
    <Badge variant="outline" className={className}>
      {paymentStatusLabels[status]}
    </Badge>
  );
}

export const columns: ColumnDef<IRentalOrderOut>[] = [
  {
    accessorKey: 'code',
    header: 'Mã đơn',
    cell: ({ row }) => (
      <div className="min-w-0">
        <div className="truncate text-sm font-medium text-foreground">{row.original.code}</div>
        <div className="truncate text-xs text-muted-foreground">{formatDate(row.original.createdAt)}</div>
      </div>
    ),
    meta: { label: 'Mã đơn' },
    enableColumnFilter: false,
  },
  {
    accessorKey: 'customerNameSnapshot',
    header: 'Khách hàng',
    cell: ({ row }) => (
      <div className="min-w-0">
        <div className="truncate text-sm font-medium">{row.original.customerNameSnapshot}</div>
        <div className="truncate text-xs text-muted-foreground">{row.original.customerPhoneSnapshot ?? '-'}</div>
      </div>
    ),
    meta: { label: 'Khách hàng' },
    enableColumnFilter: false,
  },
  {
    accessorKey: 'status',
    header: 'Trạng thái',
    cell: ({ row }) => <OrderStatusBadge status={row.original.status} />,
    meta: { label: 'Trạng thái', variant: 'select', options: orderStatusOptions },
  },
  {
    accessorKey: 'paymentStatus',
    header: 'Thanh toán',
    cell: ({ row }) => <PaymentStatusBadge status={row.original.paymentStatus} />,
    meta: { label: 'Thanh toán', variant: 'select', options: paymentStatusOptions },
  },
  {
    accessorKey: 'startDate',
    header: 'Thời gian thuê',
    cell: ({ row }) => (
      <div className="whitespace-nowrap text-sm">
        <div>{formatDate(row.original.startDate, 'shortDateTime')}</div>
        <div className="text-muted-foreground">{formatDate(row.original.endDate, 'shortDateTime')}</div>
      </div>
    ),
    meta: { label: 'Thời gian thuê' },
    enableColumnFilter: false,
  },
  {
    accessorKey: 'upfrontTotal',
    header: 'Tổng tiền',
    cell: ({ row }) => (
      <div className="whitespace-nowrap text-sm">
        <div>{formatCurrency(Number(row.original.upfrontTotal), { noDecimals: true })}</div>
        <div className="text-muted-foreground">
          Còn {formatCurrency(Number(row.original.remainingTotal), { noDecimals: true })}
        </div>
      </div>
    ),
    meta: { label: 'Tổng tiền' },
    enableColumnFilter: false,
  },
  {
    accessorKey: 'assignedTo',
    header: 'Phụ trách',
    cell: ({ row }) => row.original.assignedTo?.fullName ?? '-',
    meta: { label: 'Phụ trách' },
    enableSorting: false,
    enableColumnFilter: false,
  },
  {
    accessorKey: 'updatedAt',
    header: 'Cập nhật',
    cell: ({ row }) => <span className="text-sm text-muted-foreground">{formatDate(row.original.updatedAt)}</span>,
    meta: { label: 'Cập nhật' },
    enableColumnFilter: false,
  },
];
