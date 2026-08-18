'use client';

import { CopyText } from '@/components/shared/copy-text';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { CurrencyInput } from '@/components/ui/currency-input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Field, FieldDescription, FieldError, FieldLabel } from '@/components/ui/field';
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
import { collateralTypeOptions, paymentMethodOptions } from '../display-config';
import { useGetRentalOrderById } from '../hooks/use-get-rental-order-by-id';
import { useHandoverRentalOrder } from '../hooks/use-handover-rental-order';
import { rentalOrderHandoverFormSchema, type RentalOrderHandoverFormValues } from '../schema';
import type { CollateralType } from '../type';

type RentalOrderHandoverDialogProps = {
  orderId?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const toDateTimeLocalValue = (value: Date | string = new Date()) => {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return localDate.toISOString().slice(0, 16);
};

const toIsoDateTime = (value: string) => new Date(value).toISOString();

const calculateHandoverPreview = ({
  depositTotal,
  chargeTotal,
  paidTotal,
  collateralType,
}: {
  depositTotal: number;
  chargeTotal: number;
  paidTotal: number;
  collateralType: CollateralType;
}) => {
  let adjustedDepositTotal = Math.max(depositTotal, 0);

  if (adjustedDepositTotal <= 0 && chargeTotal > 0) {
    adjustedDepositTotal = chargeTotal * 2;
  }

  while (adjustedDepositTotal / 2 < chargeTotal) {
    adjustedDepositTotal *= 2;
  }

  const handoverRequiredTotal =
    collateralType === 'VEHICLE_OR_HIGH_VALUE'
      ? chargeTotal
      : collateralType === 'IDENTITY_CARD' || collateralType === 'OTHER_ASSET'
        ? (adjustedDepositTotal + chargeTotal) / 2
        : adjustedDepositTotal;

  return {
    adjustedDepositTotal,
    handoverRequiredTotal,
    handoverAmountDue: Math.max(handoverRequiredTotal - paidTotal, 0),
  };
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

export function RentalOrderHandoverDialog({ orderId, open, onOpenChange }: RentalOrderHandoverDialogProps) {
  const orderQuery = useGetRentalOrderById(open ? orderId : undefined);
  const handoverOrder = useHandoverRentalOrder();
  const order = orderQuery.data;
  const form = useForm<RentalOrderHandoverFormValues>({
    resolver: zodResolver(rentalOrderHandoverFormSchema) as Resolver<RentalOrderHandoverFormValues>,
    defaultValues: {
      actualPickupDate: toDateTimeLocalValue(),
      collateralType: 'NONE',
      collateralDescription: '',
      paymentAmount: 0,
      paymentMethod: 'CASH',
      referenceCode: '',
      note: '',
    },
  });
  const collateralType = useWatch({ control: form.control, name: 'collateralType' });

  const preview = useMemo(() => {
    if (!order) return null;

    return calculateHandoverPreview({
      depositTotal: order.financials.depositTotal,
      chargeTotal: order.financials.chargeTotal,
      paidTotal: order.financials.paidTotal,
      collateralType,
    });
  }, [collateralType, order]);

  useEffect(() => {
    if (!open || !order) return;
    const nextPreview = calculateHandoverPreview({
      depositTotal: order.financials.depositTotal,
      chargeTotal: order.financials.chargeTotal,
      paidTotal: order.financials.paidTotal,
      collateralType: order.fulfillment.collateralType ?? 'NONE',
    });

    queueMicrotask(() => {
      form.reset({
        actualPickupDate: toDateTimeLocalValue(order.rentalPeriod.actualPickupDate ?? new Date()),
        collateralType: order.fulfillment.collateralType ?? 'NONE',
        collateralDescription: order.fulfillment.collateralDescription ?? '',
        paymentAmount: nextPreview.handoverAmountDue,
        paymentMethod: 'CASH',
        referenceCode: '',
        note: '',
      });
    });
  }, [form, open, order]);

  useEffect(() => {
    if (!open || !preview) return;
    form.setValue('paymentAmount', preview.handoverAmountDue, { shouldDirty: true });
  }, [form, open, preview]);

  const handleClose = () => {
    form.reset();
    onOpenChange(false);
  };

  const onSubmit = (values: RentalOrderHandoverFormValues) => {
    if (!order) return;
    const paymentAmount = Math.max(values.paymentAmount, 0);

    handoverOrder.mutate(
      {
        id: order.id,
        data: {
          actualPickupDate: toIsoDateTime(values.actualPickupDate),
          collateralType: values.collateralType,
          collateralDescription: values.collateralDescription.trim() || undefined,
          payment:
            paymentAmount > 0
              ? {
                  method: values.paymentMethod,
                  amount: paymentAmount,
                  referenceCode: values.referenceCode.trim() || undefined,
                  note: values.note.trim() || undefined,
                }
              : undefined,
          note: values.note.trim() || undefined,
        },
      },
      { onSuccess: handleClose },
    );
  };

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => (nextOpen ? onOpenChange(true) : handleClose())}>
      <DialogContent className="sm:max-w-2xl" onPointerDownOutside={(event) => event.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="flex flex-wrap items-center gap-2">
            Bàn giao & thu cọc
            {order ? (
              <CopyText text={String(order.code)} className="py-1 font-bold text-primary underline">
                <span>#{order.code}</span>
              </CopyText>
            ) : null}
          </DialogTitle>
          <DialogDescription>Ghi nhận giờ khách nhận máy, tài sản thế chấp và khoản thu tại quầy.</DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[58dvh]">
          <form id="rental-order-handover-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            {orderQuery.isLoading || !order || !preview ? (
              <div className="grid gap-3 sm:grid-cols-3">
                <Skeleton className="h-16" />
                <Skeleton className="h-16" />
                <Skeleton className="h-16" />
              </div>
            ) : (
              <div className="grid grid-cols-3 divide-x rounded-lg border bg-muted/30 p-2">
                <SummaryMetric label="Đã thu" value={formatCurrency(order.financials.paidTotal)} tone="success" />
                <SummaryMetric label="Yêu cầu khi giao" value={formatCurrency(preview.handoverRequiredTotal)} />
                <SummaryMetric label="Cần thu thêm" value={formatCurrency(preview.handoverAmountDue)} tone="danger" />
              </div>
            )}

            {order && preview ? (
              <div className="grid gap-3 rounded-md border p-3 text-sm sm:grid-cols-2">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-muted-foreground">Tiền thuê & phí</span>
                  <span className="font-medium">{formatCurrency(order.financials.chargeTotal)}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-muted-foreground">Cọc gốc</span>
                  <span className="font-medium">{formatCurrency(order.financials.depositTotal)}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-muted-foreground">Cọc áp dụng</span>
                  <span className="font-medium">{formatCurrency(preview.adjustedDepositTotal)}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-muted-foreground">Đã giữ lịch/đã thu</span>
                  <span className="font-medium">{formatCurrency(order.financials.paidTotal)}</span>
                </div>
              </div>
            ) : null}

            <div className="grid gap-4 sm:grid-cols-2">
              <Controller
                control={form.control}
                name="actualPickupDate"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>Giờ bàn giao *</FieldLabel>
                    <Input {...field} id={field.name} type="datetime-local" aria-invalid={fieldState.invalid} />
                    {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
                  </Field>
                )}
              />

              <Controller
                control={form.control}
                name="collateralType"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>Hình thức thế chấp *</FieldLabel>
                    <Select name={field.name} value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id={field.name} aria-invalid={fieldState.invalid} className="min-w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {collateralTypeOptions.map((option) => (
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
            </div>

            <Controller
              control={form.control}
              name="collateralDescription"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Mô tả tài sản/giấy tờ thế chấp</FieldLabel>
                  <Textarea
                    {...field}
                    id={field.name}
                    aria-invalid={fieldState.invalid}
                    placeholder="VD: Giữ CCCD số..., xe biển số..., laptop serial..."
                  />
                  <FieldDescription>Bắt buộc nếu có chọn CCCD hoặc tài sản thế chấp.</FieldDescription>
                  {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
                </Field>
              )}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <Controller
                control={form.control}
                name="paymentAmount"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>Số tiền thu tại quầy</FieldLabel>
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
                name="paymentMethod"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>Phương thức</FieldLabel>
                    <Select name={field.name} value={field.value} onValueChange={field.onChange}>
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
                name="referenceCode"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>Mã tham chiếu</FieldLabel>
                    <Input {...field} id={field.name} aria-invalid={fieldState.invalid} placeholder="Mã giao dịch..." />
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
                Backend vẫn tự tính lại số tiền bắt buộc khi bàn giao. Frontend chỉ hiển thị tạm tính để nhân viên dễ thu.
              </AlertDescription>
            </Alert>
          </form>
        </ScrollArea>

        <DialogFooter className="flex-row! justify-between!">
          <Button type="button" variant="outline" onClick={handleClose} disabled={handoverOrder.isPending}>
            Hủy
          </Button>
          <Button type="submit" form="rental-order-handover-form" disabled={!order || handoverOrder.isPending}>
            {handoverOrder.isPending ? <IconLoader className="mr-2 size-4 animate-spin" /> : null}
            Xác nhận bàn giao
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
