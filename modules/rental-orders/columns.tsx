'use client';

import { ProtectedAction } from '@/components/shared/protected-action';
import { CopyText } from '@/components/shared/copy-text';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatCurrency, formatDate } from '@/lib/utils';
import { PermissionCode } from '@/utils/consts/rbac.const';
import {
  IconDots,
  IconEdit,
  IconEye,
  IconPackageExport,
  IconPackageImport,
  IconReceipt,
  IconRotateClockwise,
  IconTool,
  IconWallet,
  IconX,
} from '@tabler/icons-react';
import type { ColumnDef, Row } from '@tanstack/react-table';
import { useEffect, useState } from 'react';
import { RentalOrderBadge } from './components/status-badge';
import {
  handoverStatusConfig,
  orderSourceConfig,
  orderSourceOptions,
  orderStatusConfig,
  orderStatusOptions,
  pickupMethodConfig,
  pickupMethodOptions,
  rentalOrderScheduleBadgeConfig,
  returnStatusConfig,
  settlementStatusConfig,
  settlementStatusOptions,
} from './display-config';
import { formatRentalDuration, getRentalOrderScheduleBadge } from './display-utils';
import { useRentalOrders, type RentalOrderDialogType } from './rental-orders-provider';
import type { RentalOrderListItem } from './model';

function useCurrentTime() {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  return now;
}

function CodeCell({ order }: { order: RentalOrderListItem }) {
  return (
    <div className="min-w-[135px] gap-1">
      <CopyText text={String(order.code)} className="py-1 font-bold text-primary underline">
        <span>#{order.code}</span>
      </CopyText>
      <div className="text-xs text-muted-foreground">{formatDate(order.createdAt, 'shortDateTime')}</div>
      <div className="grid gap-1">
        <RentalOrderBadge config={orderSourceConfig[order.source]} className="mt-1 w-fit" />
        <RentalOrderBadge config={pickupMethodConfig[order.pickupMethod]} />
      </div>
    </div>
  );
}

function RentalPeriodCell({ order }: { order: RentalOrderListItem }) {
  const now = useCurrentTime();
  const scheduleBadge = getRentalOrderScheduleBadge(order, now);

  return (
    <div className="min-w-[210px] text-sm">
      <div className="font-medium">{formatDate(order.startDate, 'shortDateTime')}</div>
      <div className="text-muted-foreground">{formatDate(order.endDate, 'shortDateTime')}</div>
      <div className="mt-1 text-xs text-muted-foreground">{formatRentalDuration(order.startDate, order.endDate)}</div>
      {scheduleBadge ? (
        <RentalOrderBadge
          config={rentalOrderScheduleBadgeConfig[scheduleBadge.kind]}
          label={scheduleBadge.label}
          className="mt-1"
        />
      ) : null}
    </div>
  );
}

function OperationStatusCell({ order }: { order: RentalOrderListItem }) {
  return (
    <div className="min-w-[170px] grid gap-1">
      <RentalOrderBadge config={orderStatusConfig[order.status]} />
      <div className="text-xs text-muted-foreground">Bàn giao: {handoverStatusConfig[order.handoverStatus].label}</div>
      <div className="text-xs text-muted-foreground">Trả máy: {returnStatusConfig[order.returnStatus].label}</div>
    </div>
  );
}

function SettlementCell({ order }: { order: RentalOrderListItem }) {
  return (
    <div className="min-w-[165px] grid gap-1">
      <RentalOrderBadge config={settlementStatusConfig[order.settlementStatus]} />
      <div className="text-xs text-muted-foreground">
        Đã thu {formatCurrency(order.paidTotal)} / Tổng {formatCurrency(order.totalCustomerObligation)}
      </div>
      {order.bookingHoldTotal > 0 ? (
        <div className="text-xs text-muted-foreground">Đặt lịch {formatCurrency(order.bookingHoldTotal)}</div>
      ) : null}
    </div>
  );
}

