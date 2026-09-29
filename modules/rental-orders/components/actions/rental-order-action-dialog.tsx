'use client';

import { ApiClientError } from '@/axios';
import { CopyText } from '@/components/shared/copy-text';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { CurrencyInput } from '@/components/ui/currency-input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Field, FieldContent, FieldDescription, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { cn, formatCurrency, formatDate } from '@/lib/utils';
import { useRentalOrderActions } from '../../hooks/mutations';
import { useGetRentalOrderById } from '../../hooks/queries';
import { paymentFormSchema, type PaymentFormValues } from '../../model';
import {
  handoverStatusConfig,
  orderStatusConfig,
  rentalOrderScheduleBadgeConfig,
  returnStatusConfig,
  settlementStatusConfig,
} from '../../display-config';
import { getRentalOrderFinancialSummary, getRentalOrderNextAction, getRentalOrderOperationalBadges, type RentalOrderOperationalBadge } from '../../display-semantics';
import { formatRentalDuration, formatRentalPeriod, getRentalOrderScheduleBadge } from '../../display-utils';
import type { RentalAccessoryStatus, RentalInspectionCondition, RentalOrderDetail } from '../../model';
import { zodResolver } from '@hookform/resolvers/zod';
import { IconLoader } from '@tabler/icons-react';
import { type ReactNode, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { RentalOrderBadge } from '../status-badge';

export type RentalOrderAction = 'payment' | 'refund' | 'handover' | 'return' | 'inspection' | 'settle' | 'cancel';

function getRentalOrderActionErrorMessage(error: unknown, action: RentalOrderAction | null): string {
  if (error instanceof ApiClientError) {
    if (error.fieldErrors.some((fieldError) => fieldError.property === 'reason')) {
      return 'Vui lòng nhập lý do hủy đơn trước khi tiếp tục.';
    }

    switch (error.code) {
      case 'RENTAL_ORDER_REFUND_AMOUNT_INVALID':
        return error.message || 'Số tiền hoàn không được lớn hơn số tiền khách đã thanh toán và chưa được hoàn.';
      case 'RENTAL_ORDER_HANDOVER_PAYMENT_INSUFFICIENT':
        return 'Chưa thể bàn giao thiết bị vì khách chưa thanh toán đủ số tiền cần thu.';
      case 'RENTAL_ORDER_STATUS_TRANSITION_INVALID':
        return 'Trạng thái đơn đã thay đổi nên thao tác này không còn phù hợp. Vui lòng tải lại thông tin đơn.';
      case 'RENTAL_ORDER_NOT_FOUND':
        return 'Không tìm thấy đơn thuê. Đơn có thể đã bị xóa hoặc bạn không còn quyền truy cập.';
      case 'INCORRECT_INPUT':
        switch (action) {
          case 'cancel':
            return 'Không thể hủy đơn này vì đơn đã được hủy, đã hoàn tất hoặc đã bắt đầu cho thuê.';
          case 'payment':
            return 'Không thể ghi nhận thanh toán vì đơn không còn ở trạng thái cho phép thanh toán.';
          case 'refund':
            return 'Không thể tạo yêu cầu hoàn tiền vì đơn chưa đủ điều kiện hoặc số tiền hoàn không còn phù hợp.';
          case 'handover':
            return 'Không thể bàn giao thiết bị. Vui lòng kiểm tra trạng thái đơn, số tiền đã thu và số máy đã được phân bổ.';
          case 'return':
            return 'Không thể ghi nhận trả máy vì đơn chưa ở trạng thái đang thuê.';
          case 'inspection':
            return 'Không thể lưu biên bản kiểm tra vì đơn chưa ghi nhận trả máy hoặc dữ liệu kiểm tra chưa hợp lệ.';
          case 'settle':
            return 'Chưa thể quyết toán vì đơn vẫn còn khoản phải thu hoặc khoản tiền cần hoàn.';
          default:
            return 'Thông tin thao tác không còn phù hợp với trạng thái hiện tại của đơn.';
        }
      default:
        return error.message || 'Không thể hoàn tất thao tác. Vui lòng kiểm tra lại thông tin đơn.';
    }
  }

  if (error instanceof Error && error.message) return error.message;
  return 'Không thể hoàn tất thao tác. Vui lòng kiểm tra lại thông tin đơn.';
}

const actionTitle: Record<RentalOrderAction, string> = {
  payment: 'Ghi nhận thanh toán',
  refund: 'Tạo hoàn tiền',
  handover: 'Bàn giao thiết bị',
  return: 'Nhận trả thiết bị',
  inspection: 'Kiểm tra khi trả',
  settle: 'Quyết toán đơn thuê',
  cancel: 'Hủy đơn thuê',
};

const actionFooterClass = 'shrink-0';
const actionScrollAreaClass = 'h-[60dvh] max-h-[calc(100dvh-220px)] min-h-0';

type AccessoryDraft = {
  name: string;
  expectedQuantity: number;
  actualQuantity: number;
  status: RentalAccessoryStatus;
  note: string;
};

type InspectionDraft = {
  allocationId: string;
  serialNumber: string;
  condition: RentalInspectionCondition;
  note: string;
  accessories: AccessoryDraft[];
};

function accessoryDrafts(snapshot: unknown): AccessoryDraft[] {
  const text =
    snapshot && typeof snapshot === 'object' && !Array.isArray(snapshot) && 'text' in snapshot
      ? String(snapshot.text ?? '')
      : '';

  return text
    .split(/[,;\n]+/)
    .map((name) => name.trim())
    .filter(Boolean)
    .map((name) => ({ name, expectedQuantity: 1, actualQuantity: 1, status: 'OK' as const, note: '' }));
}

function ActionOverviewField({
  label,
  children,
  className,
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('grid min-w-0 gap-1', className)}>
      <span className="text-xs text-muted-foreground">{label}</span>
      <div className="min-w-0 text-sm font-medium">{children}</div>
    </div>
  );
}

