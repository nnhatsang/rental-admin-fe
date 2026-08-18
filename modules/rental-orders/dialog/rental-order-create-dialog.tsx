'use client';

import {
  Stepper,
  StepperIndicator,
  StepperItem,
  StepperNav,
  StepperPanel,
  StepperSeparator,
  StepperTitle,
  StepperTrigger,
} from '@/components/reui/stepper';
import { type DateTimeRange, DateTimeRangePicker } from '@/components/shared/date-time-range-picker';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CurrencyInput } from '@/components/ui/currency-input';
import { DataTable, type DataTableInstance } from '@/components/ui/data-table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Field, FieldContent, FieldDescription, FieldError, FieldLabel, FieldTitle } from '@/components/ui/field';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { CustomerFormDialog } from '@/modules/customers/dialog';
import type { ICustomerOut } from '@/modules/customers/type';
import type { IAvailabilityAsset } from '@/modules/availability/type';
import { cn, formatCurrency, formatDate } from '@/lib/utils';
import {
  IconCalendarEvent,
  IconCamera,
  IconCheck,
  IconChevronLeft,
  IconChevronRight,
  IconListCheck,
  IconPackage,
  IconWallet,
  IconX,
} from '@tabler/icons-react';
import { Calendar, Package, User } from 'lucide-react';
import { useState, type Dispatch, type ReactNode, type SetStateAction } from 'react';
import { Controller, FormProvider, useFormContext, useWatch } from 'react-hook-form';
import { pickupMethodConfig } from '../display-config';
import {
  rentalOrderCreateSteps,
  type RentalOrderCreateStepKey,
  useRentalOrderCreateWizard,
} from '../hooks/use-rental-order-create-wizard';
import type { ICreateRentalOrderInput } from '../schema';
import type { OrderLineDraft, PickupMethod } from '../type';
import { formatRentalDuration, type EstimatedPricingLine } from '../utils';
import { RentalOrderAssetSelectionTable } from './rental-order-asset-selection-table';

const stepIcons: Record<RentalOrderCreateStepKey, ReactNode> = {
  schedule: <IconCalendarEvent />,
  products: <IconCamera />,
  customer: <IconListCheck />,
  payment: <IconWallet />,
};

const SECTION_CARD = 'bg-card shadow-xs p-2 md:p-5 border border-accent rounded-md';

const pickupMethodChoices = Object.entries(pickupMethodConfig).map(([value, config]) => ({
  ...config,
  value: value as PickupMethod,
}));

const getPickupMethodLabel = (method: PickupMethod) => pickupMethodConfig[method].label;

type RentalOrderCreateDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: () => void;
};

