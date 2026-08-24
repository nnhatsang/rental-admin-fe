'use client';

import { BadgeCustom } from '@/components/shared/badge-custom';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { CopyText } from '@/components/shared/copy-text';
import { Info } from '@/components/shared/card-custom';
import { Badge } from '@/components/ui/badge';
import { CurrencyInput } from '@/components/ui/currency-input';
import { Field, FieldContent, FieldDescription, FieldError, FieldLabel } from '@/components/ui/field';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { formatCurrency, formatDate } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { RentalOrderCompleteDialog } from './dialog/rental-order-complete-dialog';
import { RentalOrderCreateDialog } from './dialog/rental-order-create-dialog';
import { RentalOrderDetailDialog } from './dialog/rental-order-detail-dialog';
import { RentalOrderHandoverDialog } from './dialog/rental-order-handover-dialog';
import { RentalOrderPaymentDialog } from './dialog/rental-order-payment-dialog';
import { RentalOrderRefundDialog } from './dialog/rental-order-refund-dialog';
import { RentalOrderUpdateDialog } from './dialog/rental-order-update-dialog';
import { orderStatusConfig, paymentStatusConfig, refundStatusConfig } from './display-config';
import { useCancelRentalOrder } from './hooks/use-cancel-rental-order';
import { useDeleteRentalOrders } from './hooks/use-delete-rental-orders';
import { useRentalOrders } from './rental-orders-provider';
import { rentalOrderCancelFormSchema, type RentalOrderCancelFormValues } from './schema';
import type { IRentalOrderListItemOut } from './type';
import { formatRentalDuration } from './utils';

type CancelPaymentHandling = 'KEEP_PAID_AMOUNT_AS_PENALTY' | 'REFUND_BOOKING_HOLD';

function RentalOrderConfirmSummary({ order }: { order: IRentalOrderListItemOut }) {
  const durationLabel = formatRentalDuration({ from: new Date(order.startDate), to: new Date(order.endDate) });
  const periodLabel =
    [formatDate(order.startDate, 'shortDateTime'), formatDate(order.endDate, 'shortDateTime')]
      .filter(Boolean)
      .join(' - ') || '-';

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <span>Đơn thuê</span>
        <CopyText text={order.code} className="font-semibold text-primary">
          #{order.code}
        </CopyText>
        <BadgeCustom status={order.status} config={orderStatusConfig} />
        <BadgeCustom status={order.paymentStatus} config={paymentStatusConfig} />
        <BadgeCustom status={order.refundStatus} config={refundStatusConfig} />
      </div>
      <div className="flex flex-wrap items-center gap-1 font-medium">
        {periodLabel}
        <Badge variant="outline" className="shrink-0">
          {durationLabel}
        </Badge>
      </div>
    </div>
  );
}

