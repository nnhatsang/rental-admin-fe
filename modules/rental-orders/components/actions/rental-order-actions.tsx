'use client';

import * as React from 'react';
import type { Row } from '@tanstack/react-table';
import type { TablerIcon } from '@tabler/icons-react';
import {
  IconDots,
  IconEdit,
  IconEye,
  IconLock,
  IconPackageExport,
  IconPackageImport,
  IconReceipt,
  IconRotateClockwise,
  IconTool,
  IconWallet,
  IconX,
} from '@tabler/icons-react';

import { ContextMenuItem, ContextMenuSeparator } from '@/components/ui/context-menu';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { usePermission } from '@/hooks/use-permission';
import { PermissionCode } from '@/utils/consts/rbac.const';

import { useRentalOrders, type RentalOrderDialogType } from '../../rental-orders-provider';
import { getRentalOrderFinancialSummary } from '../../display-semantics';
import type { RentalOrderListItem } from '../../model';

type RentalOrderActionMenu = 'dropdown' | 'context';

type RentalOrderActionContext = {
  order: RentalOrderListItem;
};

type RentalOrderActionDefinition = {
  id: string;
  section: string;
  label: string;
  icon: TablerIcon;
  permission: PermissionCode;
  dialog: RentalOrderDialogType;
  actionType?: 'hide' | 'disable';
  visible?: (context: RentalOrderActionContext) => boolean;
  disabled?: (context: RentalOrderActionContext) => boolean;
  title?: (context: RentalOrderActionContext) => string | undefined;
  variant?: 'default' | 'destructive';
};

type RentalOrderAction = Omit<RentalOrderActionDefinition, 'visible' | 'disabled' | 'title' | 'dialog'> & {
  onSelect: () => void;
  disabled?: boolean;
  title?: string;
};

const RENTAL_ORDER_ACTIONS: readonly RentalOrderActionDefinition[] = [
  {
    id: 'detail',
    section: 'general',
    label: 'Xem chi tiết',
    icon: IconEye,
    permission: PermissionCode.OrdersRead,
    dialog: 'detail',
  },
  {
    id: 'update',
    section: 'general',
    label: 'Sửa đơn thuê',
    icon: IconEdit,
    permission: PermissionCode.OrdersUpdate,
    dialog: 'update',
    visible: ({ order }) => order.status === 'CREATED',
  },
  {
    id: 'payment',
    section: 'payment',
    label: 'Ghi nhận thanh toán',
    icon: IconWallet,
    permission: PermissionCode.OrdersRecordPayment,
    dialog: 'payment',
    visible: ({ order }) => {
      const financial = getRentalOrderFinancialSummary(order);
      return (
        financial.kind === 'BOOKING_PAYMENT_DUE' ||
        financial.kind === 'PRE_HANDOVER_PAYMENT_DUE' ||
        financial.kind === 'ADDITIONAL_CHARGE_DUE'
      );
    },
  },
  {
    id: 'return',
    section: 'return',
    label: 'Nhận trả máy',
    icon: IconPackageImport,
    permission: PermissionCode.OrdersUpdateStatus,
    dialog: 'return',
    visible: ({ order }) => order.status === 'RENTING',
  },
  {
    id: 'handover',
    section: 'handover',
    label: 'Bàn giao máy',
    icon: IconPackageExport,
    permission: PermissionCode.OrdersUpdateStatus,
    dialog: 'handover',
    actionType: 'disable',
    visible: ({ order }) => order.status === 'CONFIRMED',
    disabled: ({ order }) => order.handoverStatus !== 'READY',
    title: ({ order }) => (order.handoverStatus !== 'READY' ? 'Cần thanh toán đủ trước khi bàn giao' : undefined),
  },
  {
    id: 'inspection',
    section: 'settlement',
    label: 'Kiểm tra thiết bị',
    icon: IconTool,
    permission: PermissionCode.OrdersUpdateStatus,
    dialog: 'inspection',
    visible: ({ order }) => order.status === 'RETURNED' && order.returnStatus === 'RETURNED',
  },
  {
    id: 'settle',
    section: 'settlement',
    label: 'Đóng đơn',
    icon: IconReceipt,
    permission: PermissionCode.OrdersUpdateStatus,
    dialog: 'settle',
    visible: ({ order }) =>
      order.status === 'RETURNED' && order.returnStatus === 'INSPECTED' && order.settlementStatus === 'SETTLED',
  },
  {
    id: 'refund',
    section: 'refund',
    label: 'Hoàn tiền',
    icon: IconRotateClockwise,
    permission: PermissionCode.OrdersRefund,
    dialog: 'refund',
    visible: ({ order }) => getRentalOrderFinancialSummary(order).kind === 'REFUND_DUE',
  },
  {
    id: 'close-cancellation',
    section: 'refund',
    label: 'Chốt phần còn lại',
    icon: IconLock,
    permission: PermissionCode.OrdersRefund,
    dialog: 'close-cancellation',
    visible: ({ order }) => order.status === 'CANCELLED' && getRentalOrderFinancialSummary(order).kind === 'REFUND_DUE',
  },
  {
    id: 'cancel',
    section: 'refund',
    label: 'Hủy đơn',
    icon: IconX,
    permission: PermissionCode.OrdersCancel,
    dialog: 'cancel',
    variant: 'destructive',
    visible: ({ order }) => order.status === 'CREATED' || order.status === 'CONFIRMED',
  },
];

