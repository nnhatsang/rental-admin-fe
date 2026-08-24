'use client';

import { BadgeCustom } from '@/components/shared/badge-custom';
import { ProtectedAction } from '@/components/shared/protected-action';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn, formatCurrency, formatDate } from '@/lib/utils';
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
import {
  orderStatusConfig,
  orderStatusOptions,
  paymentStatusConfig,
  paymentStatusOptions,
  refundStatusConfig,
  refundStatusOptions,
  rentalOrderScheduleBadgeConfig,
} from './display-config';
import { useRentalOrders } from './rental-orders-provider';
import type { IRentalOrderListItemOut } from './type';
import {
  calculateAmountDueAtHandover,
  calculateOrderOutstandingAmount,
  calculateRefundDue,
  calculateRentalOrderSettlementFinancials,
  canUseRecordPaymentAction,
  canUseRefundAction,
  canUseRentalOrderAction,
  formatRentalDuration,
  getRentalOrderScheduleBadges,
  shouldShowRecordPaymentAction,
  shouldShowRefundAction,
  shouldShowRentalOrderAction,
} from './utils';

function RentalOrderActionsCell({ row }: { row: Row<IRentalOrderListItemOut> }) {
  const { setOpen, setCurrentRow } = useRentalOrders();
  const order = row.original;
  const canEdit = order.status === 'CREATED' || order.status === 'CONFIRMED';
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

        {canEdit ? (
          <ProtectedAction permission={PermissionCode.OrdersUpdate}>
            <DropdownMenuItem
              onClick={() => {
                setCurrentRow(order);
                setOpen('edit');
              }}
            >
              <IconEdit className="mr-2 size-4" />
              Cập nhật đơn thuê
            </DropdownMenuItem>
          </ProtectedAction>
        ) : null}

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
    cell: ({ row }) => {
      const order = row.original;

      return (
        <div className="min-w-[150px]">
          <div className="font-medium whitespace-nowrap">{order.code}</div>
          <div className="mt-0.5 text-xs text-muted-foreground whitespace-nowrap">{formatDate(order.createdAt)}</div>
          <div className={cn('text-xs font-bold', order.source === 'ADMIN' ? 'text-primary' : 'text-second')}>
            {order.source}
          </div>
        </div>
      );
    },
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
    header: 'Lịch thuê',
    cell: ({ row }) => {
      const order = row.original;
      const scheduleBadges = getRentalOrderScheduleBadges(order);

      return (
        <div className="flex flex-col gap-1">
          <div className="whitespace-nowrap text-sm">
            {formatDate(order.startDate)} → {formatDate(order.endDate)}
          </div>
          <div className="flex max-w-[220px] flex-wrap items-center gap-1">
            <Badge variant="outline" className="w-fit border-muted-foreground/20 bg-muted text-[11px] text-muted-foreground">
              {formatRentalDuration({
                from: new Date(order.startDate),
                to: new Date(order.endDate),
              })}
            </Badge>
            {scheduleBadges.map((badge) => {
              const config = rentalOrderScheduleBadgeConfig[badge];

              return (
                <Badge key={badge} variant="outline" className={cn('w-fit text-[11px]', config.className)}>
                  {config.label}
                </Badge>
              );
            })}
          </div>
        </div>
      );
    },
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
    cell: ({ row }) => {
      const order = row.original;
      const handoverDue = calculateAmountDueAtHandover(order);
      const settlement = calculateRentalOrderSettlementFinancials(order);
      const helperText =
        order.status === 'DONE'
          ? settlement.additionalChargeDue > 0
            ? `Cần thu thêm ${formatCurrency(settlement.additionalChargeDue)}`
            : settlement.refundDue > 0
              ? `Cần hoàn ${formatCurrency(settlement.refundDue)}`
              : 'Đã quyết toán'
          : handoverDue > 0
            ? `Còn khi giao ${formatCurrency(handoverDue)}`
            : 'Đã đủ yêu cầu';

      return (
        <div className="min-w-[145px] space-y-1">
          <BadgeCustom status={order.paymentStatus} config={paymentStatusConfig} />
          <div className="whitespace-nowrap text-xs text-muted-foreground">{helperText}</div>
        </div>
      );
    },
    meta: {
      label: 'Thanh toán',
      variant: 'select',
      options: paymentStatusOptions,
    },
  },
  {
    accessorKey: 'rentalFeeTotal',
    header: 'Doanh thu thuê',
    cell: ({ row }) => {
      const order = row.original;
      const settlement = calculateRentalOrderSettlementFinancials(order);
      const rentalFee = order.rentalFeeTotal ?? 0;
      const deliveryFee = order.deliveryFeeTotal ?? 0;
      const discount = order.discountTotal ?? 0;

      return (
        <div className="min-w-[165px]">
          <div className="whitespace-nowrap text-sm font-medium">{formatCurrency(settlement.rentalRevenueTotal)}</div>
          <div className="whitespace-nowrap text-xs text-muted-foreground">
            Thuê {formatCurrency(rentalFee)}
            {deliveryFee > 0 ? <> · Giao {formatCurrency(deliveryFee)}</> : null}
            {discount > 0 ? <> · Giảm {formatCurrency(discount)}</> : null}
          </div>
        </div>
      );
    },
    // enableSorting: false,
    enableColumnFilter: false,
  },
  {
    accessorKey: 'paidTotal',
    header: 'Đã thu',
    cell: ({ row }) => {
      const order = row.original;
      const paidTotal = order.paidTotal ?? 0;
      const bookingHoldTotal = order.bookingHoldTotal ?? 0;

      return (
        <div className="min-w-[120px] whitespace-nowrap">
          <div className="text-sm font-medium">{formatCurrency(paidTotal)}</div>
          <div className="text-xs text-muted-foreground">
            {bookingHoldTotal > 0 ? `Giữ lịch ${formatCurrency(bookingHoldTotal)}` : 'Chưa có giữ lịch'}
          </div>
        </div>
      );
    },
    enableSorting: false,
    enableColumnFilter: false,
  },
  {
    accessorKey: 'handoverRequiredTotal',
    header: 'Yêu cầu khi giao',
    cell: ({ row }) => {
      const order = row.original;
      const handoverRequiredTotal = order.handoverRequiredTotal ?? 0;
      const estimatedRefundTotal = order.estimatedRefundTotal ?? 0;

      return (
        <div className="min-w-[150px]">
          <div className="whitespace-nowrap text-sm font-medium">{formatCurrency(handoverRequiredTotal)}</div>
          <div className="whitespace-nowrap text-xs text-muted-foreground">
            Hoàn dự kiến {formatCurrency(estimatedRefundTotal)}
          </div>
        </div>
      );
    },
    enableSorting: false,
    enableColumnFilter: false,
  },
  {
    id: 'amountDue',
    header: 'Quyết toán',
    cell: ({ row }) => {
      const order = row.original;
      const amount = calculateOrderOutstandingAmount(order);
      const handoverDue = calculateAmountDueAtHandover(order);
      const settlement = calculateRentalOrderSettlementFinancials(order);
      const helperText =
        order.status === 'DONE'
          ? settlement.additionalChargeDue > 0
            ? 'Cần thu thêm'
            : settlement.refundDue > 0
              ? 'Cần hoàn'
              : 'Đã quyết toán'
          : order.status === 'CREATED'
            ? 'Giữ lịch'
            : handoverDue > 0
              ? `Khi giao ${formatCurrency(handoverDue)}`
              : 'Đã đủ';

      return (
        <div className="min-w-[145px]">
          <div
            className={cn(
              'whitespace-nowrap text-sm font-medium',
              amount > 0 && 'text-destructive',
              order.status === 'DONE' && settlement.refundDue > 0 && 'text-primary',
            )}
          >
            {formatCurrency(amount > 0 ? amount : settlement.refundDue)}
          </div>
          <div className="whitespace-nowrap text-xs text-muted-foreground">{helperText}</div>
        </div>
      );
    },
    enableColumnFilter: false,
    enableSorting: false,
  },
  {
    accessorKey: 'refundStatus',
    header: 'Hoàn cọc',
    cell: ({ row }) => {
      const order = row.original;
      const refundDue = calculateRefundDue(order);
      const refundedAmount = order.actualRefundTotal ?? 0;
      const amountLabel = refundDue > 0 ? 'Cần hoàn' : refundedAmount > 0 ? 'Đã hoàn' : 'Không phát sinh';
      const amountValue = refundDue > 0 ? refundDue : refundedAmount;

      return (
        <div className="min-w-[145px] space-y-1">
          <BadgeCustom status={order.refundStatus} config={refundStatusConfig} />
          <div className="space-y-0.5">
            <div className="whitespace-nowrap text-xs text-muted-foreground">{amountLabel}</div>
            <div
              className={cn(
                'whitespace-nowrap text-sm font-medium',
                refundDue > 0 ? 'text-primary' : 'text-muted-foreground',
              )}
            >
              {amountValue > 0 ? formatCurrency(amountValue) : '—'}
            </div>
          </div>
        </div>
      );
    },
    meta: {
      label: 'Hoàn cọc',
      variant: 'select',
      options: refundStatusOptions,
    },
  },
  {
    id: 'extraFees',
    header: 'Phí phát sinh',
    cell: ({ row }) => {
      const lateFee = row.original.lateFeeTotal ?? 0;
      const damageFee = row.original.damageFeeTotal ?? 0;
      const compensationFee = row.original.compensationFeeTotal ?? 0;
      const amount = calculateRentalOrderSettlementFinancials(row.original).incidentFeeTotal;

      return (
        <div className="min-w-[135px] whitespace-nowrap">
          {amount > 0 ? (
            <div>
              <div className="font-medium">+{formatCurrency(amount)}</div>
              <div className="text-xs text-muted-foreground">
                {lateFee > 0 ? <>Trễ {formatCurrency(lateFee)}</> : null}
                {damageFee > 0 ? (
                  <>
                    {lateFee > 0 ? ' · ' : ''}Hư hỏng {formatCurrency(damageFee)}
                  </>
                ) : null}
                {compensationFee > 0 ? (
                  <>
                    {lateFee + damageFee > 0 ? ' · ' : ''}Bồi thường {formatCurrency(compensationFee)}
                  </>
                ) : null}
              </div>
            </div>
          ) : (
            <span className="text-muted-foreground">—</span>
          )}
        </div>
      );
    },
    enableSorting: false,
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