function RentalOrderCancelConfirmDialog({
  order,
  open,
  onOpenChange,
}: {
  order: IRentalOrderListItemOut;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const cancelOrder = useCancelRentalOrder();
  const maxRefundAmount = Math.min(order.paidTotal, order.bookingHoldTotal);
  const form = useForm<RentalOrderCancelFormValues>({
    resolver: zodResolver(rentalOrderCancelFormSchema),
    defaultValues: {
      cancelReason: '',
      cancelPaymentHandling: 'KEEP_PAID_AMOUNT_AS_PENALTY',
      refundAmount: 0,
    },
  });
  const cancelReason = useWatch({ control: form.control, name: 'cancelReason' });
  const cancelPaymentHandling = useWatch({ control: form.control, name: 'cancelPaymentHandling' });
  const refundBookingHold = cancelPaymentHandling === 'REFUND_BOOKING_HOLD';
  const reason = cancelReason.trim();

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      form.reset();
    }
    onOpenChange(nextOpen);
  };

  const onSubmit = (values: RentalOrderCancelFormValues) => {
    const submitReason = values.cancelReason.trim();
    const shouldRefundBookingHold = values.cancelPaymentHandling === 'REFUND_BOOKING_HOLD';

    cancelOrder.mutate(
      {
        id: order.id,
        data: {
          cancelReason: submitReason,
          refundBookingHold: shouldRefundBookingHold,
          keepPaidAmountAsPenalty: !shouldRefundBookingHold,
          ...(shouldRefundBookingHold ? { refundAmount: Math.min(values.refundAmount, maxRefundAmount) } : {}),
          note: submitReason,
        },
      },
      { onSuccess: () => handleOpenChange(false) },
    );
  };

  return (
    <ConfirmDialog
      open={open}
      className="!max-w-xl"
      onOpenChange={handleOpenChange}
      title="Hủy đơn thuê"
      desc={
        <div className="space-y-2">
          <RentalOrderConfirmSummary order={order} />
          <p>Đơn sẽ được huỷ và lịch thiết bị sẽ được giải phóng.</p>
        </div>
      }
      cancelBtnText="Đóng"
      confirmText="Xác nhận hủy"
      destructive
      disabled={!reason}
      isLoading={cancelOrder.isPending}
      form="rental-order-cancel-form"
    >
      <ScrollArea className="max-h-[62dvh]">
        <form id="rental-order-cancel-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="rounded-md border bg-muted/30 p-2">
            <Info label="Đã thu" value={formatCurrency(order.paidTotal)} line />
            <Info label="Giữ lịch tối đa có thể hoàn" value={formatCurrency(maxRefundAmount)} line />
          </div>

          <Controller
            name="cancelReason"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Lý do hủy</FieldLabel>
                <Textarea
                  {...field}
                  id={field.name}
                  aria-invalid={fieldState.invalid}
                  placeholder="Nhập lý do hủy đơn..."
                  disabled={cancelOrder.isPending}
                />
                <FieldDescription>Vui lòng nhập lý do hủy đơn thuê.</FieldDescription>
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          <Controller
            control={form.control}
            name="cancelPaymentHandling"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Xử lý tiền đã thu</FieldLabel>
                <RadioGroup
                  id={field.name}
                  name={field.name}
                  value={field.value}
                  onValueChange={(value) => {
                    const nextValue = value as CancelPaymentHandling;
                    field.onChange(nextValue);
                    form.setValue('refundAmount', nextValue === 'REFUND_BOOKING_HOLD' ? maxRefundAmount : 0, {
                      shouldDirty: true,
                    });
                  }}
                  disabled={cancelOrder.isPending}
                >
                  <FieldLabel htmlFor="cancel-payment-handling-penalty">
                    <Field orientation="horizontal" className="rounded-md border p-3">
                      <RadioGroupItem
                        id="cancel-payment-handling-penalty"
                        value="KEEP_PAID_AMOUNT_AS_PENALTY"
                        aria-invalid={fieldState.invalid}
                      />
                      <FieldContent>
                        <span className="text-sm font-medium">Giữ tiền đã thu làm phí hủy</span>
                        <FieldDescription>Shop không tạo phiếu hoàn tiền khi hủy đơn này.</FieldDescription>
                      </FieldContent>
                    </Field>
                  </FieldLabel>

                  <FieldLabel htmlFor="cancel-payment-handling-refund">
                    <Field
                      orientation="horizontal"
                      data-disabled={maxRefundAmount <= 0}
                      className="rounded-md border p-3"
                    >
                      <RadioGroupItem
                        id="cancel-payment-handling-refund"
                        value="REFUND_BOOKING_HOLD"
                        disabled={maxRefundAmount <= 0}
                        aria-invalid={fieldState.invalid}
                      />
                      <FieldContent>
                        <span className="text-sm font-medium">Hoàn tiền giữ lịch cho khách</span>
                        <FieldDescription>
                          Backend sẽ tạo payment record loại hoàn tiền nếu số tiền hoàn lớn hơn 0.
                        </FieldDescription>
                      </FieldContent>
                    </Field>
                  </FieldLabel>
                </RadioGroup>
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          <Controller
            control={form.control}
            name="refundAmount"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid} data-disabled={cancelOrder.isPending || !refundBookingHold}>
                <FieldLabel htmlFor={field.name}>Số tiền hoàn</FieldLabel>
                <CurrencyInput
                  id={field.name}
                  value={field.value}
                  aria-invalid={fieldState.invalid}
                  onChange={(value) => field.onChange(Math.min(value, maxRefundAmount))}
                  disabled={cancelOrder.isPending || !refundBookingHold}
                  min={0}
                />
                <FieldDescription>Chỉ nhập khi chọn hoàn tiền giữ lịch cho khách.</FieldDescription>
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
        </form>
      </ScrollArea>
    </ConfirmDialog>
  );
}

