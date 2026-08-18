'use client';

import { ProtectedAction } from '@/components/shared/protected-action';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatCurrency, formatDate } from '@/lib/utils';
import { PermissionCode } from '@/utils/consts/rbac.const';
import {
  IconArrowBack,
  IconCreditCard,
  IconDots,
  IconEdit,
  IconEye,
  IconPackageExport,
  IconPackageImport,
  IconTrash,
  IconX,
} from '@tabler/icons-react';
import type { ColumnDef, Row } from '@tanstack/react-table';
import { orderStatusConfig, orderStatusOptions, paymentStatusConfig, paymentStatusOptions } from './display-config';
import { useRentalOrders } from './rental-orders-provider';
import type { IRentalOrderListItemOut } from './type';
import {
  canUseRecordPaymentAction,
  canUseRefundAction,
  canUseRentalOrderAction,
  formatRentalDuration,
  shouldShowRecordPaymentAction,
  shouldShowRefundAction,
  shouldShowRentalOrderAction,
} from './utils';
import { BadgeCustom } from '@/components/shared/badge-custom';



function RentalOrderActionsCell({ row }: { row: Row<IRentalOrderListItemOut> }) {
  const { setOpen, setCurrentRow } = useRentalOrders();
  const order = row.original;
  const canEdit = canUseRentalOrderAction(order.status, 'updateCustomerSnapshot');
  const canRecordPayment = canUseRecordPaymentAction(order);
  const canHandover = canUseRentalOrderAction(order.status, 'handover');
  const canComplete = canUseRentalOrderAction(order.status, 'complete');
  const canRefund = canUseRefundAction(order);
  const canCancel = canUseRentalOrderAction(order.status, 'cancel');
  const canDelete = canUseRentalOrderAction(order.status, 'delete');

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="flex h-8 w-8 p-0 data-[state=open]:bg-muted">
          <IconDots className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <ProtectedAction permission={PermissionCode.OrdersRead}>
          <DropdownMenuItem
            onClick={() => {
              setCurrentRow(order);
              setOpen('view');
            }}
          >
            <IconEye className="mr-2 size-4" />
            Xem chi tiết
          </DropdownMenuItem>
        </ProtectedAction>
        <ProtectedAction permission={PermissionCode.OrdersUpdate}>
          <DropdownMenuItem
            disabled={!canEdit}
            onClick={() => {
              if (!canEdit) return;
              setCurrentRow(order);
              setOpen('edit');
            }}
          >
            <IconEdit className="mr-2 size-4" />
            Cập nhật đơn thuê
          </DropdownMenuItem>
        </ProtectedAction>
        {shouldShowRecordPaymentAction(order) ? (
          <ProtectedAction permission={PermissionCode.OrdersRecordPayment}>
            <DropdownMenuItem
              disabled={!canRecordPayment}
              onClick={() => {
                if (!canRecordPayment) return;
                setCurrentRow(order);
                setOpen('payment');
              }}
            >
              <IconCreditCard className="mr-2 size-4" />
              Ghi nhận thanh toán
            </DropdownMenuItem>
          </ProtectedAction>
        ) : null}
        {shouldShowRentalOrderAction(order.status, 'handover') ? (
          <ProtectedAction permission={PermissionCode.OrdersUpdateStatus}>
            <DropdownMenuItem
              disabled={!canHandover}
              onClick={() => {
                if (!canHandover) return;
                setCurrentRow(order);
                setOpen('handover');
              }}
            >
              <IconPackageExport className="mr-2 size-4" />
              Bàn giao & thu cọc
            </DropdownMenuItem>
          </ProtectedAction>
        ) : null}
        {shouldShowRentalOrderAction(order.status, 'complete') ? (
          <ProtectedAction permission={PermissionCode.OrdersUpdateStatus}>
            <DropdownMenuItem
              disabled={!canComplete}
              onClick={() => {
                if (!canComplete) return;
                setCurrentRow(order);
                setOpen('complete');
              }}
            >
              <IconPackageImport className="mr-2 size-4" />
              Nhận trả máy
            </DropdownMenuItem>
          </ProtectedAction>
        ) : null}
        {shouldShowRefundAction(order) ? (
          <ProtectedAction permission={PermissionCode.OrdersRecordPayment}>
            <DropdownMenuItem
              disabled={!canRefund}
              onClick={() => {
                if (!canRefund) return;
                setCurrentRow(order);
                setOpen('refund');
              }}
            >
              <IconArrowBack className="mr-2 size-4" />
              Hoàn tiền
            </DropdownMenuItem>
          </ProtectedAction>
        ) : null}
        {shouldShowRentalOrderAction(order.status, 'cancel') ? (
          <ProtectedAction permission={PermissionCode.OrdersCancel}>
            <DropdownMenuItem
              disabled={!canCancel}
              onClick={() => {
                if (!canCancel) return;
                setCurrentRow(order);
                setOpen('cancel');
              }}
            >
              <IconX className="mr-2 size-4" />
              Hủy đơn
            </DropdownMenuItem>
          </ProtectedAction>
        ) : null}
        {shouldShowRentalOrderAction(order.status, 'delete') ? (
          <ProtectedAction permission={PermissionCode.OrdersCancel}>
            <DropdownMenuItem
              disabled={!canDelete}
              onClick={() => {
                if (!canDelete) return;
                setCurrentRow(order);
                setOpen('delete');
              }}
              className="text-destructive focus:text-destructive"
            >
              <IconTrash className="mr-2 size-4" />
              Xóa đơn
            </DropdownMenuItem>
          </ProtectedAction>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export const columns: ColumnDef<IRentalOrderListItemOut>[] = [
  {
    accessorKey: 'code',
    header: 'Mã đơn',
    cell: ({ row }) => (
      <div className="min-w-0">
        <div className="font-medium">{row.original.code}</div>
        <div className="text-xs text-muted-foreground">{row.original.source}</div>
      </div>
    ),
    enableSorting: false,
    enableColumnFilter: false,
  },

  {
    id: 'customer',
    header: 'Khách hàng',
    cell: ({ row }) => (
      <div>
        <div className="text-sm font-medium">{row.original.customerSnapshot.name ?? '-'}</div>

        <div className="text-xs text-muted-foreground">{row.original.customerSnapshot.phone ?? '-'}</div>
      </div>
    ),

    enableSorting: false,
  },

  {
    id: 'rentalPeriod',
    header: 'Thời gian thuê',
    cell: ({ row }) => (
      <div className="flex flex-col gap-0.5">
        <div className="whitespace-nowrap text-sm">
          {formatDate(row.original.startDate)} → {formatDate(row.original.endDate)}
        </div>

        <div className="whitespace-nowrap text-xs text-muted-foreground">
          {formatRentalDuration({
            from: new Date(row.original.startDate),
            to: new Date(row.original.endDate),
          })}
        </div>
      </div>
    ),
  },

  {
    accessorKey: 'status',
    header: 'Trạng thái',
    cell: ({ row }) => <BadgeCustom status={row.original.status} config={orderStatusConfig} />,
    meta: {
      label: 'Trạng thái',
      variant: 'select',
      options: orderStatusOptions,
    },
  },

  {
    accessorKey: 'paymentStatus',
    header: 'Thanh toán',
    cell: ({ row }) => <BadgeCustom status={row.original.paymentStatus} config={paymentStatusConfig} />,
    meta: {
      label: 'Thanh toán',
      variant: 'select',
      options: paymentStatusOptions,
    },
  },

  {
    id: 'amounts',
    header: 'Chi phí',
    cell: ({ row }) => {
      return (
        <div className="flex flex-col gap-0.5 whitespace-nowrap">
          <div className="">Tiền cọc: {formatCurrency(row.original.depositTotal)}</div>
          <div className="">Tiền thuê: {formatCurrency(row.original.rentalFeeTotal)}</div>
        </div>
      );
    },
  },
  {
    id: 'rentalFeeTotal',
    header: 'Đã thu',
    cell: ({ row }) => {
      return (
        <div className="whitespace-nowrap">
          <div className="font-medium">{formatCurrency(row.original.paidTotal)}</div>
        </div>
      );
    },
  },

  {
    id: 'actions',
    cell: RentalOrderActionsCell,
    meta: {
      disableColumnActions: true,
      isActionsColumn: true,
    },
    size: 80,
  },
];