function ActionOperationalBadge({ badge }: { badge: RentalOrderOperationalBadge }) {
  if (badge.kind === 'handover') {
    return <RentalOrderBadge config={handoverStatusConfig[badge.status]} label={badge.label} />;
  }

  if (badge.kind === 'return') {
    return <RentalOrderBadge config={returnStatusConfig[badge.status]} label={badge.label} />;
  }

  return <RentalOrderBadge config={settlementStatusConfig[badge.status]} label={badge.label} />;
}

function RentalOrderActionOverview({ order }: { order: RentalOrderDetail }) {
  const totalQuantity = order.lines.reduce((total, line) => total + line.quantity, 0);
  const financialSummary = getRentalOrderFinancialSummary(order);
  const nextAction = getRentalOrderNextAction(order);
  const operationalBadges = getRentalOrderOperationalBadges(order);
  const scheduleBadge = getRentalOrderScheduleBadge({
    status: order.status,
    startDate: order.rentalPeriod.startDate,
    endDate: order.rentalPeriod.endDate,
    isOverdue: order.isOverdue,
    overdueHours: order.overdueHours,
  });
  const scheduleConfig = scheduleBadge ? rentalOrderScheduleBadgeConfig[scheduleBadge.kind] : null;
  const productSummary = order.lines.map((line) => `${line.productName} × ${line.quantity}`).join(' · ');
  const fulfillmentLabel =
    order.fulfillment.pickupMethod === 'DELIVERY'
      ? `Giao máy${order.fulfillment.deliveryAddress ? ` · ${order.fulfillment.deliveryAddress}` : ''}`
      : 'Nhận tại cửa hàng';

  return (
    <section
      aria-label="Tổng quan đơn thuê"
      className="mb-4 grid gap-3 rounded-lg  border border-accent/60 bg-muted/10 p-3"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="grid min-w-0 gap-1">
          <div className="truncate text-sm font-semibold">{order.customerSnapshot.name}</div>
          <div className="truncate text-xs text-muted-foreground">
            {order.customerSnapshot.phone || order.customerSnapshot.email || 'Chưa có thông tin liên hệ'}
          </div>
        </div>
        <div className="flex max-w-full flex-wrap justify-end gap-1.5">
          <RentalOrderBadge config={orderStatusConfig[order.status]} />
          <RentalOrderBadge config={settlementStatusConfig[financialSummary.badgeStatus]} label={financialSummary.label} />
        </div>
      </div>

      <div className="grid gap-3 border-t border-accent/60 pt-3 sm:grid-cols-2">
        <ActionOverviewField label="Thời gian thuê">
          <div>{formatRentalPeriod(order.rentalPeriod.startDate, order.rentalPeriod.endDate)}</div>
          <div className="text-xs font-normal text-muted-foreground">
            Thời lượng: {formatRentalDuration(order.rentalPeriod.startDate, order.rentalPeriod.endDate)}
          </div>
        </ActionOverviewField>
        <ActionOverviewField label="Nhận máy & số lượng">
          <div>{fulfillmentLabel}</div>
          <div className="text-xs font-normal text-muted-foreground">
            {order.lines.length} sản phẩm · {totalQuantity} thiết bị
          </div>
        </ActionOverviewField>
      </div>

      <ActionOverviewField label="Thiết bị thuê">
        <div className="line-clamp-2 break-words font-normal">{productSummary || 'Chưa có sản phẩm'}</div>
      </ActionOverviewField>

      <div className="grid grid-cols-2 gap-3 border-t border-accent/60 pt-3 sm:grid-cols-4">
        <ActionOverviewField label="Tổng nghĩa vụ" className="sm:col-span-1">
          {formatCurrency(order.financials.totalCustomerObligation)}
        </ActionOverviewField>
        <ActionOverviewField label="Đã thu" className="sm:col-span-1">
          <span className="text-primary">{formatCurrency(order.financials.paidTotal)}</span>
        </ActionOverviewField>
        <ActionOverviewField label="Tài chính cần xử lý" className="sm:col-span-1">
          <span className={financialSummary.amount > 0 ? 'text-destructive' : undefined}>
            {financialSummary.amount > 0 ? formatCurrency(financialSummary.amount) : 'Không cần xử lý'}
          </span>
          <span className="block text-xs font-normal text-muted-foreground">{financialSummary.label}</span>
        </ActionOverviewField>
        <ActionOverviewField label="Tiền cọc" className="sm:col-span-1">
          {formatCurrency(order.financials.securityDepositTotal)}
        </ActionOverviewField>
      </div>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-accent/60 pt-3 text-xs text-muted-foreground">
        {operationalBadges.map((badge) => (
          <ActionOperationalBadge key={badge.kind} badge={badge} />
        ))}
        <span>Bước tiếp theo: {nextAction.label}</span>
        <span>Tạo lúc: {formatDate(order.createdAt, 'shortDateTime')}</span>
        {scheduleBadge && scheduleConfig ? (
          <RentalOrderBadge config={scheduleConfig} label={scheduleBadge.label} />
        ) : null}
      </div>
    </section>
  );
}