export function RentalOrderCreateDialog({ open, onOpenChange, onCreated }: RentalOrderCreateDialogProps) {
  const [calendarPortalContainer, setCalendarPortalContainer] = useState<HTMLDivElement | null>(null);
  const wizard = useRentalOrderCreateWizard({ open, onOpenChange, onCreated });

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => (nextOpen ? onOpenChange(true) : wizard.handleClose())}>
      <DialogContent className="sm:max-w-7xl" onPointerDownOutside={(event) => event.preventDefault()}>
        <div ref={setCalendarPortalContainer} className="contents">
          <DialogHeader>
            <DialogTitle>Tạo đơn thuê</DialogTitle>
            <DialogDescription>
              Quản trị cần kiểm tra các thông tin trước khi tạo đơn thuê cho khách hàng.
            </DialogDescription>
          </DialogHeader>

          <FormProvider {...wizard.form}>
            <Stepper
              className="w-full space-y-4"
              value={wizard.stepIndex + 1}
              onValueChange={(value) => wizard.setStep(rentalOrderCreateSteps[value - 1].key)}
              indicators={{ completed: <IconCheck className="size-3.5" /> }}
            >
            <StepperNav className="max-lg:hidden">
              {rentalOrderCreateSteps.map((item, index) => (
                <StepperItem
                  key={item.key}
                  step={index + 1}
                  disabled={index > wizard.stepIndex}
                  className="relative flex-1 items-start"
                >
                  <StepperTrigger className="flex flex-col gap-2.5">
                    <StepperIndicator className="size-10">{stepIcons[item.key]}</StepperIndicator>
                    <StepperTitle className="text-center text-[10px] font-semibold leading-tight text-primary md:text-xs">
                      {item.label}
                    </StepperTitle>
                  </StepperTrigger>
                  {rentalOrderCreateSteps.length > index + 1 ? (
                    <StepperSeparator className="group-data-[state=completed]/step:bg-primary absolute inset-x-0 top-3 left-[calc(50%+1.975rem)] m-0 group-data-[orientation=horizontal]/stepper-nav:w-[calc(100%-4rem+0.225rem)] group-data-[orientation=horizontal]/stepper-nav:flex-none" />
                  ) : null}
                </StepperItem>
              ))}
            </StepperNav>

            <StepperPanel>
              <ScrollArea className="h-[60dvh]">
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                  <div className="space-y-5 lg:col-span-8">
                    <CreateStepContent wizard={wizard} calendarPortalContainer={calendarPortalContainer} />
                  </div>

                  <aside className="lg:col-span-4">
                    <RentalOrderEstimateSidebar
                      range={wizard.range}
                      lines={wizard.pricingLines}
                      rentalSubtotal={wizard.rentalSubtotal}
                      discountTotal={wizard.discountTotal}
                      netRental={wizard.netRental}
                      originalDepositTotal={wizard.originalDepositTotal}
                      depositTotal={wizard.depositTotal}
                      bookingHoldTotal={wizard.bookingHoldTotal}
                      deliveryFeeTotal={wizard.pickupMethod === 'DELIVERY' ? wizard.deliveryFeeTotal : 0}
                      estimatedRefund={wizard.estimatedRefund}
                      onEditSchedule={() => wizard.setStep('schedule')}
                      onRemoveLine={wizard.removeAssetByLineId}
                    />
                  </aside>
                </div>
              </ScrollArea>

              <DialogFooter className="flex-row! justify-between!">
                <div>
                  {wizard.stepIndex !== 0 && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={wizard.handleBack}
                      className="w-auto uppercase tracking-widest sm:min-w-[160px]"
                    >
                      <IconChevronLeft className="mr-1.5 size-4" />
                      Quay lại
                    </Button>
                  )}
                </div>

                {wizard.step !== 'payment' ? (
                  <Button
                    type="button"
                    onClick={wizard.handleNext}
                    disabled={wizard.checkAvailability.isPending || (wizard.step === 'products' && wizard.hasAvailabilityConflict)}
                    className="w-auto uppercase tracking-widest sm:min-w-[160px]"
                  >
                    Tiếp tục
                    <IconChevronRight className="ml-1.5 size-4" />
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={wizard.form.handleSubmit(wizard.handleCreate)}
                    disabled={!wizard.canCreate}
                    className="w-auto uppercase tracking-widest sm:min-w-[160px]"
                  >
                    Tạo đơn
                  </Button>
                )}
              </DialogFooter>
            </StepperPanel>
            </Stepper>
          </FormProvider>

          <CustomerFormDialog
            mode="create"
            open={wizard.customerDialogOpen}
            onOpenChange={wizard.setCustomerDialogOpen}
            onSuccess={wizard.handleCustomerCreated}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}