function DueCell({ order }: { order: RentalOrderListItem }) {
  if (order.refundDue > 0) {
    return (
      <div className="min-w-[135px]">
        <RentalOrderBadge config={settlementStatusConfig.REFUND_DUE} label="Cần hoàn" />
        <div className="mt-1 font-medium">{formatCurrency(order.refundDue)}</div>
      </div>
    );
  }

  if (order.additionalChargeDue > 0) {
    return (
      <div className="min-w-[135px]">
        <RentalOrderBadge config={settlementStatusConfig.PAYMENT_DUE} label="Cần thu thêm" />
        <div className="mt-1 font-medium">{formatCurrency(order.additionalChargeDue)}</div>
      </div>
    );
  }

  return (
    <div className="min-w-[135px]">
      <RentalOrderBadge
        config={order.amountDueBeforeHandover > 0 ? handoverStatusConfig.PENDING_PAYMENT : handoverStatusConfig.READY}
        label={order.amountDueBeforeHandover > 0 ? 'Còn trước bàn giao' : 'Đủ điều kiện bàn giao'}
      />
      <div className="mt-1 text-sm text-muted-foreground">{formatCurrency(order.amountDueBeforeHandover)}</div>
    </div>
  );
}

function ActionsCell({ row }: { row: Row<RentalOrderListItem> }) {
  const { setCurrentRow, setOpen } = useRentalOrders();
  const order = row.original;
  const open = (dialog: RentalOrderDialogType) => {
    setCurrentRow(order);
    setOpen(dialog);
  };

  const canRecordPayment =
    order.status !== 'DONE' &&
    order.status !== 'CANCELLED' &&
    (order.settlementStatus === 'PAYMENT_DUE' || order.amountDueBeforeHandover > 0 || order.additionalChargeDue > 0);
  const canRefund = order.refundDue > 0;
  const canInspect = order.status === 'RETURNED' && order.returnStatus === 'RETURNED';
  const canSettle =
    order.status === 'RETURNED' && order.returnStatus === 'INSPECTED' && order.settlementStatus === 'SETTLED';

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={`Thao tác đơn ${order.code}`}
          className="data-[state=open]:bg-muted"
        >
          <IconDots aria-hidden="true" data-icon="inline-start" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuGroup>
          <ProtectedAction permission={PermissionCode.OrdersRead}>
            <DropdownMenuItem onClick={() => open('detail')}>
              <IconEye aria-hidden="true" data-icon="inline-start" />
              Xem chi tiết
            </DropdownMenuItem>
          </ProtectedAction>
          {order.status === 'CREATED' ? (
            <ProtectedAction permission={PermissionCode.OrdersUpdate}>
              <DropdownMenuItem onClick={() => open('update')}>
                <IconEdit aria-hidden="true" data-icon="inline-start" />
                Sửa đơn thuê
              </DropdownMenuItem>
            </ProtectedAction>
          ) : null}
        </DropdownMenuGroup>

        {canRecordPayment ? (
          <>
            <DropdownMenuSeparator />
            <ProtectedAction permission={PermissionCode.OrdersRecordPayment}>
              <DropdownMenuItem onClick={() => open('payment')}>
                <IconWallet aria-hidden="true" data-icon="inline-start" />
                Ghi nhận thanh toán
              </DropdownMenuItem>
            </ProtectedAction>
          </>
        ) : null}

        {order.status === 'CONFIRMED' ? (
          <>
            <DropdownMenuSeparator />
            <ProtectedAction permission={PermissionCode.OrdersUpdateStatus} actionType="disable">
              <DropdownMenuItem
                disabled={order.handoverStatus !== 'READY'}
                onClick={() => open('handover')}
                title={order.handoverStatus !== 'READY' ? 'Cần thanh toán đủ trước khi bàn giao' : undefined}
              >
                <IconPackageExport aria-hidden="true" data-icon="inline-start" />
                Bàn giao máy
              </DropdownMenuItem>
            </ProtectedAction>
          </>
        ) : null}

        {order.status === 'RENTING' ? (
          <>
            <DropdownMenuSeparator />
            <ProtectedAction permission={PermissionCode.OrdersUpdateStatus}>
              <DropdownMenuItem onClick={() => open('return')}>
                <IconPackageImport aria-hidden="true" data-icon="inline-start" />
                Nhận trả máy
              </DropdownMenuItem>
            </ProtectedAction>
          </>
        ) : null}

        {canInspect || canSettle ? <DropdownMenuSeparator /> : null}
        {canInspect ? (
          <ProtectedAction permission={PermissionCode.OrdersUpdateStatus}>
            <DropdownMenuItem onClick={() => open('inspection')}>
              <IconTool aria-hidden="true" data-icon="inline-start" />
              Kiểm tra thiết bị
            </DropdownMenuItem>
          </ProtectedAction>
        ) : null}
        {canSettle ? (
          <ProtectedAction permission={PermissionCode.OrdersUpdateStatus}>
            <DropdownMenuItem onClick={() => open('settle')}>
              <IconReceipt aria-hidden="true" data-icon="inline-start" />
              Đóng đơn
            </DropdownMenuItem>
          </ProtectedAction>
        ) : null}

        {canRefund || order.status === 'CREATED' || order.status === 'CONFIRMED' ? <DropdownMenuSeparator /> : null}
        {canRefund ? (
          <ProtectedAction permission={PermissionCode.OrdersRefund}>
            <DropdownMenuItem onClick={() => open('refund')}>
              <IconRotateClockwise aria-hidden="true" data-icon="inline-start" />
              Hoàn tiền
            </DropdownMenuItem>
          </ProtectedAction>
        ) : null}
        {order.status === 'CREATED' || order.status === 'CONFIRMED' ? (
          <ProtectedAction permission={PermissionCode.OrdersCancel}>
            <DropdownMenuItem variant="destructive" onClick={() => open('cancel')}>
              <IconX aria-hidden="true" data-icon="inline-start" />
              Hủy đơn
            </DropdownMenuItem>
          </ProtectedAction>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export const columns: ColumnDef<RentalOrderListItem>[] = [
  {
    accessorKey: 'code',
    header: 'Mã đơn',
    cell: ({ row }) => <CodeCell order={row.original} />,
    enableColumnFilter: false,
  },
  {
    accessorKey: 'source',
    header: 'Nguồn đơn',
    meta: {
      filterOnly: true,
      label: 'Nguồn đơn',
      variant: 'select',
      filterMode: 'equals',
      options: orderSourceOptions,
    },
    enableSorting: false,
    enableHiding: false,
    enableColumnFilter: true,
  },
  {
    id: 'customer',
    header: 'Khách hàng',
    cell: ({ row }) => (
      <div className="min-w-[155px]">
        <div className="font-medium">{row.original.customerSnapshot.name}</div>
        <div className="text-xs text-muted-foreground">{row.original.customerSnapshot.phone ?? '—'}</div>
      </div>
    ),
    enableSorting: false,
    enableColumnFilter: false,
  },
  {
    id: 'period',
    header: 'Lịch thuê',
    cell: ({ row }) => <RentalPeriodCell order={row.original} />,
    enableSorting: false,
    enableColumnFilter: false,
  },
  {
    accessorKey: 'pickupMethod',
    header: 'Hình thức nhận',
    meta: {
      filterOnly: true,
      label: 'Hình thức nhận',
      variant: 'select',
      filterMode: 'equals',
      options: pickupMethodOptions,
    },
    enableSorting: false,
    enableHiding: false,
    enableColumnFilter: true,
  },
  {
    accessorKey: 'status',
    header: 'Vận hành',
    cell: ({ row }) => <OperationStatusCell order={row.original} />,
    meta: {
      label: 'Trạng thái',
      variant: 'select',
      options: orderStatusOptions,
    },
  },
  {
    accessorKey: 'settlementStatus',
    header: 'Thanh toán',
    cell: ({ row }) => <SettlementCell order={row.original} />,
    meta: {
      label: 'Thanh toán',
      variant: 'select',
      options: settlementStatusOptions,
    },
  },
  {
    accessorKey: 'amountDueBeforeHandover',
    header: 'Công nợ',
    cell: ({ row }) => <DueCell order={row.original} />,
    enableColumnFilter: false,
  },
  {
    id: 'actions',
    cell: ActionsCell,
    meta: { disableColumnActions: true, isActionsColumn: true },
    size: 70,
  },
];
