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
import { useGetRentalOrderById } from '../hooks/use-get-rental-order-by-id';
import { useRefundRentalOrderPayment } from '../hooks/use-refund-rental-order-payment';
import { rentalOrderRefundFormSchema, type RentalOrderRefundFormValues } from '../schema';
import { calculateRentalOrderSettlementFinancials } from '../utils';
import { RentalOrderDialogHeader } from './rental-order-dialog-header';

type RentalOrderRefundDialogProps = {
  orderId?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
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

export function RentalOrderRefundDialog({ orderId, open, onOpenChange }: RentalOrderRefundDialogProps) {
  const orderQuery = useGetRentalOrderById(open ? orderId : undefined);
  const refundOrder = useRefundRentalOrderPayment();
  const order = orderQuery.data;
  const form = useForm<RentalOrderRefundFormValues>({
    resolver: zodResolver(rentalOrderRefundFormSchema) as Resolver<RentalOrderRefundFormValues>,
    defaultValues: {
      method: 'BANK_TRANSFER',
      amount: 0,
      referenceCode: '',
      note: '',
    },
  });
  const amount = useWatch({ control: form.control, name: 'amount' });
  const settlement = useMemo(
    () => (order ? calculateRentalOrderSettlementFinancials({ status: order.status, ...order.financials }) : null),
    [order],
  );
  const refundDue = settlement?.refundDue ?? 0;
  const remainingRefundDue = Math.max(refundDue - (Number(amount) || 0), 0);
  const isRefundAmountInvalid = Boolean(order) && ((Number(amount) || 0) <= 0 || (Number(amount) || 0) > refundDue);

  useEffect(() => {
    if (!open || !order) return;
    queueMicrotask(() => {
      form.reset({
        method: 'BANK_TRANSFER',
        amount: refundDue,
        referenceCode: '',
        note: '',
      });
    });
  }, [form, open, order, refundDue]);

  const handleClose = () => {
    form.reset();
    onOpenChange(false);
  };

  const onSubmit = (values: RentalOrderRefundFormValues) => {
    if (!order) return;

    refundOrder.mutate(
      {
        id: order.id,
        data: {
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
        <RentalOrderDialogHeader
          order={order}
          title="Hoàn cọc đơn thuê"
          description="Ghi nhận khoản tiền shop hoàn lại cho khách sau khi đơn đã hủy hoặc hoàn tất."
        />

        <ScrollArea className="h-[45dvh]">
          <form id="rental-order-refund-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            {orderQuery.isLoading || !order ? (
              <div className="grid gap-3 sm:grid-cols-3">
                <Skeleton className="h-16" />
                <Skeleton className="h-16" />
                <Skeleton className="h-16" />
              </div>
            ) : (
              <div className="space-y-3 rounded-lg border bg-muted/30 p-3">
                <div className="grid gap-3 sm:grid-cols-3">
                  <SummaryMetric label="Đã thu" value={formatCurrency(order.financials.paidTotal)} tone="success" />
                  <SummaryMetric label="Tổng khách phải trả" value={formatCurrency(settlement?.finalPayableTotal ?? 0)} />
                  <SummaryMetric label="Đã hoàn" value={formatCurrency(order.financials.actualRefundTotal)} />
                </div>
                <div className="grid gap-3 border-t pt-3 sm:grid-cols-3">
                  <SummaryMetric label="Còn phải hoàn" value={formatCurrency(refundDue)} tone="success" />
                  <SummaryMetric
                    label="Đang hoàn"
                    value={formatCurrency(amount)}
                    tone={isRefundAmountInvalid && amount > 0 ? 'danger' : 'success'}
                  />
                  <SummaryMetric label="Còn lại sau hoàn" value={formatCurrency(remainingRefundDue)} />
                </div>
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
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
                    <FieldLabel htmlFor={field.name}>Số tiền hoàn *</FieldLabel>
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

            {isRefundAmountInvalid && amount > 0 ? (
              <Alert className="border-destructive/30 bg-destructive/10 text-destructive">
                <IconInfoCircle className="size-4" />
                <AlertDescription>Số tiền hoàn không được lớn hơn số còn phải hoàn.</AlertDescription>
              </Alert>
            ) : null}

            <Alert className="border-sky-200 bg-sky-50 text-sky-900 dark:border-sky-900/40 dark:bg-sky-950/20 dark:text-sky-100">
              <IconInfoCircle className="size-4" />
              <AlertDescription>
                Khoản hoàn tiền sẽ được ghi nhận thành payment record loại Hoàn tiền, không sửa trực tiếp lịch sử thu.
              </AlertDescription>
            </Alert>
          </form>
        </ScrollArea>

        <DialogFooter className="flex-row! justify-between!">
          <Button type="button" variant="outline" onClick={handleClose} disabled={refundOrder.isPending}>
            Hủy
          </Button>
          <Button type="submit" form="rental-order-refund-form" disabled={!order || refundOrder.isPending || isRefundAmountInvalid}>
            {refundOrder.isPending ? <IconLoader className="mr-2 size-4 animate-spin" /> : null}
            Xác nhận hoàn tiền
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
