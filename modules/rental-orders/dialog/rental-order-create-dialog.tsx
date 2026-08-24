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
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
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
import { cn, formatCurrency, formatDate } from '@/lib/utils';
import type { IAvailabilityAsset } from '@/modules/availability/type';
import { CustomerFormDialog } from '@/modules/customers/dialog';
import type { ICustomerOut } from '@/modules/customers/type';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  IconAlertCircle,
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
import { useCallback, useEffect, useMemo, useState, type Dispatch, type ReactNode, type SetStateAction } from 'react';
import {
  Controller,
  FormProvider,
  type Resolver,
  useFieldArray,
  useForm,
  useFormContext,
  useWatch,
} from 'react-hook-form';
import { toast } from 'sonner';
import { pickupMethodConfig } from '../display-config';
import { useCheckRentalOrderAvailability } from '../hooks/use-check-rental-order-availability';
import { useCreateRentalOrder } from '../hooks/use-create-rental-order';
import { useRentalOrderCreateAssetSelection } from '../hooks/use-rental-order-create-asset-selection';
import { useRentalOrderCreateCustomerSelection } from '../hooks/use-rental-order-create-customer-selection';
import {
  createRentalOrderSchema,
  rentalConfirmSchema,
  rentalCustomerSchema,
  rentalItemsSchema,
  rentalScheduleSchema,
  type ICreateRentalOrderInput,
} from '../schema';
import type { OrderLineDraft, PickupMethod } from '../type';
import {
  buildAvailabilityPayload,
  buildCreateRentalOrderPayload,
  formatRentalDuration,
  getEstimatedPricingLines,
  getRentalOrderPricingTotals,
  normalizeOptional,
  toInputDateTime,
  type EstimatedPricingLine,
} from '../utils';
import { RentalOrderAssetSelectionTable } from './rental-order-asset-selection-table';
import { DetailCard } from '@/components/shared/card-custom';

export const rentalOrderCreateSteps = [
  { key: 'schedule', label: 'Lịch & nhận máy', icon: <IconCalendarEvent />, schema: rentalScheduleSchema },
  { key: 'products', label: 'Thiết bị', icon: <IconCamera />, schema: rentalItemsSchema },
  { key: 'customer', label: 'Khách hàng', icon: <IconListCheck />, schema: rentalCustomerSchema },
  { key: 'payment', label: 'Xác nhận', icon: <IconWallet />, schema: rentalConfirmSchema },
] as const;

export type RentalOrderCreateStepKey = (typeof rentalOrderCreateSteps)[number]['key'];

type RentalOrderCreateDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: () => void;
};

type UseRentalOrderCreateLogicProps = RentalOrderCreateDialogProps;

const SECTION_CARD = 'bg-card shadow-xs p-2 md:p-5 border border-accent rounded-lg';

const pickupMethodChoices = Object.entries(pickupMethodConfig).map(([value, config]) => ({
  ...config,
  value: value as PickupMethod,
}));

const getPickupMethodLabel = (method: PickupMethod) => pickupMethodConfig[method].label;

