'use client';

import { DateTimeRange, DateTimeRangePicker } from '@/components/shared/date-time-range-picker';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { CurrencyInput } from '@/components/ui/currency-input';
import { DataTable, type DataTableInstance } from '@/components/ui/data-table';
import { Field, FieldContent, FieldDescription, FieldError, FieldLabel, FieldTitle } from '@/components/ui/field';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { cn, formatCurrency, formatDate } from '@/lib/utils';
import type { IAvailabilityAsset } from '@/modules/availability/type';
import { AlertCircleIcon, Calendar, Package, User } from 'lucide-react';
import type { Dispatch, SetStateAction } from 'react';
import { Controller, type Control } from 'react-hook-form';
import { pickupMethodConfig } from '../display-config';
import type { ICreateRentalOrderInput } from '../schema';
import type { ICustomerOut, PickupMethod } from '../type';
import type { EstimatedPricingLine } from '../utils';
import { Separator } from '@/components/ui/separator';
import { RentalOrderAssetSelectionTable } from './rental-order-asset-selection-table';

const SECTION_CARD = 'bg-card shadow-xs p-2 md:p-5 border border-accent rounded-md';

const pickupMethodChoices = Object.entries(pickupMethodConfig).map(([value, config]) => ({
  ...config,
  value: value as PickupMethod,
}));

export const getPickupMethodLabel = (method: PickupMethod) => pickupMethodConfig[method].label;

export function RentalOrderScheduleStep({
  control,
  pickupMethod,
  rangeOpen,
  setRangeOpen,
  calendarPortalContainer,
  onRangeChanged,
}: {
  control: Control<ICreateRentalOrderInput>;
  pickupMethod: PickupMethod;
  rangeOpen: boolean;
  setRangeOpen: Dispatch<SetStateAction<boolean>>;
  calendarPortalContainer: HTMLDivElement | null;
  onRangeChanged: () => void;
}) {
  return (
    <section className={cn(SECTION_CARD, 'space-y-6')}>
      <Controller
        control={control}
        name="range"
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={field.name} className="grid grid-cols-2">
              <span>Giờ nhận</span>
              <span>Giờ trả</span>
            </FieldLabel>

            <DateTimeRangePicker
              id={field.name}
              value={field.value}
              onUpdate={({ range: nextRange }) => {
                field.onChange(nextRange);
                onRangeChanged();
              }}
              open={rangeOpen}
              setOpen={setRangeOpen}
              enableTime
              updateMode="debounced"
              updateDebounceMs={1000}
              portalContainer={calendarPortalContainer}
            />

            {fieldState.invalid && (
              <Alert variant="destructive">
                <AlertCircleIcon />
                <AlertTitle>
                  <FieldError errors={[fieldState.error]} />
                </AlertTitle>
                <AlertDescription>
                  Giờ trả máy phải sau giờ nhận máy. Chỉnh lại hai mốc thời gian — hệ thống sẽ không gọi kiểm tra lịch
                  khi khung giờ chưa hợp lệ.
                </AlertDescription>
              </Alert>
            )}
          </Field>
        )}
      />

      <Controller
        control={control}
        name="pickupMethod"
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={field.name}>Phương thức vận chuyển</FieldLabel>

            <RadioGroup
              id={field.name}
              name={field.name}
              defaultValue="PICKUP_AT_STORE"
              value={field.value}
              onValueChange={field.onChange}
              orientation="vertical"
              className="grid grid-cols-1 gap-4 sm:grid-cols-2"
            >
              {pickupMethodChoices.map((method) => {
                const isActive = field.value === method.value;
                const Icon = method.icon;
                const itemId = `rental-order-create-pickup-method-${method.value}`;

                return (
                  <FieldLabel htmlFor={itemId} key={method.value}>
                    <Field orientation="horizontal">
                      <FieldContent className="relative flex w-full flex-row items-center gap-4">
                        <div
                          className={cn('flex shrink-0 items-center', isActive ? 'text-primary' : 'text-foreground')}
                        >
                          {Icon ? <Icon /> : null}
                        </div>

                        <div className="flex flex-1 flex-col gap-2">
                          <FieldTitle className="text-sm font-bold">{method.label}</FieldTitle>

                          <FieldDescription className="pt-1 text-xs text-text-sub">{method.address}</FieldDescription>

                          <Badge className={cn('mt-2 w-fit', method.badgeColor)}>{method.badge}</Badge>
                        </div>

                        <div className="shrink-0">
                          <RadioGroupItem
                            value={method.value}
                            id={itemId}
                            aria-invalid={fieldState.invalid}
                            className="absolute top-1/2 right-0 size-6 -translate-y-1/2"
                          />
                        </div>
                      </FieldContent>
                    </Field>
                  </FieldLabel>
                );
              })}
            </RadioGroup>

            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      <Controller
        control={control}
        name="deliveryFeeTotal"
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={field.name}>Phí giao</FieldLabel>

            <CurrencyInput
              {...field}
              id={field.name}
              aria-invalid={fieldState.invalid}
              disabled={pickupMethod !== 'DELIVERY'}
            />

            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      <Controller
        control={control}
        name="deliveryAddress"
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={field.name}>Địa chỉ giao</FieldLabel>

            <Textarea
              {...field}
              id={field.name}
              aria-invalid={fieldState.invalid}
              disabled={pickupMethod !== 'DELIVERY'}
              placeholder="Bắt buộc nếu chọn phương thức giao tận nơi"
            />

            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />
    </section>
  );
}