function CreateStepContent({
  wizard,
  calendarPortalContainer,
}: {
  wizard: ReturnType<typeof useRentalOrderCreateWizard>;
  calendarPortalContainer: HTMLDivElement | null;
}) {
  if (wizard.step === 'schedule') {
    return (
      <ScheduleStep
        rangeOpen={wizard.rangeOpen}
        setRangeOpen={wizard.setRangeOpen}
        calendarPortalContainer={calendarPortalContainer}
        onRangeChanged={wizard.resetAvailability}
      />
    );
  }

  if (wizard.step === 'products') {
    return (
      <ProductsStep
        assetTable={wizard.assetTable}
        isChecking={wizard.checkAvailability.isPending}
        hasAvailabilityConflict={wizard.hasAvailabilityConflict}
      />
    );
  }

  if (wizard.step === 'customer') {
    return <CustomerStep customerTable={wizard.customerTable} />;
  }

  return (
    <PaymentStep
      selectedCustomer={wizard.selectedCustomer}
      range={wizard.range}
      pickupMethod={wizard.pickupMethod}
      deliveryFeeTotal={wizard.deliveryFeeTotal}
      pricingLines={wizard.pricingLines}
      rentalSubtotal={wizard.rentalSubtotal}
      originalDepositTotal={wizard.originalDepositTotal}
      depositTotal={wizard.depositTotal}
      bookingHoldTotal={wizard.bookingHoldTotal}
      netRental={wizard.netRental}
      estimatedRefund={wizard.estimatedRefund}
    />
  );
}

