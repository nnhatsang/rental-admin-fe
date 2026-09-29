'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Field, FieldDescription, FieldGroup, FieldLabel, FieldLegend, FieldSet } from '@/components/ui/field';
import { Popover, PopoverContent, PopoverDescription, PopoverHeader, PopoverTitle, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { assetActiveConfig, assetConditionConfig, assetStatusConfig } from '@/modules/asset-units/display-config';
import {
  orderStatusConfig,
  pickupMethodConfig,
  settlementStatusConfig,
} from '@/modules/rental-orders/display-config';
import type {
  HandoverStatus,
  RentalOrderStatus,
  RentalPickupMethod,
  RentalSettlementStatus,
  ReturnStatus,
} from '@/modules/rental-orders/model';
import {
  IconAdjustmentsHorizontal,
  IconRefresh,
} from '@tabler/icons-react';
import type {
  AvailabilityGanttAllocationStatus,
  AvailabilityGanttFilters,
} from '../gantt-type';

const allocationStatusOptions: Array<{ value: AvailabilityGanttAllocationStatus; label: string }> = [
  { value: 'REQUESTED', label: 'Đang yêu cầu' },
  { value: 'RESERVED', label: 'Đã giữ máy' },
  { value: 'HANDED_OVER', label: 'Đã bàn giao' },
  { value: 'RETURNED', label: 'Đã nhận lại' },
  { value: 'RELEASED', label: 'Đã giải phóng' },
];

const handoverStatusOptions: Array<{ value: HandoverStatus; label: string }> = [
  { value: 'PENDING_PAYMENT', label: 'Chờ thanh toán' },
  { value: 'READY', label: 'Sẵn sàng bàn giao' },
  { value: 'HANDED_OVER', label: 'Đã bàn giao' },
];

const returnStatusOptions: Array<{ value: ReturnStatus; label: string }> = [
  { value: 'NOT_RETURNED', label: 'Chưa trả máy' },
  { value: 'RETURNED', label: 'Đã trả, chờ kiểm tra' },
  { value: 'INSPECTED', label: 'Đã kiểm tra' },
];

const orderStatusOptions = (Object.entries(orderStatusConfig) as Array<[RentalOrderStatus, (typeof orderStatusConfig)[RentalOrderStatus]]>).map(
  ([value, config]) => ({ value, label: config.label, className: config.className }),
);

const settlementStatusOptions = (
  Object.entries(settlementStatusConfig) as Array<
    [RentalSettlementStatus, (typeof settlementStatusConfig)[RentalSettlementStatus]]
  >
).map(([value, config]) => ({ value, label: config.label, className: config.className }));

const pickupMethodOptions = (
  Object.entries(pickupMethodConfig) as Array<[RentalPickupMethod, (typeof pickupMethodConfig)[RentalPickupMethod]]>
).map(([value, config]) => ({ value, label: config.label, className: config.className }));

const assetStatusOptions = (
  Object.entries(assetStatusConfig) as Array<[keyof typeof assetStatusConfig, (typeof assetStatusConfig)[keyof typeof assetStatusConfig]]>
).map(([value, config]) => ({ value, label: config.label, className: config.className }));

const assetConditionOptions = (
  Object.entries(assetConditionConfig) as Array<
    [keyof typeof assetConditionConfig, (typeof assetConditionConfig)[keyof typeof assetConditionConfig]]
  >
).map(([value, config]) => ({ value, label: config.label, className: config.className }));

function toggleValue<T extends string>(values: T[], value: T, checked: boolean) {
  if (checked) return values.includes(value) ? values : [...values, value];
  return values.filter((item) => item !== value);
}

function FilterCheckbox({
  id,
  label,
  checked,
  onCheckedChange,
  className,
}: {
  id: string;
  label: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  className?: string;
}) {
  return (
    <Field orientation="horizontal" className="items-center gap-2">
      <Checkbox
        id={id}
        checked={checked}
        onCheckedChange={(value) => onCheckedChange(value === true)}
      />
      <FieldLabel htmlFor={id} className={cn('cursor-pointer text-sm font-normal', className)}>
        {label}
      </FieldLabel>
    </Field>
  );
}

export function AvailabilityGanttFilterBar({
  filters,
  onChange,
  onClear,
  externalFilterCount = 0,
}: {
  filters: AvailabilityGanttFilters;
  onChange: (updates: Partial<AvailabilityGanttFilters>) => void;
  onClear: () => void;
  externalFilterCount?: number;
}) {
  const activeFilterCount =
    filters.orderStatuses.length +
    filters.allocationStatuses.length +
    filters.handoverStatuses.length +
    filters.returnStatuses.length +
    filters.settlementStatuses.length +
    filters.pickupMethods.length +
    filters.assetStatuses.length +
    filters.assetConditions.length +
    (filters.assetActive !== undefined ? 1 : 0) +
    (filters.includeCancelled ? 1 : 0) +
    externalFilterCount;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button type="button" variant={activeFilterCount ? 'secondary' : 'outline'} size="sm" className="gap-2">
          <IconAdjustmentsHorizontal aria-hidden="true" data-icon="inline-start" />
          Bộ lọc nâng cao
          {activeFilterCount ? (
            <Badge variant="outline" className="h-5 min-w-5 justify-center px-1 text-[11px]">
              {activeFilterCount}
            </Badge>
          ) : null}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[min(24rem,calc(100vw-1.5rem))] p-0">
        <PopoverHeader className="px-4 pt-4">
          <div className="flex items-start justify-between gap-3">
            <div className="grid gap-1">
              <PopoverTitle>Lọc lịch thiết bị</PopoverTitle>
              <PopoverDescription>
                Chọn trạng thái để thu hẹp đơn và máy cần theo dõi. Có thể xóa cả bộ lọc sản phẩm và từ khóa tại đây.
              </PopoverDescription>
            </div>
            {activeFilterCount ? (
              <Button type="button" variant="ghost" size="sm" className="h-8 shrink-0" onClick={onClear}>
                <IconRefresh aria-hidden="true" data-icon="inline-start" />
                Xóa lọc
              </Button>
            ) : null}
          </div>
        </PopoverHeader>

        <ScrollArea className="h-[calc(32rem)]">
          <FieldGroup className="gap-4 px-4 py-4">
            <FieldSet className="gap-2">
              <FieldLegend variant="label">Trạng thái đơn</FieldLegend>
              <div className="grid gap-2 sm:grid-cols-2">
                {orderStatusOptions.map((option) => (
                  <FilterCheckbox
                    key={option.value}
                    id={'gantt-order-status-' + option.value}
                    label={option.label}
                    className={option.className}
                    checked={filters.orderStatuses.includes(option.value)}
                    onCheckedChange={(checked) =>
                      onChange({ orderStatuses: toggleValue(filters.orderStatuses, option.value, checked) })
                    }
                  />
                ))}
              </div>
            </FieldSet>

            <FieldSet className="gap-2">
              <FieldLegend variant="label">Trạng thái giữ máy</FieldLegend>
              <div className="grid gap-2 sm:grid-cols-2">
                {allocationStatusOptions.map((option) => (
                  <FilterCheckbox
                    key={option.value}
                    id={'gantt-allocation-status-' + option.value}
                    label={option.label}
                    checked={filters.allocationStatuses.includes(option.value)}
                    onCheckedChange={(checked) =>
                      onChange({
                        allocationStatuses: toggleValue(filters.allocationStatuses, option.value, checked),
                      })
                    }
                  />
                ))}
              </div>
            </FieldSet>

            <FieldSet className="gap-2">
              <FieldLegend variant="label">Trạng thái vận hành</FieldLegend>
              <div className="grid gap-2 sm:grid-cols-2">
                {handoverStatusOptions.map((option) => (
                  <FilterCheckbox
                    key={option.value}
                    id={'gantt-handover-status-' + option.value}
                    label={option.label}
                    checked={filters.handoverStatuses.includes(option.value)}
                    onCheckedChange={(checked) =>
                      onChange({ handoverStatuses: toggleValue(filters.handoverStatuses, option.value, checked) })
                    }
                  />
                ))}
                {returnStatusOptions.map((option) => (
                  <FilterCheckbox
                    key={option.value}
                    id={'gantt-return-status-' + option.value}
                    label={option.label}
                    checked={filters.returnStatuses.includes(option.value)}
                    onCheckedChange={(checked) =>
                      onChange({ returnStatuses: toggleValue(filters.returnStatuses, option.value, checked) })
                    }
                  />
                ))}
              </div>
            </FieldSet>

            <FieldSet className="gap-2">
              <FieldLegend variant="label">Tài chính và nhận máy</FieldLegend>
              <div className="grid gap-2 sm:grid-cols-2">
                {settlementStatusOptions.map((option) => (
                  <FilterCheckbox
                    key={option.value}
                    id={'gantt-settlement-status-' + option.value}
                    label={option.label}
                    className={option.className}
                    checked={filters.settlementStatuses.includes(option.value)}
                    onCheckedChange={(checked) =>
                      onChange({ settlementStatuses: toggleValue(filters.settlementStatuses, option.value, checked) })
                    }
                  />
                ))}
                {pickupMethodOptions.map((option) => (
                  <FilterCheckbox
                    key={option.value}
                    id={'gantt-pickup-method-' + option.value}
                    label={option.label}
                    className={option.className}
                    checked={filters.pickupMethods.includes(option.value)}
                    onCheckedChange={(checked) =>
                      onChange({ pickupMethods: toggleValue(filters.pickupMethods, option.value, checked) })
                    }
                  />
                ))}
              </div>
            </FieldSet>

            <FieldSet className="gap-2">
              <FieldLegend variant="label">Tình trạng máy</FieldLegend>
              <div className="grid gap-2 sm:grid-cols-2">
                {assetStatusOptions.map((option) => (
                  <FilterCheckbox
                    key={option.value}
                    id={'gantt-asset-status-' + option.value}
                    label={option.label}
                    className={option.className}
                    checked={filters.assetStatuses.includes(option.value)}
                    onCheckedChange={(checked) =>
                      onChange({
                        assetStatuses: toggleValue(filters.assetStatuses, option.value, checked),
                      })
                    }
                  />
                ))}
                {assetConditionOptions.map((option) => (
                  <FilterCheckbox
                    key={option.value}
                    id={'gantt-asset-condition-' + option.value}
                    label={option.label}
                    className={option.className}
                    checked={filters.assetConditions.includes(option.value)}
                    onCheckedChange={(checked) =>
                      onChange({
                        assetConditions: toggleValue(filters.assetConditions, option.value, checked),
                      })
                    }
                  />
                ))}
                <FilterCheckbox
                  id="gantt-asset-active"
                  label={assetActiveConfig.true.label}
                  className={assetActiveConfig.true.className}
                  checked={filters.assetActive === true}
                  onCheckedChange={(checked) =>
                    onChange({
                      assetActive: checked ? true : filters.assetActive === true ? undefined : filters.assetActive,
                    })
                  }
                />
                <FilterCheckbox
                  id="gantt-asset-inactive"
                  label={assetActiveConfig.false.label}
                  className={assetActiveConfig.false.className}
                  checked={filters.assetActive === false}
                  onCheckedChange={(checked) =>
                    onChange({
                      assetActive: checked ? false : filters.assetActive === false ? undefined : filters.assetActive,
                    })
                  }
                />
              </div>
            </FieldSet>

            <FieldSet className="gap-2">
              <FieldLegend variant="label">Hiển thị bổ sung</FieldLegend>
              <FieldDescription>Đơn đã hủy mặc định không giữ máy nên không hiện trong lịch.</FieldDescription>
              <FilterCheckbox
                id="gantt-include-cancelled"
                label="Hiện cả đơn đã hủy"
                checked={filters.includeCancelled}
                onCheckedChange={(checked) => onChange({ includeCancelled: checked })}
              />
            </FieldSet>
          </FieldGroup>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
