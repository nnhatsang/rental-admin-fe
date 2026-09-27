'use client';

import { ProtectedAction } from '@/components/shared/protected-action';
import { Button } from '@/components/ui/button';
import { DataTableBulkActions } from '@/components/ui/data-table/components/menus/bulk-actions';
import type { DataTableInstance } from '@/components/ui/data-table';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { PermissionCode } from '@/utils/consts/rbac.const';
import { IconTrash } from '@tabler/icons-react';
import type { RentalOrderListItem } from './model';
import { useRentalOrders } from './rental-orders-provider';

type RentalOrderBulkActionsProps = {
  table: DataTableInstance<RentalOrderListItem>;
};

const deletableStatuses = new Set<RentalOrderListItem['status']>(['CREATED', 'CANCELLED']);

export function RentalOrderBulkActions({ table }: RentalOrderBulkActionsProps) {
  const { setOpen } = useRentalOrders();
  const selectedOrders = table.getFilteredSelectedRowModel().rows.map((row) => row.original);
  const hasBlockedSelection = selectedOrders.some((order) => !deletableStatuses.has(order.status));
  const actionText = 'Xóa các đơn thuê đã chọn';
  const blockedText = 'Chỉ có thể xóa đơn mới tạo hoặc đơn đã hủy';

  return (
    <DataTableBulkActions table={table} entityName="rental order">
      <ProtectedAction permission={PermissionCode.OrdersCancel}>
        <Tooltip>
          <TooltipTrigger asChild>
            <span>
              <Button
                variant="destructive"
                size="icon"
                disabled={hasBlockedSelection}
                onClick={() => setOpen('delete-multi')}
                className="size-8"
                aria-label={hasBlockedSelection ? blockedText : actionText}
                title={hasBlockedSelection ? blockedText : actionText}
              >
                <IconTrash aria-hidden="true" />
                <span className="sr-only">{actionText}</span>
              </Button>
            </span>
          </TooltipTrigger>
          <TooltipContent>
            <p>{hasBlockedSelection ? blockedText : actionText}</p>
          </TooltipContent>
        </Tooltip>
      </ProtectedAction>
    </DataTableBulkActions>
  );
}