function useRentalOrderActions(row: Row<RentalOrderListItem>): RentalOrderAction[] {
  const { setCurrentRow, setOpen } = useRentalOrders();
  const { can } = usePermission();
  const context = { order: row.original } satisfies RentalOrderActionContext;

  return RENTAL_ORDER_ACTIONS.flatMap((definition) => {
    if (definition.visible && !definition.visible(context)) return [];

    const permissionAllowed = can(definition.permission);
    if (!permissionAllowed && definition.actionType !== 'disable') return [];

    return [
      {
        ...definition,
        onSelect: () => {
          setCurrentRow(context.order);
          setOpen(definition.dialog);
        },
        disabled: definition.disabled?.(context) || (definition.actionType === 'disable' && !permissionAllowed),
        title: definition.title?.(context),
      },
    ];
  });
}

function RentalOrderActionItems({ row, menu }: { row: Row<RentalOrderListItem>; menu: RentalOrderActionMenu }) {
  const actions = useRentalOrderActions(row);
  let previousSection: string | undefined;

  return (
    <>
      {actions.map((action) => {
        const showSeparator = previousSection != null && previousSection !== action.section;
        previousSection = action.section;
        const Icon = action.icon;

        return (
          <React.Fragment key={action.id}>
            {showSeparator && (menu === 'dropdown' ? <DropdownMenuSeparator /> : <ContextMenuSeparator />)}
            {menu === 'dropdown' ? (
              <DropdownMenuItem
                disabled={action.disabled}
                variant={action.variant}
                title={action.title}
                onClick={action.onSelect}
              >
                <Icon aria-hidden="true" data-icon="inline-start" />
                {action.label}
              </DropdownMenuItem>
            ) : (
              <ContextMenuItem
                disabled={action.disabled}
                variant={action.variant}
                title={action.title}
                onSelect={action.onSelect}
              >
                <Icon aria-hidden="true" data-icon="inline-start" />
                {action.label}
              </ContextMenuItem>
            )}
          </React.Fragment>
        );
      })}
    </>
  );
}

export function RentalOrderActionsCell({ row }: { row: Row<RentalOrderListItem> }) {
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={`Thao tác đơn ${row.original.code}`}
          className="data-[state=open]:bg-muted"
        >
          <IconDots aria-hidden="true" data-icon="inline-start" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <RentalOrderActionItems row={row} menu="dropdown" />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function RentalOrderContextMenuItems({ row }: { row: Row<RentalOrderListItem> }) {
  return <RentalOrderActionItems row={row} menu="context" />;
}

export type { RentalOrderAction, RentalOrderActionDefinition, RentalOrderActionMenu };