export function RentalOrderProductsStep({ assetTable }: { assetTable: DataTableInstance<IAvailabilityAsset> }) {
  return (
    <section className="p-0.5">
      <RentalOrderAssetSelectionTable assetTable={assetTable} />
    </section>
  );
}

export function RentalOrderCustomerStep({ customerTable }: { customerTable: DataTableInstance<ICustomerOut> }) {
  return (
    <div className="grid gap-4 p-0.5">
      <DataTable table={customerTable} surfaceClassName="h-[320px]" />
    </div>
  );
}

export function RentalOrderPaymentStep({
  control,
  selectedCustomer,
  range,
  pickupMethod,
  deliveryFeeTotal,
  pricingLines,
  rentalSubtotal,
  originalDepositTotal,
  depositTotal,
  bookingHoldTotal,
  netRental,
  estimatedRefund,
}: {
  control: Control<ICreateRentalOrderInput>;
  selectedCustomer: ICustomerOut | null;
  range: DateTimeRange;
  pickupMethod: PickupMethod;
  deliveryFeeTotal: number;
  pricingLines: EstimatedPricingLine[];
  rentalSubtotal: number;
  originalDepositTotal: number;
  depositTotal: number;
  bookingHoldTotal: number;
  netRental: number;
  estimatedRefund: number;
}) {
  return (
    <>
      <section className={cn(SECTION_CARD, 'space-y-6')}>
        {TitleSection('Giảm giá & Ghi chú')}

        <Controller
          control={control}
          name="discountTotal"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Giảm giá</FieldLabel>
              <CurrencyInput
                {...field}
                id={field.name}
                aria-invalid={fieldState.invalid}
                min={0}
                placeholder="Nhập số tiền giảm"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="note"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Ghi chú khách hàng</FieldLabel>
              <Textarea {...field} id={field.name} aria-invalid={fieldState.invalid} />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="internalNote"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Ghi chú nội bộ</FieldLabel>
              <Textarea {...field} id={field.name} aria-invalid={fieldState.invalid} />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Separator />
        <div className="space-y-4">
          {TitleSection('Tóm tắt đơn hàng')}

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
              <div className="flex items-center gap-2 font-semibold text-sm text-foreground">
                <User className="size-4 text-muted-foreground" />
                <span>Thông tin khách hàng</span>
              </div>
              <div className="space-y-2 text-sm">
                <Row label="Tên" value={selectedCustomer?.name ?? '-'} />
                <Row label="Số điện thoại" value={selectedCustomer?.phone ?? '-'} />
                <Row label="Email" value={selectedCustomer?.email ?? '-'} />
                <Row label="Địa chỉ" value={selectedCustomer?.address ?? '-'} />
              </div>
            </div>

            <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <Calendar className="size-4 text-muted-foreground" />
                <span>Lịch thuê & giao nhận</span>
              </div>

              <div className="space-y-2 text-sm">
                <Row label="Giờ nhận" value={range.from ? formatDate(range.from) : '-'} />

                <Row label="Giờ trả" value={range.to ? formatDate(range.to) : '-'} />

                <Row label="Hình thức" value={getPickupMethodLabel(pickupMethod)} />

                {pickupMethod === 'DELIVERY' && (
                  <Row
                    label="Phí giao"
                    value={<span className="font-medium text-foreground">{formatCurrency(deliveryFeeTotal)}</span>}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={cn(SECTION_CARD, 'p-0! md:p-0! my-6')}>
        {/* Header thiết bị */}
        <div className="flex items-center justify-between border-b bg-muted/20 px-4 py-3">
          <div className="flex items-center gap-2 font-semibold text-sm">
            <Package className="size-4 text-muted-foreground" />
            <span>Danh sách thiết bị</span>
          </div>
          <Badge variant="secondary" className="font-normal">
            {pricingLines.length} thiết bị
          </Badge>
        </div>

        {/* List thiết bị */}
        <div className="divide-y">
          {pricingLines.map((item) => (
            <div
              key={item.id}
              className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between hover:bg-muted/10 transition-colors"
            >
              <div className="min-w-0 space-y-1">
                <div className="font-medium text-sm leading-none">{item.productName}</div>
                <div className="flex items-center gap-2">
                  <span className="inline-block rounded bg-muted px-1.5 py-0.5 text-[11px] font-mono text-muted-foreground">
                    Serial: {item.serialNumber || 'N/A'}
                  </span>
                </div>
              </div>

              {/* Chi phí từng máy */}
              <div className="flex items-center justify-between sm:flex-col sm:items-end text-sm">
                <div className="font-semibold text-foreground">{formatCurrency(item.rentalSubtotal)}</div>
                <div className="text-xs text-amber-600 dark:text-amber-500 font-medium">
                  Cọc: {formatCurrency(item.depositAmount)}
                </div>
              </div>
            </div>
          ))}
        </div>
        {/* Footer: Tổng kết tài chính (Chi phí / Tiền cọc) */}
        <div className="space-y-2 border-t bg-muted/30 p-4">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Tổng tiền thuê thiết bị</span>
            <span>{formatCurrency(rentalSubtotal)}</span>
          </div>

          {pickupMethod === 'DELIVERY' && (
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Phí vận chuyển</span>
              <span>{formatCurrency(deliveryFeeTotal)}</span>
            </div>
          )}

          {originalDepositTotal !== depositTotal ? (
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Cọc gốc theo thiết bị</span>
              <span>{formatCurrency(originalDepositTotal)}</span>
            </div>
          ) : null}

          <div className="flex items-center justify-between pt-1 text-sm font-medium text-amber-600 dark:text-amber-500">
            <span>Tổng tiền cọc áp dụng</span>
            <span>{formatCurrency(depositTotal)}</span>
          </div>

          {bookingHoldTotal > 0 && (
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Tiền giữ lịch</span>
              <span>{formatCurrency(bookingHoldTotal)}</span>
            </div>
          )}

          <Separator className="my-2" />

          <div className="flex items-center justify-between text-sm font-semibold text-primary">
            <span>Tiền thuê & phí sau giảm giá</span>
            <span>{formatCurrency(netRental)}</span>
          </div>

          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Hoàn cọc dự tính</span>
            <span>{formatCurrency(estimatedRefund)}</span>
          </div>
        </div>
      </section>
    </>
  );
}
function TitleSection(title: string, index?: number) {
  return (
    <h2 className="md:text-lg text-base font-bold text-primary uppercase flex items-center gap-3 mb-4">
      {index && (
        <span className="flex items-center justify-center size-8 rounded-full bg-primary/20 text-primary text-sm">
          {index}
        </span>
      )}
      {title}
    </h2>
  );
}
function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-6">
      <span className="text-muted-foreground">{label}</span>

      <span className="text-right font-medium">{value}</span>
    </div>
  );
}