function RentalOrderDeleteConfirmDialog({
  order,
  open,
  onOpenChange,
}: {
  order: IRentalOrderListItemOut;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const deleteOrders = useDeleteRentalOrders();

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Xóa đơn thuê"
      desc={
        <div className="space-y-2">
          <RentalOrderConfirmSummary order={order} />
          <p>Thao tác này chỉ áp dụng cho đơn mới tạo hoặc đã hủy.</p>
        </div>
      }
      cancelBtnText="Đóng"
      confirmText="Xóa đơn"
      destructive
      isLoading={deleteOrders.isPending}
      handleConfirm={() => {
        deleteOrders.mutate({ rentalOrderIds: [order.id] }, { onSuccess: () => onOpenChange(false) });
      }}
    />
  );
}

export function RentalOrderDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useRentalOrders();

  const closeDialog = () => {
    setOpen(null);
    setTimeout(() => setCurrentRow(null), 300);
  };

  return (
    <>
      <RentalOrderCreateDialog
        open={open === 'create'}
        onOpenChange={(nextOpen) => (nextOpen ? setOpen('create') : closeDialog())}
      />

      {currentRow && (
        <>
          <RentalOrderDetailDialog
            key={`rental-order-detail-${currentRow.id}`}
            orderId={currentRow.id}
            open={open === 'view'}
            onOpenChange={(nextOpen) => (nextOpen ? setOpen('view') : closeDialog())}
          />
          <RentalOrderUpdateDialog
            key={`rental-order-update-${currentRow.id}`}
            orderId={currentRow.id}
            open={open === 'edit'}
            onOpenChange={(nextOpen) => (nextOpen ? setOpen('edit') : closeDialog())}
          />
          <RentalOrderPaymentDialog
            key={`rental-order-payment-${currentRow.id}`}
            orderId={currentRow.id}
            open={open === 'payment'}
            onOpenChange={(nextOpen) => (nextOpen ? setOpen('payment') : closeDialog())}
          />
          <RentalOrderHandoverDialog
            key={`rental-order-handover-${currentRow.id}`}
            orderId={currentRow.id}
            open={open === 'handover'}
            onOpenChange={(nextOpen) => (nextOpen ? setOpen('handover') : closeDialog())}
          />
          <RentalOrderCompleteDialog
            key={`rental-order-complete-${currentRow.id}`}
            orderId={currentRow.id}
            open={open === 'complete'}
            onOpenChange={(nextOpen) => (nextOpen ? setOpen('complete') : closeDialog())}
          />
          <RentalOrderRefundDialog
            key={`rental-order-refund-${currentRow.id}`}
            orderId={currentRow.id}
            open={open === 'refund'}
            onOpenChange={(nextOpen) => (nextOpen ? setOpen('refund') : closeDialog())}
          />
          <RentalOrderCancelConfirmDialog
            key={`rental-order-cancel-${currentRow.id}`}
            order={currentRow}
            open={open === 'cancel'}
            onOpenChange={(nextOpen) => (nextOpen ? setOpen('cancel') : closeDialog())}
          />
          <RentalOrderDeleteConfirmDialog
            key={`rental-order-delete-${currentRow.id}`}
            order={currentRow}
            open={open === 'delete'}
            onOpenChange={(nextOpen) => (nextOpen ? setOpen('delete') : closeDialog())}
          />
        </>
      )}
    </>
  );
}
