'use client';

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
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { cn, formatCurrency } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { IconInfoCircle, IconLoader } from '@tabler/icons-react';
import { useEffect, useMemo } from 'react';
import { Controller, type Resolver, useForm, useWatch } from 'react-hook-form';
import { paymentKindOptions, paymentMethodOptions } from '../display-config';
import { useGetRentalOrderById } from '../hooks/use-get-rental-order-by-id';
import { useRecordRentalOrderPayment } from '../hooks/use-record-rental-order-payment';
import type { PaymentKind, PaymentMethod } from '../type';
import { CopyText } from '@/components/shared/copy-text';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { rentalOrderPaymentFormSchema } from '../schema';

type RentalOrderPaymentDialogProps = {
  orderId?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

type PaymentFormValues = {
  kind: Exclude<PaymentKind, 'REFUND'>;
  method: PaymentMethod;
  amount: number;
  referenceCode: string;
  note: string;
};

const allowedPaymentKinds = paymentKindOptions.filter((option) => option.value !== 'REFUND') as Array<{
  value: Exclude<PaymentKind, 'REFUND'>;
  label: string;
}>;

const getPaymentHint = (kind: PaymentFormValues['kind']) => {
  switch (kind) {
    case 'BOOKING_HOLD':
      return 'Sau khi ghi nhận giữ lịch thành công, đơn mới tạo có thể chuyển sang Đã xác nhận và thiết bị sẽ được giữ lịch.';
    case 'HANDOVER_PAYMENT':
      return 'Khoản này dùng khi khách thanh toán thêm lúc nhận máy, thường là phần tiền cọc/tạm ứng còn thiếu.';
    case 'ADDITIONAL_CHARGE':
      return 'Khoản thu thêm thường dùng cho phí phát sinh, phí phạt hoặc phần tiền còn thiếu sau khi đối soát.';
    default:
      return 'Khoản thanh toán sẽ được cộng vào tổng đã thu của đơn thuê.';
  }
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
      <div className="text-sm max-md:text-xs text-muted-foreground">{label}</div>
      <div
        className={cn(
          'mt-1 truncate text-base max-md:text-sm font-semibold tabular-nums',
          tone === 'success' && 'text-emerald-600 dark:text-emerald-400',
          tone === 'danger' && 'text-destructive',
        )}
      >
        {value}
      </div>
    </div>
  );
}

export function RentalOrderPaymentDialog({ orderId, open, onOpenChange }: RentalOrderPaymentDialogProps) {
  const orderQuery = useGetRentalOrderById(open ? orderId : undefined);
  const recordPayment = useRecordRentalOrderPayment();
  const order = orderQuery.data;
  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(rentalOrderPaymentFormSchema) as Resolver<PaymentFormValues>,
    defaultValues: {
      kind: 'BOOKING_HOLD',
      method: 'BANK_TRANSFER',
      amount: 0,
      referenceCode: '',
      note: '',
    },
  });
  const kind = useWatch({ control: form.control, name: 'kind' });
  const amount = useWatch({ control: form.control, name: 'amount' });

  const financials = order?.financials;
  const remainingCharge = financials ? Math.max(financials.chargeTotal - financials.paidTotal, 0) : 0;
  const bookingHoldDue = financials ? Math.max(financials.bookingHoldTotal - financials.paidTotal, 0) : 0;
  const handoverDue = financials
    ? financials.handoverAmountDue > 0
      ? financials.handoverAmountDue
      : Math.max(financials.depositTotal - financials.paidTotal, 0)
    : 0;
  const suggestedAmount = useMemo(() => {
    if (!financials) return 0;
    if (kind === 'BOOKING_HOLD') return bookingHoldDue;
    if (kind === 'HANDOVER_PAYMENT') return handoverDue;
    if (kind === 'ADDITIONAL_CHARGE') return remainingCharge;
    return 0;
  }, [bookingHoldDue, financials, handoverDue, kind, remainingCharge]);

  useEffect(() => {
    if (!open || !order) return;
    queueMicrotask(() => {
      form.reset({
        kind: 'BOOKING_HOLD',
        method: 'BANK_TRANSFER',
        amount: Math.max(order.financials.bookingHoldTotal - order.financials.paidTotal, 0),
        referenceCode: '',
        note: '',
      });
    });
  }, [form, open, order]);

  useEffect(() => {
    if (!open || !order) return;
    form.setValue('amount', suggestedAmount, { shouldDirty: true });
  }, [form, kind, open, order, suggestedAmount]);

  const handleClose = () => {
    form.reset();
    onOpenChange(false);
  };

  const onSubmit = (values: PaymentFormValues) => {
    if (!order) return;

    recordPayment.mutate(
      {
        id: order.id,
        data: {
          kind: values.kind,
          method: values.method,
          amount: values.amount,
          referenceCode: values.referenceCode.trim() || undefined,
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
            Ghi nhận thanh toán
            {order ? (
              <CopyText text={String(order.code)} className="py-1 font-bold text-primary underline">
                <span>#{order.code}</span>
              </CopyText>
            ) : null}
          </DialogTitle>
          <DialogDescription>Nhập khoản tiền khách đã thanh toán cho đơn thuê.</DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[45dvh]">
          <form id="rental-order-payment-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            {orderQuery.isLoading || !financials ? (
              <div className="grid gap-3 sm:grid-cols-3">
                <Skeleton className="h-16" />
                <Skeleton className="h-16" />
                <Skeleton className="h-16" />
              </div>
            ) : (
              <div className="grid grid-cols-3 divide-x rounded-lg border bg-muted/30 p-2">
                <SummaryMetric label="Tiền thuê & phí" value={formatCurrency(financials.chargeTotal)} />
                <SummaryMetric label="Đã thu" value={formatCurrency(financials.paidTotal)} tone="success" />
                <SummaryMetric
                  label="Còn lại"
                  value={formatCurrency(Math.max(handoverDue, remainingCharge))}
                  tone="danger"
                />
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <Controller
                control={form.control}
                name="kind"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>Loại thanh toán *</FieldLabel>
                    <Select name={field.name} value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id={field.name} aria-invalid={fieldState.invalid} className="min-w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {allowedPaymentKinds.map((option) => (
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
                name="method"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>Phương thức *</FieldLabel>
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
                name="amount"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>Số tiền *</FieldLabel>
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
                name="referenceCode"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>Mã tham chiếu</FieldLabel>
                    <Input
                      {...field}
                      id={field.name}
                      aria-invalid={fieldState.invalid}
                      placeholder="Mã giao dịch NH..."
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
                  <Textarea
                    {...field}
                    id={field.name}
                    aria-invalid={fieldState.invalid}
                    placeholder="Nhập ghi chú nếu có..."
                  />
                  {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
                </Field>
              )}
            />

            <Alert className="border-sky-200 bg-sky-50 text-sky-900 dark:border-sky-900/40 dark:bg-sky-950/20 dark:text-sky-100">
              <IconInfoCircle className="size-4" />
              <AlertDescription>
                {getPaymentHint(kind)}
                {amount > 0 ? ` Số tiền đang ghi nhận: ${formatCurrency(amount)}.` : ''}
              </AlertDescription>
            </Alert>
          </form>
        </ScrollArea>

        <DialogFooter className="flex-row! justify-between!">
          <Button type="button" variant="outline" onClick={handleClose} disabled={recordPayment.isPending}>
            Hủy
          </Button>
          <Button type="submit" form="rental-order-payment-form" disabled={!order || recordPayment.isPending}>
            {recordPayment.isPending ? <IconLoader className="mr-2 size-4 animate-spin" /> : null}
            Xác nhận thanh toán
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