export function RentalOrderCreateDialog({ open, onOpenChange, onCreated }: RentalOrderCreateDialogProps) {
  const wizard = useRentalOrderCreateLogic({ open, onOpenChange, onCreated });
  const [calendarPortalContainer, setCalendarPortalContainer] = useState<HTMLDivElement | null>(null);

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => (nextOpen ? onOpenChange(true) : wizard.handleClose())}>
      <DialogContent className="sm:max-w-7xl" onPointerDownOutside={(event) => event.preventDefault()}>
        <div ref={setCalendarPortalContainer} className="contents">
          <DialogHeader>
            <DialogTitle>Tạo đơn thuê</DialogTitle>
            <DialogDescription>
              Quản trị cần kiểm tra lịch thuê, thiết bị, khách hàng và chi phí trước khi tạo đơn.
            </DialogDescription>
          </DialogHeader>

          <FormProvider {...wizard.form}>
            <Stepper
              className="w-full space-y-4"
              value={wizard.stepIndex + 1}
              onValueChange={(value) => {
                const nextStep = rentalOrderCreateSteps[value - 1];
                if (!nextStep || value - 1 > wizard.stepIndex) return;
                wizard.setStep(nextStep.key);
              }}
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
                      <StepperIndicator className="size-10">{item.icon}</StepperIndicator>
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
                <ScrollArea className="h-[calc(60dvh-105px)]">
                  <div className="grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1fr)_360px] p-1">
                    <div className="space-y-5">
                      <CreateStepContent wizard={wizard} calendarPortalContainer={calendarPortalContainer} />
                    </div>

                    <aside className="min-w-0 space-y-5 lg:sticky lg:top-2 lg:self-start">
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
                        handoverRequiredTotal={wizard.handoverRequiredTotal}
                        onEditSchedule={() => wizard.setStep('schedule')}
                        onRemoveLine={wizard.removeAssetByLineId}
                      />
                    </aside>
                  </div>
                </ScrollArea>

                <DialogFooter className="flex-row! justify-between!">
                  <div>
                    {wizard.stepIndex !== 0 ? (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={wizard.handleBack}
                        className="w-auto uppercase tracking-widest sm:min-w-[160px]"
                      >
                        <IconChevronLeft className="mr-1.5 size-4" />
                        Quay lại
                      </Button>
                    ) : null}
                  </div>

                  {wizard.step !== 'payment' ? (
                    <Button
                      type="button"
                      onClick={wizard.handleNext}
                      disabled={
                        wizard.checkAvailability.isPending ||
                        (wizard.step === 'products' && wizard.hasAvailabilityConflict)
                      }
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
                      {wizard.createOrder.isPending ? 'Đang tạo...' : 'Tạo đơn'}
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

function useRentalOrderCreateLogic({ open, onOpenChange, onCreated }: UseRentalOrderCreateLogicProps) {
  const [step, setStep] = useState<RentalOrderCreateStepKey>('schedule');
  const [rangeOpen, setRangeOpen] = useState(false);
  const checkAvailability = useCheckRentalOrderAvailability();
  const { mutate: checkSelectedAvailability, reset: resetSelectedAvailability } = checkAvailability;
  const createOrder = useCreateRentalOrder();
  const form = useForm<ICreateRentalOrderInput>({
    resolver: zodResolver(createRentalOrderSchema) as unknown as Resolver<ICreateRentalOrderInput>,
    defaultValues: {
      customerId: '',
      items: [],
      range: { from: undefined, to: undefined },
      pickupMethod: 'PICKUP_AT_STORE',
      deliveryAddress: '',
      deliveryFeeTotal: 0,
      discountTotal: 0,
      note: '',
      internalNote: '',
    },
    mode: 'onTouched',
  });
  const itemsFieldArray = useFieldArray({
    control: form.control,
    name: 'items',
    keyName: 'fieldId',
  });

  const stepIndex = rentalOrderCreateSteps.findIndex((item) => item.key === step);
  const range = useWatch({ control: form.control, name: 'range' });
  const watchedItems = useWatch({ control: form.control, name: 'items' });
  const items = useMemo(() => watchedItems ?? [], [watchedItems]);
  const customerId = useWatch({ control: form.control, name: 'customerId' });
  const pickupMethod = useWatch({ control: form.control, name: 'pickupMethod' });
  const deliveryAddress = useWatch({ control: form.control, name: 'deliveryAddress' });
  const deliveryFeeTotal = useWatch({ control: form.control, name: 'deliveryFeeTotal' });
  const discountTotal = useWatch({ control: form.control, name: 'discountTotal' });
  const startDate = toInputDateTime(range.from);
  const endDate = toInputDateTime(range.to);
  const hasValidRange = Boolean(range.from && range.to && range.from < range.to);
  const hasPickupInfo = pickupMethod === 'PICKUP_AT_STORE' || Boolean(deliveryAddress.trim());

  const resetAvailability = useCallback(() => {
    resetSelectedAvailability();
  }, [resetSelectedAvailability]);

  const assetSelection = useRentalOrderCreateAssetSelection({
    open,
    startDate,
    endDate,
    hasValidRange,
    items,
    append: itemsFieldArray.append,
    remove: itemsFieldArray.remove,
    resetAvailability,
  });
  const customerSelection = useRentalOrderCreateCustomerSelection({
    open,
    hasValidRange,
    form,
  });

  const availabilityPayload = useMemo(
    () => buildAvailabilityPayload(items, startDate, endDate),
    [endDate, items, startDate],
  );

  const pricingLines = useMemo<EstimatedPricingLine[]>(() => getEstimatedPricingLines(items, range), [items, range]);
  const {
    rentalSubtotal,
    originalDepositTotal,
    depositTotal,
    netRental,
    estimatedRefund,
    bookingHoldTotal,
    handoverRequiredTotal,
  } = useMemo(
    () =>
      getRentalOrderPricingTotals(
        pricingLines,
        discountTotal,
        assetSelection.bookingHoldAmountPerUnit,
        pickupMethod === 'DELIVERY' ? deliveryFeeTotal : 0,
      ),
    [assetSelection.bookingHoldAmountPerUnit, deliveryFeeTotal, discountTotal, pickupMethod, pricingLines],
  );
  const scheduleReady = hasValidRange && hasPickupInfo && items.length > 0;
  const scheduleChecked = scheduleReady && checkAvailability.data?.isAvailable === true;
  const hasAvailabilityConflict = checkAvailability.data?.isAvailable === false;
  const canCreate = scheduleChecked && Boolean(customerId) && !checkAvailability.isPending && !createOrder.isPending;

  const handleNext = async () => {
    let valid = false;

    switch (step) {
      case 'schedule':
        valid = await form.trigger(['range', 'pickupMethod', 'deliveryAddress', 'deliveryFeeTotal']);
        break;
      case 'products':
        valid = await form.trigger(['items']);
        if (valid) {
          const result = await checkAvailability.mutateAsync(availabilityPayload);
          if (!result.isAvailable) {
            toast.error('Một số thiết bị không còn khả dụng trong khoảng thời gian này');
            return;
          }
        }
        break;
      case 'customer':
        valid = await form.trigger(['customerId']);
        break;
      case 'payment':
        valid = await form.trigger(['discountTotal', 'note', 'internalNote']);
        break;
    }

    if (!valid) return;

    const nextStep = rentalOrderCreateSteps[stepIndex + 1];
    if (nextStep) setStep(nextStep.key);
  };

  const handleBack = () => {
    setStep(rentalOrderCreateSteps[Math.max(stepIndex - 1, 0)].key);
  };

  const handleClose = () => {
    form.reset();
    resetSelectedAvailability();
    setStep('schedule');
    setRangeOpen(false);
    assetSelection.resetAssetTable();
    customerSelection.resetCustomerSelection();
    onOpenChange(false);
  };

  const handleCreate = async (values: ICreateRentalOrderInput) => {
    if (!canCreate) return;

    await createOrder.mutateAsync({
      customerId: values.customerId,
      startDate,
      endDate,
      pickupMethod: values.pickupMethod,
      deliveryAddress: values.pickupMethod === 'DELIVERY' ? values.deliveryAddress.trim() : '',
      deliveryFeeTotal: values.pickupMethod === 'DELIVERY' ? values.deliveryFeeTotal : 0,
      discountTotal: values.discountTotal,
      note: normalizeOptional(values.note),
      internalNote: normalizeOptional(values.internalNote),
      items: values.items.map((line) => ({
        productId: line.productId,
        assetUnitId: line.assetUnitId,
        note: normalizeOptional(line.note ?? ''),
      })),
    });

    onCreated?.();
    handleClose();
  };

  return {
    assetTable: assetSelection.assetTable,
    canCreate,
    checkAvailability,
    createOrder,
    customerDialogOpen: customerSelection.customerDialogOpen,
    customerTable: customerSelection.customerTable,
    depositTotal,
    discountTotal,
    estimatedRefund,
    handoverRequiredTotal,
    form,
    handleBack,
    handleClose,
    handleCreate,
    handleCustomerCreated: customerSelection.handleCustomerCreated,
    handleNext,
    hasAvailabilityConflict,
    netRental,
    originalDepositTotal,
    pickupMethod,
    pricingLines,
    range,
    rangeOpen,
    removeAssetByLineId: assetSelection.removeAssetByLineId,
    rentalSubtotal,
    resetAvailability,
    selectedCustomer: customerSelection.selectedCustomer,
    setCustomerDialogOpen: customerSelection.setCustomerDialogOpen,
    setRangeOpen,
    setStep,
    step,
    stepIndex,
    bookingHoldTotal,
    deliveryFeeTotal,
  };
}

function CreateStepContent({
  wizard,
  calendarPortalContainer,
}: {
  wizard: ReturnType<typeof useRentalOrderCreateLogic>;
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
      handoverRequiredTotal={wizard.handoverRequiredTotal}
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

            {fieldState.invalid ? (
              <Alert variant="destructive">
                <IconAlertCircle />
                <AlertTitle>
                  <FieldError errors={[fieldState.error]} />
                </AlertTitle>
                <AlertDescription>
                  Giờ trả máy phải sau giờ nhận máy. Hệ thống sẽ không kiểm tra lịch khi khung giờ chưa hợp lệ.
                </AlertDescription>
              </Alert>
            ) : null}
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

            {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
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
            {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
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
            {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
          </Field>
        )}
      />
    </section>
  );
}

function ProductsStep({
  assetTable,
  hasAvailabilityConflict,
}: {
  assetTable: DataTableInstance<IAvailabilityAsset>;
  isChecking: boolean;
  hasAvailabilityConflict: boolean;
}) {
  return (
    <section className="space-y-3 p-0.5">
      {/* {isChecking ? (
        <div className="rounded-md border bg-muted/30 px-3 py-2 text-sm text-muted-foreground">
          Đang kiểm tra lịch của các thiết bị đã chọn...
        </div>
      ) : null} */}
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
  handoverRequiredTotal,
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
  handoverRequiredTotal: number;
}) {
  const { control } = useFormContext<ICreateRentalOrderInput>();

  return (
    <>
      <section className={cn(SECTION_CARD, 'space-y-6')}>
        {TitleSection('Giảm giá & Ghi chú')}
        <div className="grid gap-4 lg:grid-cols-2">
          <Controller
            control={control}
            name="discountTotal"
            render={({ field, fieldState }) => (
              <Field className="lg:col-span-2" data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Giảm giá</FieldLabel>
                <CurrencyInput
                  {...field}
                  id={field.name}
                  aria-invalid={fieldState.invalid}
                  min={0}
                  placeholder="Nhập số tiền giảm"
                />
                {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
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
                {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
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
                {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
              </Field>
            )}
          />
        </div>

        <Separator />
        <div className="space-y-4">
          {TitleSection('Tóm tắt đơn hàng')}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <SummaryInfoCard icon={<User className="size-4 text-muted-foreground" />} title="Thông tin khách hàng">
              <Row label="Tên" value={selectedCustomer?.name ?? '-'} />
              <Row label="Số điện thoại" value={selectedCustomer?.phone ?? '-'} />
              <Row label="Email" value={selectedCustomer?.email ?? '-'} />
              <Row label="Địa chỉ" value={selectedCustomer?.address ?? '-'} />
            </SummaryInfoCard>

            <SummaryInfoCard icon={<Calendar className="size-4 text-muted-foreground" />} title="Lịch thuê & giao nhận">
              <Row label="Giờ nhận" value={range.from ? formatDate(range.from) : '-'} />
              <Row label="Giờ trả" value={range.to ? formatDate(range.to) : '-'} />
              <Row label="Hình thức" value={getPickupMethodLabel(pickupMethod)} />
              {pickupMethod === 'DELIVERY' ? (
                <Row
                  label="Phí giao"
                  value={<span className="font-medium text-foreground">{formatCurrency(deliveryFeeTotal)}</span>}
                />
              ) : null}
            </SummaryInfoCard>
          </div>
        </div>
      </section>

      <section className={cn(SECTION_CARD, 'my-6 p-0! md:p-0!')}>
        <OrderLinesPreview lines={pricingLines} />
        <FinancialSummaryRows
          rentalSubtotal={rentalSubtotal}
          deliveryFeeTotal={pickupMethod === 'DELIVERY' ? deliveryFeeTotal : 0}
          originalDepositTotal={originalDepositTotal}
          depositTotal={depositTotal}
          bookingHoldTotal={bookingHoldTotal}
          netRental={netRental}
          estimatedRefund={estimatedRefund}
          handoverRequiredTotal={handoverRequiredTotal}
        />
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
  handoverRequiredTotal,
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
  handoverRequiredTotal: number;
  onEditSchedule: () => void;
  onRemoveLine: (lineId: OrderLineDraft['id']) => void;
}) {
  const receiveLabel = range.from ? formatDate(range.from, 'rentalSchedule') : 'Chưa chọn';
  const returnLabel = range.to ? formatDate(range.to, 'rentalSchedule') : 'Chưa chọn';
  const durationLabel = formatRentalDuration(range);

  return (
    <DetailCard title="CHI TIẾT ĐƠN HÀNG" action={<Badge variant="outline">{lines.length} máy</Badge>}>
      <SidebarOrderLines lines={lines} onRemoveLine={onRemoveLine} />
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

        <SidebarFinancialSummary
          rentalSubtotal={rentalSubtotal}
          discountTotal={discountTotal}
          netRental={netRental}
          originalDepositTotal={originalDepositTotal}
          depositTotal={depositTotal}
          bookingHoldTotal={bookingHoldTotal}
          deliveryFeeTotal={deliveryFeeTotal}
          estimatedRefund={estimatedRefund}
          handoverRequiredTotal={handoverRequiredTotal}
        />
      </div>
    </DetailCard>
  );
}

function SummaryInfoCard({ icon, title, children }: { icon: ReactNode; title: string; children: ReactNode }) {
  return (
    <div className="space-y-3 rounded-lg border bg-muted/30 p-4">
      <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
        {icon}
        <span>{title}</span>
      </div>
      <div className="space-y-2 text-sm">{children}</div>
    </div>
  );
}

function OrderLinesPreview({ lines }: { lines: EstimatedPricingLine[] }) {
  return (
    <>
      <div className="flex items-center justify-between border-b bg-muted/20 px-4 py-3">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <Package className="size-4 text-muted-foreground" />
          <span>Danh sách thiết bị</span>
        </div>
        <Badge variant="secondary" className="font-normal">
          {lines.length} thiết bị
        </Badge>
      </div>

      <div className="divide-y">
        {lines.map((line) => (
          <div
            key={line.id}
            className="flex flex-col gap-2 p-4 transition-colors hover:bg-muted/10 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="min-w-0 space-y-1">
              <div className="text-sm font-medium leading-none">{line.productName}</div>
              <span className="inline-block rounded bg-muted px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground">
                Serial: {line.serialNumber || 'N/A'}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm sm:flex-col sm:items-end">
              <div className="font-semibold text-foreground">{formatCurrency(line.rentalSubtotal)}</div>
              <div className="text-xs font-medium text-amber-600 dark:text-amber-500">
                Cọc: {formatCurrency(line.depositAmount)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function SidebarOrderLines({
  lines,
  onRemoveLine,
}: {
  lines: EstimatedPricingLine[];
  onRemoveLine: (lineId: OrderLineDraft['id']) => void;
}) {
  if (!lines.length) {
    return <p className="p-3 text-center text-sm text-destructive/50">Chưa chọn serial.</p>;
  }

  return (
    <div className="space-y-3">
      {lines.map((line) => (
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
            <LineAmount label="" value={formatCurrency(line.rentalSubtotal, { noDecimals: true })} />
            <LineAmount label="Cọc" value={formatCurrency(line.depositAmount, { noDecimals: true })} muted />
          </div>
        </div>
      ))}
    </div>
  );
}

function FinancialSummaryRows({
  rentalSubtotal,
  deliveryFeeTotal,
  originalDepositTotal,
  depositTotal,
  bookingHoldTotal,
  netRental,
  estimatedRefund,
  handoverRequiredTotal,
}: {
  rentalSubtotal: number;
  deliveryFeeTotal: number;
  originalDepositTotal: number;
  depositTotal: number;
  bookingHoldTotal: number;
  netRental: number;
  estimatedRefund: number;
  handoverRequiredTotal: number;
}) {
  return (
    <div className="space-y-2 border-t bg-muted/30 p-4">
      <SummaryRow label="Tổng tiền thuê thiết bị" value={formatCurrency(rentalSubtotal)} />
      {deliveryFeeTotal > 0 ? <SummaryRow label="Phí vận chuyển" value={formatCurrency(deliveryFeeTotal)} /> : null}
      {originalDepositTotal !== depositTotal ? (
        <SummaryRow label="Cọc gốc theo thiết bị" value={formatCurrency(originalDepositTotal)} />
      ) : null}
      <SummaryRow
        label="Tiền cọc cần thu"
        value={formatCurrency(depositTotal)}
        className="text-amber-600 dark:text-amber-500"
      />
      {bookingHoldTotal > 0 ? <SummaryRow label="Tiền giữ lịch" value={formatCurrency(bookingHoldTotal)} /> : null}
      <Separator className="my-2" />
      <SummaryRow
        label="Tiền thuê & phí sau giảm giá"
        value={formatCurrency(netRental)}
        className="font-semibold text-primary"
      />
      <SummaryRow
        label="Tổng cần thu khi giao"
        value={formatCurrency(handoverRequiredTotal)}
        className="font-semibold text-amber-600 dark:text-amber-500"
      />
      <SummaryRow label="Hoàn cọc dự tính" value={formatCurrency(estimatedRefund)} />
    </div>
  );
}

function SidebarFinancialSummary({
  rentalSubtotal,
  discountTotal,
  netRental,
  originalDepositTotal,
  depositTotal,
  bookingHoldTotal,
  deliveryFeeTotal,
  estimatedRefund,
  handoverRequiredTotal,
}: {
  rentalSubtotal: number;
  discountTotal: number;
  netRental: number;
  originalDepositTotal: number;
  depositTotal: number;
  bookingHoldTotal: number;
  deliveryFeeTotal: number;
  estimatedRefund: number;
  handoverRequiredTotal: number;
}) {
  return (
    <>
      {TitleSummary('Tiền thuê', formatCurrency(rentalSubtotal))}
      {discountTotal > 0 ? (
        <>
          {TitleSummary('Voucher giảm giá', `-${formatCurrency(discountTotal)}`, 'text-primary')}
          {TitleSummary('Tiền thuê & phí sau giảm', formatCurrency(netRental))}
        </>
      ) : null}
      {originalDepositTotal !== depositTotal ? TitleSummary('Cọc gốc', formatCurrency(originalDepositTotal)) : null}
      {TitleSummary('Tiền cọc cần thu', formatCurrency(depositTotal))}
      {TitleSummary('Tiền giữ lịch', formatCurrency(bookingHoldTotal))}
      {deliveryFeeTotal > 0 ? TitleSummary('Phí giao', formatCurrency(deliveryFeeTotal)) : null}
      {TitleSummary('Tổng cần thu khi giao', formatCurrency(handoverRequiredTotal), 'font-semibold text-amber-600')}
      {TitleSummary(
        'Hoàn cọc (dự tính)',
        formatCurrency(estimatedRefund),
        'bg-primary/10 p-3 font-semibold text-primary',
      )}
    </>
  );
}

function LineAmount({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className="flex justify-end gap-2 text-xs">
      {label ? <span className="text-muted-foreground">{label}</span> : null}
      <span className={cn('font-medium', muted && 'text-muted-foreground')}>{value}</span>
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
