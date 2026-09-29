'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Field, FieldDescription, FieldGroup, FieldLabel, FieldLegend, FieldSet } from '@/components/ui/field';
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { assetActiveConfig, assetConditionConfig, assetStatusConfig } from '@/modules/asset-units/display-config';
import { orderStatusConfig, pickupMethodConfig, settlementStatusConfig } from '@/modules/rental-orders/display-config';
import type {
  HandoverStatus,
  RentalOrderStatus,
  RentalPickupMethod,
  RentalSettlementStatus,
  ReturnStatus,
} from '@/modules/rental-orders/model';
import { IconAdjustmentsHorizontal, IconFilterOff } from '@tabler/icons-react';
import type { ReactNode } from 'react';
import type { AvailabilityGanttAllocationStatus, AvailabilityGanttFilters } from '../gantt-type';

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

const orderStatusOptions = (
  Object.entries(orderStatusConfig) as Array<[RentalOrderStatus, (typeof orderStatusConfig)[RentalOrderStatus]]>
).map(([value, config]) => ({ value, label: config.label, className: config.className }));

const settlementStatusOptions = (
  Object.entries(settlementStatusConfig) as Array<
    [RentalSettlementStatus, (typeof settlementStatusConfig)[RentalSettlementStatus]]
  >
).map(([value, config]) => ({ value, label: config.label, className: config.className }));

const pickupMethodOptions = (
  Object.entries(pickupMethodConfig) as Array<[RentalPickupMethod, (typeof pickupMethodConfig)[RentalPickupMethod]]>
).map(([value, config]) => ({ value, label: config.label, className: config.className }));

const assetStatusOptions = (
  Object.entries(assetStatusConfig) as Array<
    [keyof typeof assetStatusConfig, (typeof assetStatusConfig)[keyof typeof assetStatusConfig]]
  >
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
    <Field
      orientation="horizontal"
      className={cn(
        'items-center gap-2 px-2 py-1.5 transition-colors hover:bg-accent/60 has-data-[state=checked]:bg-accent/50',
        className,
      )}
    >
      <Checkbox id={id} checked={checked} onCheckedChange={(value) => onCheckedChange(value === true)} />
      <FieldLabel htmlFor={id} className="min-w-0 flex-1 cursor-pointer truncate text-current font-normal">
        <span className="truncate">{label}</span>
      </FieldLabel>
    </Field>
  );
}

function FilterSection({
  title,
  description,
  activeCount,
  children,
}: {
  title: string;
  description?: string;
  activeCount: number;
  children: ReactNode;
}) {
  return (
    <FieldSet className="gap-2 border-b border-border/60 pb-4 last:border-b-0 last:pb-0">
      <div className="flex items-center justify-between gap-3">
        <FieldLegend variant="label" className="mb-0 min-w-0 truncate text-sm">
          {title}
        </FieldLegend>
        {activeCount > 0 ? (
          <Badge variant="secondary" className="h-5 shrink-0 px-1.5 text-[10px]">
            {activeCount} chọn
          </Badge>
        ) : null}
      </div>
      {description ? <FieldDescription className="text-xs">{description}</FieldDescription> : null}
      {children}
    </FieldSet>
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

  const sectionCounts = {
    order: filters.orderStatuses.length,
    allocation: filters.allocationStatuses.length,
    operation: filters.handoverStatuses.length + filters.returnStatuses.length,
    finance: filters.settlementStatuses.length + filters.pickupMethods.length,
    asset: filters.assetStatuses.length + filters.assetConditions.length + (filters.assetActive !== undefined ? 1 : 0),
    display: filters.includeCancelled ? 1 : 0,
  };

  return (
    <div className="flex items-center gap-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant='secondary'
            size="sm"
            aria-label="Mở bộ lọc nâng cao"
            className={cn(
              'h-8 gap-2 rounded-lg border-dashed px-3',
              activeFilterCount && 'border-primary/40 bg-primary/20 text-primary hover:bg-primary/10',
            )}
          >
            <IconAdjustmentsHorizontal aria-hidden="true" data-icon="inline-start" />
            <span>Bộ lọc nâng cao</span>
            {activeFilterCount ? (
              <Badge
                variant="outline"
                className="h-5 min-w-5 justify-center border-primary/30 px-1 text-[11px] text-primary"
              >
                {activeFilterCount}
              </Badge>
            ) : (
              <span className="text-xs font-normal">Chưa chọn</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-[min(30rem,calc(100vw-1rem))] p-0">
          <PopoverHeader className="gap-3 border-b px-4 py-2">
            <PopoverTitle className="text-sm">Lọc lịch thiết bị</PopoverTitle>
            <PopoverDescription className="text-xs leading-relaxed">
              Lọc theo trạng thái đơn, vận hành, tài chính và tình trạng máy. Bộ lọc sản phẩm và từ khóa cũng được tính
              trong nút xóa tất cả.
            </PopoverDescription>
          </PopoverHeader>

          <ScrollArea className="h-[30dvh]">
            <FieldGroup className="gap-3 px-4 pb-2">
              <FilterSection
                title="Trạng thái đơn"
                description="Xác định các đơn xuất hiện trên lịch."
                activeCount={sectionCounts.order}
              >
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
              </FilterSection>

              <FilterSection
                title="Trạng thái giữ máy"
                description="Theo dõi vòng đời phân bổ thiết bị."
                activeCount={sectionCounts.allocation}
              >
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
              </FilterSection>

              <FilterSection
                title="Trạng thái vận hành"
                description="Lọc theo bàn giao và trả máy."
                activeCount={sectionCounts.operation}
              >
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
              </FilterSection>

              <FilterSection
                title="Tài chính và nhận máy"
                description="Kết hợp quyết toán với hình thức nhận."
                activeCount={sectionCounts.finance}
              >
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
              </FilterSection>

              <FilterSection
                title="Tình trạng máy"
                description="Lọc máy theo trạng thái kho và tình trạng thực tế."
                activeCount={sectionCounts.asset}
              >
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
              </FilterSection>

              <FilterSection
                title="Hiển thị bổ sung"
                description="Đơn đã hủy mặc định không giữ máy nên không hiện trong lịch."
                activeCount={sectionCounts.display}
              >
                <FilterCheckbox
                  id="gantt-include-cancelled"
                  label="Hiện cả đơn đã hủy"
                  checked={filters.includeCancelled}
                  onCheckedChange={(checked) => onChange({ includeCancelled: checked })}
                />
              </FilterSection>
            </FieldGroup>
          </ScrollArea>
        </PopoverContent>
      </Popover>
      {activeFilterCount ? (
        <Button type="button" variant="destructive" size="sm" className="h-8 px-2" onClick={onClear}>
          <IconFilterOff aria-hidden="true" data-icon="inline-start" />
          Xóa bộ lọc
        </Button>
      ) : null}
    </div>
  );
}
