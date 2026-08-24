'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { CurrencyInput } from '@/components/ui/currency-input';
import {
  Dialog,
  DialogContent,
  DialogFooter,
} from '@/components/ui/dialog';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { cn, formatCurrency } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { IconInfoCircle, IconLoader } from '@tabler/icons-react';
import { useEffect, useMemo } from 'react';
import { Controller, type Resolver, useForm, useWatch } from 'react-hook-form';
import { paymentMethodOptions } from '../display-config';
import { useCompleteRentalOrder } from '../hooks/use-complete-rental-order';
import { useGetRentalOrderById } from '../hooks/use-get-rental-order-by-id';
import { rentalOrderCompleteFormSchema, type RentalOrderCompleteFormValues } from '../schema';
import type { IRentalOrderOut } from '../type';
import { RentalOrderDialogHeader } from './rental-order-dialog-header';

type RentalOrderCompleteDialogProps = {
  orderId?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const settlementKindOptions: Array<{ value: RentalOrderCompleteFormValues['settlementKind']; label: string }> = [
  { value: 'NONE', label: 'Chốt đơn, quyết toán sau' },
  { value: 'REFUND', label: 'Hoàn tiền ngay' },
  { value: 'ADDITIONAL_CHARGE', label: 'Thu thêm ngay' },
];

const lateFeePolicyOptions: Array<{ value: RentalOrderCompleteFormValues['lateFeePolicy']; label: string }> = [
  { value: 'CHARGE', label: 'Áp dụng phí trễ' },
  { value: 'WAIVE', label: 'Miễn phí trễ' },
  { value: 'CUSTOM', label: 'Tùy chỉnh phí trễ' },
];

const toDateTimeLocalValue = (value: Date | string = new Date()) => {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return localDate.toISOString().slice(0, 16);
};

const toIsoDateTime = (value: string) => new Date(value).toISOString();

const toMoney = (value: number | null | undefined) => Number(value) || 0;

const getSnapshotMoney = (value: unknown) => {
  const parsed = typeof value === 'number' ? value : typeof value === 'string' ? Number(value) : 0;
  return Number.isFinite(parsed) ? parsed : 0;
};

const calculateEstimatedLateFeeTotal = (order: IRentalOrderOut, actualReturnDateValue: string) => {
  const actualReturnDate = new Date(actualReturnDateValue);
  const endDate = new Date(order.rentalPeriod.endDate);
  if (Number.isNaN(actualReturnDate.getTime()) || Number.isNaN(endDate.getTime())) return 0;

  const lateHours = Math.max((actualReturnDate.getTime() - endDate.getTime()) / (60 * 60 * 1000), 0);
  if (lateHours <= 0) return 0;

  const thresholdHours = Math.max(Number(order.settingsSnapshot.maxLateReturnTimeHours ?? 6), 1);
  const billableLateHours = Math.ceil(lateHours);
  const billableLateDays = billableLateHours >= thresholdHours ? Math.max(Math.ceil(lateHours / 24), 1) : 0;

  return Math.round(
    order.items
      .filter((item) => item.status === 'ACTIVE')
      .reduce((total, item) => {
        const productSnapshot = item.snapshot?.product ?? item.productSnapshot;
        const dailyPrice = getSnapshotMoney(productSnapshot?.dailyPrice ?? item.pricing.unitPrice);
        const hourlyOveragePrice = getSnapshotMoney(productSnapshot?.hourlyOveragePrice);
        return total + (billableLateDays > 0 ? dailyPrice * billableLateDays : hourlyOveragePrice * billableLateHours);
      }, 0),
  );
};

function SummaryMetric({
  label,
  value,
  tone = 'default',
}: {
  label: string;
  value: string;
  tone?: 'default' | 'success' | 'danger';
}) {
  return (
    <div className="min-w-0 text-center">
      <div className="text-sm text-muted-foreground max-md:text-xs">{label}</div>
      <div
        className={cn(
          'mt-1 truncate text-base font-semibold tabular-nums max-md:text-sm',
          tone === 'success' && 'text-emerald-600 dark:text-emerald-400',
          tone === 'danger' && 'text-destructive',
        )}
      >
        {value}
      </div>
    </div>
  );
}

export function RentalOrderCompleteDialog({ orderId, open, onOpenChange }: RentalOrderCompleteDialogProps) {
  const orderQuery = useGetRentalOrderById(open ? orderId : undefined);
  const completeOrder = useCompleteRentalOrder();
  const order = orderQuery.data;
  const form = useForm<RentalOrderCompleteFormValues>({
    resolver: zodResolver(rentalOrderCompleteFormSchema) as Resolver<RentalOrderCompleteFormValues>,
    defaultValues: {
      actualReturnDate: toDateTimeLocalValue(),
      lateFeePolicy: 'CHARGE',
      customLateFeeTotal: 0,
      lateFeeNote: '',
      damageFeeTotal: 0,
      damageNote: '',
      compensationFeeTotal: 0,
      compensationNote: '',
      settlementKind: 'NONE',
      settlementMethod: 'CASH',
      settlementAmount: 0,
      referenceCode: '',
      note: '',
    },
  });
  const actualReturnDate = useWatch({ control: form.control, name: 'actualReturnDate' });
  const lateFeePolicy = useWatch({ control: form.control, name: 'lateFeePolicy' });
  const customLateFeeTotal = useWatch({ control: form.control, name: 'customLateFeeTotal' });
  const damageFeeTotal = useWatch({ control: form.control, name: 'damageFeeTotal' });
  const compensationFeeTotal = useWatch({ control: form.control, name: 'compensationFeeTotal' });
  const settlementKind = useWatch({ control: form.control, name: 'settlementKind' });

  const settlementPreview = useMemo(() => {
    if (!order) {
      return {
        calculatedLateFeeTotal: 0,
        lateFeeTotal: 0,
        rentalRevenueTotal: 0,
        incidentFeeTotal: 0,
        finalChargeTotal: 0,
        refundDue: 0,
        additionalChargeDue: 0,
      };
    }

    const calculatedLateFeeTotal = calculateEstimatedLateFeeTotal(order, actualReturnDate);
    const lateFeeTotal =
      lateFeePolicy === 'WAIVE'
        ? 0
        : lateFeePolicy === 'CUSTOM'
          ? toMoney(customLateFeeTotal)
          : calculatedLateFeeTotal;
    const rentalRevenueTotal = Math.max(
      toMoney(order.financials.rentalFeeTotal) +
        toMoney(order.financials.deliveryFeeTotal) -
        toMoney(order.financials.discountTotal),
      0,
    );
    const incidentFeeTotal = Math.max(lateFeeTotal + toMoney(damageFeeTotal) + toMoney(compensationFeeTotal), 0);
    const finalChargeTotal = Math.max(rentalRevenueTotal + incidentFeeTotal, 0);
    const paidTotal = toMoney(order.financials.paidTotal);
    const actualRefundTotal = toMoney(order.financials.actualRefundTotal);

    return {
      calculatedLateFeeTotal,
      lateFeeTotal,
      rentalRevenueTotal,
      incidentFeeTotal,
      finalChargeTotal,
      refundDue: Math.max(paidTotal - finalChargeTotal - actualRefundTotal, 0),
      additionalChargeDue: Math.max(finalChargeTotal + actualRefundTotal - paidTotal, 0),
    };
  }, [actualReturnDate, compensationFeeTotal, customLateFeeTotal, damageFeeTotal, lateFeePolicy, order]);

  useEffect(() => {
    if (!open || !order) return;
    const initialRefundDue =
      typeof order.financials.refundDue === 'number'
        ? order.financials.refundDue
        : Math.max(order.financials.estimatedRefundTotal - order.financials.actualRefundTotal, 0);
    const initialAdditionalChargeDue =
      typeof order.financials.additionalChargeDue === 'number' ? order.financials.additionalChargeDue : 0;
    const defaultSettlementKind =
      initialAdditionalChargeDue > 0
        ? 'ADDITIONAL_CHARGE'
        : initialRefundDue > 0
          ? 'REFUND'
          : 'NONE';
    const defaultSettlementAmount =
      defaultSettlementKind === 'ADDITIONAL_CHARGE'
        ? initialAdditionalChargeDue
        : defaultSettlementKind === 'REFUND'
          ? initialRefundDue
          : 0;

    queueMicrotask(() => {
      form.reset({
        actualReturnDate: toDateTimeLocalValue(order.rentalPeriod.actualReturnDate ?? new Date()),
        lateFeePolicy: 'CHARGE',
        customLateFeeTotal: 0,
        lateFeeNote: '',
        damageFeeTotal: order.financials.damageFeeTotal,
        damageNote: '',
        compensationFeeTotal: order.financials.compensationFeeTotal,
        compensationNote: '',
        settlementKind: defaultSettlementKind,
        settlementMethod: 'CASH',
        settlementAmount: defaultSettlementAmount,
        referenceCode: '',
        note: '',
      });
    });
  }, [form, open, order]);

  useEffect(() => {
    if (!open || !order) return;
    if (settlementKind === 'REFUND' && settlementPreview.refundDue <= 0 && settlementPreview.additionalChargeDue > 0) {
      form.setValue('settlementKind', 'ADDITIONAL_CHARGE', { shouldDirty: true });
      return;
    }
    if (settlementKind === 'ADDITIONAL_CHARGE' && settlementPreview.additionalChargeDue <= 0 && settlementPreview.refundDue > 0) {
      form.setValue('settlementKind', 'REFUND', { shouldDirty: true });
      return;
    }
    if (settlementKind === 'REFUND') {
      form.setValue('settlementAmount', settlementPreview.refundDue, { shouldDirty: true });
    }
    if (settlementKind === 'ADDITIONAL_CHARGE') {
      form.setValue('settlementAmount', settlementPreview.additionalChargeDue, { shouldDirty: true });
    }
    if (settlementKind === 'NONE') {
      form.setValue('settlementAmount', 0, { shouldDirty: true });
    }
  }, [form, open, order, settlementKind, settlementPreview.additionalChargeDue, settlementPreview.refundDue]);

  const handleClose = () => {
    form.reset();
    onOpenChange(false);
  };

  const onSubmit = (values: RentalOrderCompleteFormValues) => {
    if (!order) return;

    completeOrder.mutate(
      {
        id: order.id,
        data: {
          actualReturnDate: toIsoDateTime(values.actualReturnDate),
          lateFeePolicy: values.lateFeePolicy,
          customLateFeeTotal: values.lateFeePolicy === 'CUSTOM' ? values.customLateFeeTotal : undefined,
          lateFeeNote: values.lateFeeNote.trim() || undefined,
          damageFeeTotal: values.damageFeeTotal,
          damageNote: values.damageNote.trim() || undefined,
          compensationFeeTotal: values.compensationFeeTotal,
          compensationNote: values.compensationNote.trim() || undefined,
          settlementPayment:
            values.settlementKind === 'NONE'
              ? undefined
              : {
                  kind: values.settlementKind,
                  method: values.settlementMethod,
                  amount: values.settlementAmount,
                  referenceCode: values.referenceCode.trim() || undefined,
                  note: values.note.trim() || undefined,
                },
          note: values.note.trim() || undefined,
        },
      },
      { onSuccess: handleClose },
    );
  };

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => (nextOpen ? onOpenChange(true) : handleClose())}>
      <DialogContent className="sm:max-w-2xl" onPointerDownOutside={(event) => event.preventDefault()}>
        <RentalOrderDialogHeader
          order={order}
          title="Nhận trả máy & hoàn tất"
          description="Ghi nhận giờ trả máy, phí hư hỏng và khoản hoàn/thu thêm khi chốt đơn."
        />

        <ScrollArea className="h-[58dvh]">
          <form id="rental-order-complete-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            {orderQuery.isLoading || !order ? (
              <div className="grid gap-3 sm:grid-cols-3">
                <Skeleton className="h-16" />
                <Skeleton className="h-16" />
                <Skeleton className="h-16" />
              </div>
            ) : (
              <div className="space-y-3 rounded-lg border bg-muted/30 p-3">
                <div className="grid gap-3 sm:grid-cols-4">
                  <SummaryMetric label="Tiền thuê" value={formatCurrency(order.financials.rentalFeeTotal)} />
                  <SummaryMetric label="Phí giao" value={formatCurrency(order.financials.deliveryFeeTotal)} />
                  <SummaryMetric
                    label="Giảm giá"
                    value={formatCurrency(order.financials.discountTotal)}
                    tone={order.financials.discountTotal > 0 ? 'success' : 'default'}
                  />
                  <SummaryMetric label="Doanh thu thuê" value={formatCurrency(settlementPreview.rentalRevenueTotal)} />
                </div>
                <div className="grid gap-3 border-t pt-3 sm:grid-cols-4">
                  <SummaryMetric
                    label="Phí trễ hạn"
                    value={formatCurrency(settlementPreview.lateFeeTotal)}
                    tone={settlementPreview.lateFeeTotal > 0 ? 'danger' : 'default'}
                  />
                  <SummaryMetric label="Hư hỏng" value={formatCurrency(damageFeeTotal)} tone={damageFeeTotal > 0 ? 'danger' : 'default'} />
                  <SummaryMetric
                    label="Bồi thường"
                    value={formatCurrency(compensationFeeTotal)}
                    tone={compensationFeeTotal > 0 ? 'danger' : 'default'}
                  />
                  <SummaryMetric
                    label="Phí phát sinh"
                    value={formatCurrency(settlementPreview.incidentFeeTotal)}
                    tone={settlementPreview.incidentFeeTotal > 0 ? 'danger' : 'default'}
                  />
                </div>
                <div className="grid gap-3 border-t pt-3 sm:grid-cols-3">
                  <SummaryMetric label="Đã thu" value={formatCurrency(order.financials.paidTotal)} tone="success" />
                  <SummaryMetric label="Tổng khách phải trả" value={formatCurrency(settlementPreview.finalChargeTotal)} />
                  <SummaryMetric
                    label={settlementPreview.additionalChargeDue > 0 ? 'Sau khi chốt: Cần thu thêm' : 'Sau khi chốt: Cần hoàn'}
                    value={formatCurrency(settlementPreview.additionalChargeDue > 0 ? settlementPreview.additionalChargeDue : settlementPreview.refundDue)}
                    tone={settlementPreview.additionalChargeDue > 0 ? 'danger' : 'success'}
                  />
                </div>
              </div>
            )}

            <div className="space-y-3">
              <div>
                <h3 className="text-sm font-semibold">Kiểm tra khi trả máy</h3>
                <p className="text-xs text-muted-foreground">Ghi nhận tình trạng thực tế để backend chốt lại phí cuối cùng.</p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
              <Controller
                control={form.control}
                name="lateFeePolicy"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>Cách xử lý phí trễ hạn</FieldLabel>
                    <Select name={field.name} value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id={field.name} aria-invalid={fieldState.invalid} className="min-w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {lateFeePolicyOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="text-xs text-muted-foreground">
                      Hệ thống tính {formatCurrency(settlementPreview.calculatedLateFeeTotal)}, áp dụng {formatCurrency(settlementPreview.lateFeeTotal)}.
                    </div>
                    {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
                  </Field>
                )}
              />

              <Controller
                control={form.control}
                name="customLateFeeTotal"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid} data-disabled={lateFeePolicy !== 'CUSTOM'}>
                    <FieldLabel htmlFor={field.name}>Phí trễ tùy chỉnh</FieldLabel>
                    <CurrencyInput
                      {...field}
                      id={field.name}
                      value={field.value}
                      onChange={field.onChange}
                      aria-invalid={fieldState.invalid}
                      min={0}
                      disabled={lateFeePolicy !== 'CUSTOM'}
                    />
                    {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
                  </Field>
                )}
              />

              <Controller
                control={form.control}
                name="actualReturnDate"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>Giờ trả máy *</FieldLabel>
                    <Input {...field} id={field.name} type="datetime-local" aria-invalid={fieldState.invalid} />
                    {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
                  </Field>
                )}
              />

              <Controller
                control={form.control}
                name="damageFeeTotal"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>Phí hư hỏng</FieldLabel>
                    <CurrencyInput
                      {...field}
                      id={field.name}
                      value={field.value}
                      onChange={field.onChange}
                      aria-invalid={fieldState.invalid}
                      min={0}
                    />
                    {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
                  </Field>
                )}
              />
              </div>
            </div>

            <Controller
              control={form.control}
              name="lateFeeNote"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Lý do xử lý phí trễ hạn</FieldLabel>
                  <Input
                    {...field}
                    id={field.name}
                    aria-invalid={fieldState.invalid}
                    placeholder="VD: khách quen nên shop hỗ trợ miễn phí trễ"
                  />
                  {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
                </Field>
              )}
            />

            <Controller
              control={form.control}
              name="damageNote"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Ghi chú tình trạng máy</FieldLabel>
                  <Textarea
                    {...field}
                    id={field.name}
                    aria-invalid={fieldState.invalid}
                    placeholder="VD: trầy nhẹ cạnh trái, mất nắp lens..."
                  />
                  {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
                </Field>
              )}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <Controller
                control={form.control}
                name="compensationFeeTotal"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>Phí bồi thường</FieldLabel>
                    <CurrencyInput
                      {...field}
                      id={field.name}
                      value={field.value}
                      onChange={field.onChange}
                      aria-invalid={fieldState.invalid}
                      min={0}
                    />
                    {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
                  </Field>
                )}
              />

              <Controller
                control={form.control}
                name="compensationNote"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>Ghi chú bồi thường</FieldLabel>
                    <Input
                      {...field}
                      id={field.name}
                      aria-invalid={fieldState.invalid}
                      placeholder="VD: mất phụ kiện, hư nặng, đền theo giá trị..."
                    />
                    {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
                  </Field>
                )}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Controller
                control={form.control}
                name="settlementKind"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>Quyết toán</FieldLabel>
                    <Select name={field.name} value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id={field.name} aria-invalid={fieldState.invalid} className="min-w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {settlementKindOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
                  </Field>
                )}
              />

              <Controller
                control={form.control}
                name="settlementMethod"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>Phương thức</FieldLabel>
                    <Select
                      name={field.name}
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={settlementKind === 'NONE'}
                    >
                      <SelectTrigger id={field.name} aria-invalid={fieldState.invalid} className="min-w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {paymentMethodOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
                  </Field>
                )}
              />

              <Controller
                control={form.control}
                name="settlementAmount"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid} data-disabled={settlementKind === 'NONE'}>
                    <FieldLabel htmlFor={field.name}>Số tiền quyết toán</FieldLabel>
                    <CurrencyInput
                      {...field}
                      id={field.name}
                      value={field.value}
                      onChange={field.onChange}
                      aria-invalid={fieldState.invalid}
                      min={0}
                      disabled={settlementKind === 'NONE'}
                    />
                    {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
                  </Field>
                )}
              />

              <Controller
                control={form.control}
                name="referenceCode"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid} data-disabled={settlementKind === 'NONE'}>
                    <FieldLabel htmlFor={field.name}>Mã tham chiếu</FieldLabel>
                    <Input
                      {...field}
                      id={field.name}
                      aria-invalid={fieldState.invalid}
                      placeholder="Mã giao dịch..."
                      disabled={settlementKind === 'NONE'}
                    />
                    {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
                  </Field>
                )}
              />
            </div>

            <Controller
              control={form.control}
              name="note"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Ghi chú</FieldLabel>
                  <Textarea {...field} id={field.name} aria-invalid={fieldState.invalid} />
                  {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
                </Field>
              )}
            />

            <Alert className="border-sky-200 bg-sky-50 text-sky-900 dark:border-sky-900/40 dark:bg-sky-950/20 dark:text-sky-100">
              <IconInfoCircle className="size-4" />
              <AlertDescription>
                Phí trễ hạn và tổng quyết toán cuối cùng do backend tự tính lại theo giờ trả thực tế.
              </AlertDescription>
            </Alert>
          </form>
        </ScrollArea>

        <DialogFooter className="flex-row! justify-between!">
          <Button type="button" variant="outline" onClick={handleClose} disabled={completeOrder.isPending}>
            Hủy
          </Button>
          <Button type="submit" form="rental-order-complete-form" disabled={!order || completeOrder.isPending}>
            {completeOrder.isPending ? <IconLoader className="mr-2 size-4 animate-spin" /> : null}
            Hoàn tất đơn
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
