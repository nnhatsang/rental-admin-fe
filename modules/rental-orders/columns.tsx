'use client';

import { CopyText } from '@/components/shared/copy-text';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { ColumnDef } from '@tanstack/react-table';
import { useEffect, useState } from 'react';
import { RentalOrderActionsCell } from './components/actions';
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
import {
  getRentalOrderFinancialSummary,
  getRentalOrderOperationalBadges,
  type RentalOrderOperationalBadge,
} from './display-semantics';
import { formatRentalDuration, getRentalOrderScheduleBadge } from './display-utils';
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

function OperationalBadge({ badge }: { badge: RentalOrderOperationalBadge }) {
  if (badge.kind === 'handover') {
    return <RentalOrderBadge config={handoverStatusConfig[badge.status]} label={badge.label} />;
  }

  if (badge.kind === 'return') {
    return <RentalOrderBadge config={returnStatusConfig[badge.status]} label={badge.label} />;
  }

  return <RentalOrderBadge config={settlementStatusConfig[badge.status]} label={badge.label} />;
}

function OperationStatusCell({ order }: { order: RentalOrderListItem }) {
  const badges = getRentalOrderOperationalBadges(order);

  return (
    <div className="grid min-w-[190px] gap-1.5">
      <RentalOrderBadge config={orderStatusConfig[order.status]} />
      <div className="flex flex-wrap gap-1">
        {badges.map((badge) => (
          <OperationalBadge key={badge.kind} badge={badge} />
        ))}
      </div>
    </div>
  );
}

function SettlementCell({ order }: { order: RentalOrderListItem }) {
  const summary = getRentalOrderFinancialSummary(order);

  return (
    <div className="grid min-w-[205px] gap-1">
      <RentalOrderBadge config={settlementStatusConfig[summary.badgeStatus]} label={summary.label} />
      {summary.amount > 0 ? (
        <div className="text-xs font-medium text-foreground">
          {summary.amountLabel}: {formatCurrency(summary.amount)}
        </div>
      ) : null}
      <div className="text-xs text-muted-foreground">
        Đã thu {formatCurrency(order.paidTotal)} / Tổng {formatCurrency(order.totalCustomerObligation)}
      </div>
      {order.bookingHoldTotal > 0 ? (
        <div className="text-xs text-muted-foreground">Tiền giữ lịch {formatCurrency(order.bookingHoldTotal)}</div>
      ) : null}
    </div>
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
    header: 'Trạng thái đơn',
    cell: ({ row }) => <OperationStatusCell order={row.original} />,
    meta: {
      label: 'Trạng thái đơn',
      variant: 'select',
      options: orderStatusOptions,
    },
  },
  {
    accessorKey: 'settlementStatus',
    header: 'Tài chính',
    cell: ({ row }) => <SettlementCell order={row.original} />,
    meta: {
      label: 'Tài chính',
      variant: 'select',
      options: settlementStatusOptions,
    },
  },
  {
    id: 'actions',
    cell: RentalOrderActionsCell,
    meta: { disableColumnActions: true, isActionsColumn: true },
    size: 70,
  },
];