export function RentalOrderActionDialog({
  open,
  action,
  orderId,
  onOpenChange,
}: {
  open: boolean;
  action: RentalOrderAction | null;
  orderId: string | null;
  onOpenChange: (open: boolean) => void;
}) {
  const detailQuery = useGetRentalOrderById(orderId, open && Boolean(orderId));
  const order = detailQuery.data;
  const actions = useRentalOrderActions();
  const pendingRefundTotal =
    order?.refunds
      .filter((refund) => refund.status === 'PENDING' || refund.status === 'PROCESSING')
      .reduce((total, refund) => total + refund.amount, 0) ?? 0;
  const remainingRefundDue = order ? Math.max(0, order.financials.refundDue - pendingRefundTotal) : 0;
  const paymentForm = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: { amount: 0, method: 'CASH', status: 'SUCCESS', referenceCode: '', note: '' },
  });
  const [note, setNote] = useState('');
  const [amount, setAmount] = useState(0);
  const [method, setMethod] = useState<'CASH' | 'BANK_TRANSFER' | 'CARD' | 'E_WALLET' | 'OTHER'>('BANK_TRANSFER');
  const [reason, setReason] = useState('');
  const [allowRefund, setAllowRefund] = useState(false);
  const [inspectionItems, setInspectionItems] = useState<InspectionDraft[]>([]);
  const mutationByAction = {
    payment: actions.payment,
    refund: actions.refund,
    handover: actions.handover,
    return: actions.returnOrder,
    inspection: actions.inspect,
    settle: actions.settle,
    cancel: actions.cancel,
  } as const;
  const activeMutation = action ? mutationByAction[action] : undefined;

  useEffect(() => {
    if (!open || !action) return;
    activeMutation?.reset();
  }, [open, action, orderId]);

  useEffect(() => {
    if (!open || !order) return;

    setAmount(action === 'refund' ? remainingRefundDue : order.financials.refundDue || order.financials.paidTotal);
    setNote('');
    setReason('');
    setAllowRefund(false);
    setInspectionItems(
      order.lines.flatMap((line) =>
        line.allocations.map((allocation) => ({
          allocationId: allocation.id,
          serialNumber: allocation.serialNumber,
          condition: 'GOOD' as const,
          note: '',
          accessories: accessoryDrafts(line.accessoriesSnapshot),
        })),
      ),
    );
    paymentForm.reset({ amount: 0, method: 'CASH', status: 'SUCCESS', referenceCode: '', note: '' });
  }, [action, open, order, paymentForm, remainingRefundDue]);

  const pending = Boolean(activeMutation?.isPending);
  const close = () => onOpenChange(false);
  const title = action ? actionTitle[action] : 'Thao tác đơn thuê';

  const handlePayment = (values: PaymentFormValues) => {
    if (!order) return;

    actions.payment.mutate(
      {
        id: order.id,
        data: {
          amount: values.amount,
          method: values.method,
          status: values.status,
          referenceCode: values.referenceCode || undefined,
          note: values.note || undefined,
        },
      },
      { onSuccess: close },
    );
  };

  const handleSubmit = () => {
    if (!order || !action) return;

    if (action === 'refund')
      actions.refund.mutate({ id: order.id, data: { amount, method, note: note || undefined } }, { onSuccess: close });
    if (action === 'handover')
      actions.handover.mutate({ id: order.id, data: { note: note || undefined } }, { onSuccess: close });
    if (action === 'return')
      actions.returnOrder.mutate({ id: order.id, data: { note: note || undefined } }, { onSuccess: close });
    if (action === 'inspection') {
      actions.inspect.mutate(
        {
          id: order.id,
          data: {
            note: note || undefined,
            items: inspectionItems.map((item) => ({
              allocationId: item.allocationId,
              condition: item.condition,
              note: item.note || undefined,
              accessories: item.accessories.map((accessory) => ({ ...accessory, note: accessory.note || undefined })),
            })),
          },
        },
        { onSuccess: close },
      );
    }
    if (action === 'settle') actions.settle.mutate({ id: order.id, note: note || undefined }, { onSuccess: close });
    if (action === 'cancel') {
      actions.cancel.mutate(
        {
          id: order.id,
          data: { reason, allowRefund, refundAmount: allowRefund ? amount : undefined, note: note || undefined },
        },
        { onSuccess: close },
      );
    }
  };

  const currentError = activeMutation?.error;
  const currentErrorMessage = currentError ? getRentalOrderActionErrorMessage(currentError, action) : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="grid max-h-[calc(100dvh-2rem)] min-h-0 grid-rows-[auto_minmax(0,1fr)] overflow-hidden sm:max-w-xl ring-0">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {order ? (
              <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <CopyText text={String(order.code)} className="py-1 font-bold text-primary underline">
                  <span>#{order.code}</span>
                </CopyText>
              </span>
            ) : (
              'Đang tải đơn thuê…'
            )}
          </DialogDescription>
        </DialogHeader>

        {order && action === 'payment' ? (
          <form onSubmit={paymentForm.handleSubmit(handlePayment)} className="grid min-h-0 gap-4">
            <ScrollArea className={actionScrollAreaClass}>
              <div className="grid gap-4 py-1">
                <RentalOrderActionOverview order={order} />
                <Field data-invalid={Boolean(paymentForm.formState.errors.amount)}>
                  <FieldLabel htmlFor="rental-order-payment-amount">Số tiền</FieldLabel>
                  <CurrencyInput
                    id="rental-order-payment-amount"
                    value={paymentForm.watch('amount')}
                    min="0.01"
                    aria-invalid={Boolean(paymentForm.formState.errors.amount)}
                    onValueChange={(value) =>
                      paymentForm.setValue('amount', value, { shouldDirty: true, shouldValidate: true })
                    }
                  />
                  <FieldError errors={[paymentForm.formState.errors.amount]} />
                </Field>
                <Field>
                  <FieldLabel>Phương thức</FieldLabel>
                  <Select
                    value={paymentForm.watch('method')}
                    onValueChange={(value: PaymentFormValues['method']) => paymentForm.setValue('method', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CASH">Tiền mặt</SelectItem>
                      <SelectItem value="BANK_TRANSFER">Chuyển khoản</SelectItem>
                      <SelectItem value="CARD">Thẻ</SelectItem>
                      <SelectItem value="E_WALLET">Ví điện tử</SelectItem>
                      <SelectItem value="OTHER">Khác</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <Field>
                  <FieldLabel>Trạng thái giao dịch</FieldLabel>
                  <Select
                    value={paymentForm.watch('status')}
                    onValueChange={(value: PaymentFormValues['status']) => paymentForm.setValue('status', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SUCCESS">Đã thành công</SelectItem>
                      <SelectItem value="PENDING">Chờ xác nhận</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <Field>
                  <FieldLabel>Mã tham chiếu</FieldLabel>
                  <Input {...paymentForm.register('referenceCode')} />
                </Field>
                <Field>
                  <FieldLabel>Ghi chú</FieldLabel>
                  <Textarea {...paymentForm.register('note')} />
                </Field>
                {currentError ? (
              <div role="alert" className="text-sm text-destructive">
                {currentErrorMessage}
              </div>
                ) : null}
              </div>
            </ScrollArea>
            <DialogFooter className={actionFooterClass}>
              <Button type="button" variant="outline" onClick={close}>
                Đóng
              </Button>
              <Button type="submit" disabled={pending}>
                {pending ? <IconLoader data-icon="inline-start" className="animate-spin" /> : null}
                Lưu giao dịch
              </Button>
            </DialogFooter>
          </form>
        ) : null}

        {order && action !== 'payment' ? (
          <div className="grid min-h-0 gap-4">
            <ScrollArea className={actionScrollAreaClass}>
              <div className="grid gap-4 py-1">
                <RentalOrderActionOverview order={order} />

                {order && action === 'refund' ? (
                  <div className="grid gap-4">
                    <div className="rounded-lg bg-muted/30 p-3 text-sm">
                      Số tiền còn có thể tạo yêu cầu hoàn: <strong>{formatCurrency(remainingRefundDue)}</strong>
                      {pendingRefundTotal > 0 ? (
                        <div className="mt-1 text-xs text-muted-foreground">
                          Đang chờ xác nhận hoàn: {formatCurrency(pendingRefundTotal)}.
                        </div>
                      ) : null}
                    </div>
                    <Field>
                      <FieldLabel htmlFor="rental-order-refund-amount">Số tiền hoàn</FieldLabel>
                      <CurrencyInput
                        id="rental-order-refund-amount"
                        min="0.01"
                        value={amount}
                        onValueChange={setAmount}
                      />
                    </Field>
                    <Field>
                      <FieldLabel>Phương thức</FieldLabel>
                      <Select value={method} onValueChange={(value) => setMethod(value as typeof method)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="CASH">Tiền mặt</SelectItem>
                          <SelectItem value="BANK_TRANSFER">Chuyển khoản</SelectItem>
                          <SelectItem value="CARD">Thẻ</SelectItem>
                          <SelectItem value="E_WALLET">Ví điện tử</SelectItem>
                          <SelectItem value="OTHER">Khác</SelectItem>
                        </SelectContent>
                      </Select>
                    </Field>
                    <Field>
                      <FieldLabel>Ghi chú</FieldLabel>
                      <Textarea value={note} onChange={(event) => setNote(event.target.value)} />
                    </Field>
                  </div>
                ) : null}

                {order && (action === 'handover' || action === 'return' || action === 'settle') ? (
                  <div className="grid gap-4">
                    <div className="rounded-lg bg-muted/30 p-4 text-sm">
                      {action === 'handover' ? (
                        <>
                          Còn phải thu trước bàn giao:{' '}
                          <strong>{formatCurrency(order.financials.amountDueBeforeHandover)}</strong>. Chỉ bàn giao khi
                          payment thành công đủ và allocation đủ số lượng.
                        </>
                      ) : action === 'return' ? (
                        'Ghi nhận thời điểm trả máy. Sau bước này cần lập inspection return.'
                      ) : (
                        <>
                          Thanh toán: <strong>{order.settlementStatus}</strong>. Chỉ đóng đơn khi không còn khoản phải
                          thu hoặc hoàn.
                        </>
                      )}
                    </div>
                    <Field>
                      <FieldLabel>Ghi chú</FieldLabel>
                      <Textarea value={note} onChange={(event) => setNote(event.target.value)} />
                    </Field>
                  </div>
                ) : null}

                {order && action === 'inspection' ? (
                  <div className="grid gap-4">
                    {inspectionItems.map((item, index) => (
                      <div key={item.allocationId} className="grid gap-3 rounded-lg bg-muted/20 p-3">
                        <div className="font-medium">{item.serialNumber}</div>
                        <Select
                          value={item.condition}
                          onValueChange={(value: RentalInspectionCondition) =>
                            setInspectionItems((current) =>
                              current.map((entry, entryIndex) =>
                                entryIndex === index ? { ...entry, condition: value } : entry,
                              ),
                            )
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="GOOD">Tốt</SelectItem>
                            <SelectItem value="DAMAGED">Hư hỏng</SelectItem>
                            <SelectItem value="MISSING">Mất máy</SelectItem>
                            <SelectItem value="NEEDS_MAINTENANCE">Cần bảo trì</SelectItem>
                          </SelectContent>
                        </Select>
                        <Input
                          placeholder="Ghi chú tình trạng"
                          value={item.note}
                          onChange={(event) =>
                            setInspectionItems((current) =>
                              current.map((entry, entryIndex) =>
                                entryIndex === index ? { ...entry, note: event.target.value } : entry,
                              ),
                            )
                          }
                        />
                        {item.accessories.length ? (
                          <div className="grid gap-2 rounded-md bg-muted/30 p-2">
                            <div className="text-xs font-medium text-muted-foreground">Phụ kiện</div>
                            {item.accessories.map((accessory, accessoryIndex) => (
                              <div
                                key={`${item.allocationId}-${accessory.name}-${accessoryIndex}`}
                                className="grid gap-2 sm:grid-cols-[1fr_90px_150px]"
                              >
                                <div className="text-sm">
                                  {accessory.name}{' '}
                                  <span className="text-xs text-muted-foreground">
                                    (cần {accessory.expectedQuantity})
                                  </span>
                                </div>
                                <Input
                                  type="number"
                                  min="0"
                                  value={accessory.actualQuantity}
                                  onChange={(event) =>
                                    setInspectionItems((current) =>
                                      current.map((entry, entryIndex) =>
                                        entryIndex !== index
                                          ? entry
                                          : {
                                              ...entry,
                                              accessories: entry.accessories.map((itemAccessory, itemAccessoryIndex) =>
                                                itemAccessoryIndex === accessoryIndex
                                                  ? { ...itemAccessory, actualQuantity: Number(event.target.value) }
                                                  : itemAccessory,
                                              ),
                                            },
                                      ),
                                    )
                                  }
                                />
                                <Select
                                  value={accessory.status}
                                  onValueChange={(value: RentalAccessoryStatus) =>
                                    setInspectionItems((current) =>
                                      current.map((entry, entryIndex) =>
                                        entryIndex !== index
                                          ? entry
                                          : {
                                              ...entry,
                                              accessories: entry.accessories.map((itemAccessory, itemAccessoryIndex) =>
                                                itemAccessoryIndex === accessoryIndex
                                                  ? { ...itemAccessory, status: value }
                                                  : itemAccessory,
                                              ),
                                            },
                                      ),
                                    )
                                  }
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="OK">Đủ/tốt</SelectItem>
                                    <SelectItem value="MISSING">Thiếu</SelectItem>
                                    <SelectItem value="DAMAGED">Hư hỏng</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    ))}
                    <Field>
                      <FieldLabel>Ghi chú biên bản</FieldLabel>
                      <Textarea value={note} onChange={(event) => setNote(event.target.value)} />
                    </Field>
                  </div>
                ) : null}

                {order && action === 'cancel' ? (
                  <div className="grid gap-4">
                    <Field>
                      <FieldLabel>Lý do hủy</FieldLabel>
                      <Textarea
                        value={reason}
                        onChange={(event) => setReason(event.target.value)}
                        placeholder="Bắt buộc"
                        required
                      />
                    </Field>
                    <Field orientation="horizontal" className="items-start">
                      <Checkbox
                        id="rental-order-allow-refund"
                        checked={allowRefund}
                        onCheckedChange={(checked) => setAllowRefund(checked === true)}
                      />
                      <FieldContent>
                        <FieldLabel htmlFor="rental-order-allow-refund">Cho phép hoàn tiền</FieldLabel>
                        <FieldDescription>
                          Bật nếu khoản đã thu được phép hoàn theo lý do hủy. Số tiền thực tế sẽ được backend kiểm tra
                          theo chính sách.
                        </FieldDescription>
                      </FieldContent>
                    </Field>
                    {allowRefund ? (
                      <Field>
                        <FieldLabel htmlFor="rental-order-cancel-refund-amount">Số tiền hoàn đề xuất</FieldLabel>
                        <CurrencyInput
                          id="rental-order-cancel-refund-amount"
                          min="0"
                          value={amount}
                          onValueChange={setAmount}
                        />
                        <FieldDescription>Đã thu: {formatCurrency(order.financials.paidTotal)}.</FieldDescription>
                      </Field>
                    ) : null}
                    <Field>
                      <FieldLabel>Ghi chú</FieldLabel>
                      <Textarea value={note} onChange={(event) => setNote(event.target.value)} />
                    </Field>
                  </div>
                ) : null}

                {currentError ? (
                  <div role="alert" className="text-sm text-destructive">
                    {currentErrorMessage}
                  </div>
                ) : null}
              </div>
            </ScrollArea>

            {action === 'refund' ? (
              <ActionFooter
                onCancel={close}
                onConfirm={handleSubmit}
                pending={pending}
                disabled={remainingRefundDue <= 0 || amount <= 0}
                label="Tạo yêu cầu hoàn"
              />
            ) : null}
            {action === 'handover' || action === 'return' || action === 'settle' ? (
              <ActionFooter
                onCancel={close}
                onConfirm={handleSubmit}
                pending={pending}
                label={action === 'handover' ? 'Bàn giao' : action === 'return' ? 'Nhận trả máy' : 'Đóng đơn'}
              />
            ) : null}
            {action === 'inspection' ? (
              <ActionFooter onCancel={close} onConfirm={handleSubmit} pending={pending} label="Lưu kiểm tra" />
            ) : null}
            {action === 'cancel' ? (
              <ActionFooter
                onCancel={close}
                onConfirm={handleSubmit}
                pending={pending}
                disabled={!reason.trim()}
                label="Hủy đơn"
                destructive
              />
            ) : null}
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function ActionFooter({
  onCancel,
  onConfirm,
  pending,
  disabled = false,
  label,
  destructive = false,
}: {
  onCancel: () => void;
  onConfirm: () => void;
  pending: boolean;
  disabled?: boolean;
  label: string;
  destructive?: boolean;
}) {
  return (
    <DialogFooter className={actionFooterClass}>
      <Button type="button" variant="outline" onClick={onCancel}>
        Đóng
      </Button>
      <Button type="button" variant={destructive ? 'destructive' : 'default'} onClick={onConfirm} disabled={pending || disabled}>
        {pending ? <IconLoader data-icon="inline-start" className="animate-spin" /> : null}
        {label}
      </Button>
    </DialogFooter>
  );
}
