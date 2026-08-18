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

type RentalOrderCompleteDialogProps = {
  orderId?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const settlementKindOptions: Array<{ value: RentalOrderCompleteFormValues['settlementKind']; label: string }> = [
  { value: 'NONE', label: 'Không quyết toán ngay' },
  { value: 'REFUND', label: 'Hoàn tiền cho khách' },
  { value: 'ADDITIONAL_CHARGE', label: 'Thu thêm từ khách' },
];

const toDateTimeLocalValue = (value: Date | string = new Date()) => {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return localDate.toISOString().slice(0, 16);
};

const toIsoDateTime = (value: string) => new Date(value).toISOString();

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
      damageFeeTotal: 0,
      damageNote: '',
      settlementKind: 'NONE',
      settlementMethod: 'CASH',
      settlementAmount: 0,
      referenceCode: '',
      note: '',
    },
  });
  const damageFeeTotal = useWatch({ control: form.control, name: 'damageFeeTotal' });
  const settlementKind = useWatch({ control: form.control, name: 'settlementKind' });

  const estimatedRefundAfterDamage = useMemo(() => {
    if (!order) return 0;
    return Math.max(order.financials.estimatedRefundTotal - damageFeeTotal, 0);
  }, [damageFeeTotal, order]);

  useEffect(() => {
    if (!open || !order) return;
    const defaultRefund = Math.max(order.financials.estimatedRefundTotal, 0);

    queueMicrotask(() => {
      form.reset({
        actualReturnDate: toDateTimeLocalValue(order.rentalPeriod.actualReturnDate ?? new Date()),
        damageFeeTotal: order.financials.damageFeeTotal,
        damageNote: '',
        settlementKind: defaultRefund > 0 ? 'REFUND' : 'NONE',
        settlementMethod: 'CASH',
        settlementAmount: defaultRefund,
        referenceCode: '',
        note: '',
      });
    });
  }, [form, open, order]);

  useEffect(() => {
    if (!open || !order) return;
    if (settlementKind === 'REFUND') {
      form.setValue('settlementAmount', estimatedRefundAfterDamage, { shouldDirty: true });
    }
    if (settlementKind === 'NONE') {
      form.setValue('settlementAmount', 0, { shouldDirty: true });
    }
  }, [estimatedRefundAfterDamage, form, open, order, settlementKind]);

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
          damageFeeTotal: values.damageFeeTotal,
          damageNote: values.damageNote.trim() || undefined,
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
        <DialogHeader>
          <DialogTitle className="flex flex-wrap items-center gap-2">
            Nhận trả máy & hoàn tất
            {order ? (
              <CopyText text={String(order.code)} className="py-1 font-bold text-primary underline">
                <span>#{order.code}</span>
              </CopyText>
            ) : null}
          </DialogTitle>
          <DialogDescription>Ghi nhận giờ trả máy, phí hư hỏng và khoản hoàn/thu thêm khi chốt đơn.</DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[58dvh]">
          <form id="rental-order-complete-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            {orderQuery.isLoading || !order ? (
              <div className="grid gap-3 sm:grid-cols-3">
                <Skeleton className="h-16" />
                <Skeleton className="h-16" />
                <Skeleton className="h-16" />
              </div>
            ) : (
              <div className="grid grid-cols-3 divide-x rounded-lg border bg-muted/30 p-2">
                <SummaryMetric label="Đã thu" value={formatCurrency(order.financials.paidTotal)} tone="success" />
                <SummaryMetric label="Tiền thuê & phí" value={formatCurrency(order.financials.chargeTotal)} />
                <SummaryMetric label="Tạm hoàn còn lại" value={formatCurrency(estimatedRefundAfterDamage)} />
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
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