function ScheduleStep({
  rangeOpen,
  setRangeOpen,
  calendarPortalContainer,
  onRangeChanged,
}: {
  rangeOpen: boolean;
  setRangeOpen: Dispatch<SetStateAction<boolean>>;
  calendarPortalContainer: HTMLDivElement | null;
  onRangeChanged: () => void;
}) {
  const { control } = useFormContext<ICreateRentalOrderInput>();
  const pickupMethod = useWatch({ control, name: 'pickupMethod' });

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
              <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                <FieldError errors={[fieldState.error]} />
              </div>
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
                        <div className={cn('flex shrink-0 items-center', isActive ? 'text-primary' : 'text-foreground')}>
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

function ProductsStep({
  assetTable,
  isChecking,
  hasAvailabilityConflict,
}: {
  assetTable: DataTableInstance<IAvailabilityAsset>;
  isChecking: boolean;
  hasAvailabilityConflict: boolean;
}) {
  return (
    <section className="space-y-3 p-0.5">
      {isChecking ? (
        <div className="rounded-md border bg-muted/30 px-3 py-2 text-sm text-muted-foreground">
          Đang kiểm tra lịch của các thiết bị đã chọn...
        </div>
      ) : null}
      {hasAvailabilityConflict ? (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          Một số thiết bị đang chọn không còn khả dụng trong khoảng thời gian này.
        </div>
      ) : null}
      <RentalOrderAssetSelectionTable assetTable={assetTable} />
    </section>
  );
}

function CustomerStep({ customerTable }: { customerTable: DataTableInstance<ICustomerOut> }) {
  return (
    <div className="grid gap-4 p-0.5">
      <DataTable table={customerTable} surfaceClassName="h-[320px]" />
    </div>
  );
}

function PaymentStep({
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
  const { control } = useFormContext<ICreateRentalOrderInput>();

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
            <div className="space-y-3 rounded-lg border bg-muted/30 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
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
            <div className="space-y-3 rounded-lg border bg-muted/30 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <Calendar className="size-4 text-muted-foreground" />
                <span>Lịch thuê & giao nhận</span>
              </div>
              <div className="space-y-2 text-sm">
                <Row label="Giờ nhận" value={range.from ? formatDate(range.from) : '-'} />
                <Row label="Giờ trả" value={range.to ? formatDate(range.to) : '-'} />
                <Row label="Hình thức" value={getPickupMethodLabel(pickupMethod)} />
                {pickupMethod === 'DELIVERY' ? (
                  <Row
                    label="Phí giao"
                    value={<span className="font-medium text-foreground">{formatCurrency(deliveryFeeTotal)}</span>}
                  />
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={cn(SECTION_CARD, 'my-6 p-0! md:p-0!')}>
        <div className="flex items-center justify-between border-b bg-muted/20 px-4 py-3">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Package className="size-4 text-muted-foreground" />
            <span>Danh sách thiết bị</span>
          </div>
          <Badge variant="secondary" className="font-normal">
            {pricingLines.length} thiết bị
          </Badge>
        </div>

        <div className="divide-y">
          {pricingLines.map((item) => (
            <div
              key={item.id}
              className="flex flex-col gap-2 p-4 transition-colors hover:bg-muted/10 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0 space-y-1">
                <div className="text-sm font-medium leading-none">{item.productName}</div>
                <span className="inline-block rounded bg-muted px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground">
                  Serial: {item.serialNumber || 'N/A'}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm sm:flex-col sm:items-end">
                <div className="font-semibold text-foreground">{formatCurrency(item.rentalSubtotal)}</div>
                <div className="text-xs font-medium text-amber-600 dark:text-amber-500">
                  Cọc: {formatCurrency(item.depositAmount)}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-2 border-t bg-muted/30 p-4">
          <SummaryRow label="Tổng tiền thuê thiết bị" value={formatCurrency(rentalSubtotal)} />
          {pickupMethod === 'DELIVERY' ? <SummaryRow label="Phí vận chuyển" value={formatCurrency(deliveryFeeTotal)} /> : null}
          {originalDepositTotal !== depositTotal ? (
            <SummaryRow label="Cọc gốc theo thiết bị" value={formatCurrency(originalDepositTotal)} />
          ) : null}
          <SummaryRow label="Tổng tiền cọc áp dụng" value={formatCurrency(depositTotal)} className="text-amber-600 dark:text-amber-500" />
          {bookingHoldTotal > 0 ? <SummaryRow label="Tiền giữ lịch" value={formatCurrency(bookingHoldTotal)} /> : null}
          <Separator className="my-2" />
          <SummaryRow label="Tiền thuê & phí sau giảm giá" value={formatCurrency(netRental)} className="font-semibold text-primary" />
          <SummaryRow label="Hoàn cọc dự tính" value={formatCurrency(estimatedRefund)} />
        </div>
      </section>
    </>
  );
}

function RentalOrderEstimateSidebar({
  range,
  lines,
  rentalSubtotal,
  discountTotal,
  netRental,
  originalDepositTotal,
  depositTotal,
  bookingHoldTotal,
  deliveryFeeTotal,
  estimatedRefund,
  onEditSchedule,
  onRemoveLine,
}: {
  range: DateTimeRange;
  lines: EstimatedPricingLine[];
  rentalSubtotal: number;
  discountTotal: number;
  netRental: number;
  originalDepositTotal: number;
  depositTotal: number;
  bookingHoldTotal: number;
  deliveryFeeTotal: number;
  estimatedRefund: number;
  onEditSchedule: () => void;
  onRemoveLine: (lineId: OrderLineDraft['id']) => void;
}) {
  const receiveLabel = range.from ? formatDate(range.from, 'rentalSchedule') : 'Chưa chọn';
  const returnLabel = range.to ? formatDate(range.to, 'rentalSchedule') : 'Chưa chọn';
  const durationLabel = formatRentalDuration(range);

  return (
    <div className={cn(SECTION_CARD, 'space-y-6')}>
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-base font-medium uppercase text-primary md:text-lg">Chi tiết đơn hàng</h3>
        <Badge variant="outline">{lines.length} máy</Badge>
      </div>

      <div className="space-y-3">
        {lines.length ? (
          lines.map((line) => (
            <div key={line.id} className="group flex gap-3 rounded-md p-2 hover:bg-primary/10">
              <div className="flex size-16 shrink-0 items-center justify-center rounded-md bg-muted text-primary">
                <IconPackage className="size-6" />
              </div>
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex items-start gap-2">
                  <div className="line-clamp-2 flex-1 text-sm font-semibold">{line.productName}</div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-7 shrink-0 text-muted-foreground hover:text-destructive"
                    onClick={() => onRemoveLine(line.id)}
                    aria-label={`Xóa ${line.productName}`}
                  >
                    <IconX className="size-4" />
                  </Button>
                </div>
                <div className="flex justify-end gap-2 text-xs">
                  <span className="font-medium">{formatCurrency(line.rentalSubtotal, { noDecimals: true })}</span>
                </div>
                <div className="flex justify-end gap-2 text-xs">
                  <span className="text-muted-foreground">Cọc</span>
                  <span className="font-medium text-muted-foreground">
                    {formatCurrency(line.depositAmount, { noDecimals: true })}
                  </span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="p-3 text-center text-sm text-destructive/50">Chưa chọn serial.</p>
        )}
      </div>

      <div className="space-y-3 border-t pt-3">
        <button
          type="button"
          onClick={onEditSchedule}
          className="group flex w-full items-start justify-between gap-4 rounded-lg border border-transparent p-3 transition-colors hover:bg-accent/30"
        >
          <span className="font-medium uppercase text-primary">Lịch thuê</span>
          <div className="flex flex-col items-end gap-1">
            <div className="text-right">
              <span className="mr-2 text-[11px] font-medium uppercase text-muted-foreground">Nhận</span>
              <span className="text-sm font-semibold text-foreground">{receiveLabel}</span>
            </div>
            <div className="text-right">
              <span className="mr-2 text-[11px] font-medium uppercase text-muted-foreground">Trả</span>
              <span className="text-sm font-semibold text-foreground">{returnLabel}</span>
            </div>
            <span className="mt-1 inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
              {durationLabel}
            </span>
          </div>
        </button>
        <p className="mt-1 text-[11px] text-muted-foreground">
          Nhấn để thay đổi lịch trong bước{' '}
          <span className="font-medium italic text-primary">&quot;Lịch &amp; nhận máy&quot;</span>.
        </p>

        {TitleSummary('Tiền thuê', formatCurrency(rentalSubtotal))}
        {discountTotal > 0 ? (
          <>
            {TitleSummary('Voucher giảm giá', `-${formatCurrency(discountTotal)}`, 'text-primary')}
            {TitleSummary('Tiền thuê & phí sau giảm', formatCurrency(netRental))}
          </>
        ) : null}
        {originalDepositTotal !== depositTotal ? TitleSummary('Cọc gốc', formatCurrency(originalDepositTotal)) : null}
        {TitleSummary('Tiền cọc áp dụng', formatCurrency(depositTotal))}
        {TitleSummary('Tiền giữ lịch', formatCurrency(bookingHoldTotal))}
        {deliveryFeeTotal > 0 ? TitleSummary('Phí giao', formatCurrency(deliveryFeeTotal)) : null}
        {TitleSummary(
          'Hoàn cọc (dự tính)',
          formatCurrency(estimatedRefund),
          'bg-primary/10 p-3 font-semibold text-primary',
        )}
      </div>
    </div>
  );
}

function TitleSection(title: string, index?: number) {
  return (
    <h2 className="mb-4 flex items-center gap-3 text-base font-bold uppercase text-primary md:text-lg">
      {index ? (
        <span className="flex size-8 items-center justify-center rounded-full bg-primary/20 text-sm text-primary">
          {index}
        </span>
      ) : null}
      {title}
    </h2>
  );
}

function Row({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-6">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  );
}

function SummaryRow({ label, value, className }: { label: string; value: string; className?: string }) {
  return (
    <div className={cn('flex items-center justify-between text-sm text-muted-foreground', className)}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}

function TitleSummary(title: string, value: string, className?: string) {
  return (
    <div className={cn('flex justify-between text-sm text-text-sub', className)}>
      <p>{title}</p>
      <p className="font-medium">{value}</p>
    </div>
  );
}
