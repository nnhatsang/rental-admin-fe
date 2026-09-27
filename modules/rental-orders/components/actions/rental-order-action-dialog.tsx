'use client';

import { CopyText } from '@/components/shared/copy-text';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { CurrencyInput } from '@/components/ui/currency-input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Field, FieldContent, FieldDescription, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
import { formatRentalDuration, formatRentalPeriod, getRentalOrderScheduleBadge } from '../../display-utils';
import type { RentalAccessoryStatus, RentalInspectionCondition, RentalOrderDetail } from '../../model';
import { zodResolver } from '@hookform/resolvers/zod';
import { IconLoader } from '@tabler/icons-react';
import { type ReactNode, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { RentalOrderBadge } from '../status-badge';

export type RentalOrderAction = 'payment' | 'refund' | 'handover' | 'return' | 'inspection' | 'settle' | 'cancel';

const actionTitle: Record<RentalOrderAction, string> = {
  payment: 'Ghi nhận thanh toán',
  refund: 'Tạo hoàn tiền',
  handover: 'Bàn giao thiết bị',
  return: 'Nhận trả thiết bị',
  inspection: 'Kiểm tra khi trả',
  settle: 'Quyết toán đơn thuê',
  cancel: 'Hủy đơn thuê',
};

const actionFooterClass = '-mx-4 -mb-4 w-[calc(100%+2rem)] rounded-b-xl p-4';

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
  const text = snapshot && typeof snapshot === 'object' && !Array.isArray(snapshot) && 'text' in snapshot ? String(snapshot.text ?? '') : '';

  return text
    .split(/[,;\n]+/)
    .map((name) => name.trim())
    .filter(Boolean)
    .map((name) => ({ name, expectedQuantity: 1, actualQuantity: 1, status: 'OK' as const, note: '' }));
}

function ActionOverviewField({ label, children, className }: { label: string; children: ReactNode; className?: string }) {
  return (
    <div className={cn('grid min-w-0 gap-1', className)}>
      <span className="text-xs text-muted-foreground">{label}</span>
      <div className="min-w-0 text-sm font-medium">{children}</div>
    </div>
  );
}

function RentalOrderActionOverview({ order }: { order: RentalOrderDetail }) {
  const totalQuantity = order.lines.reduce((total, line) => total + line.quantity, 0);
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
          <RentalOrderBadge config={settlementStatusConfig[order.settlementStatus]} />
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
        <ActionOverviewField label="Còn trước giao" className="sm:col-span-1">
          <span className={order.financials.amountDueBeforeHandover > 0 ? 'text-destructive' : undefined}>
            {formatCurrency(order.financials.amountDueBeforeHandover)}
          </span>
        </ActionOverviewField>
        <ActionOverviewField label="Tiền cọc" className="sm:col-span-1">
          {formatCurrency(order.financials.securityDepositTotal)}
        </ActionOverviewField>
      </div>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-accent/60 pt-3 text-xs text-muted-foreground">
        <span>Bàn giao: {handoverStatusConfig[order.handoverStatus].label}</span>
        <span>Trả máy: {returnStatusConfig[order.returnStatus].label}</span>
        <span>Tạo lúc: {formatDate(order.createdAt, 'shortDateTime')}</span>
        {scheduleBadge && scheduleConfig ? <RentalOrderBadge config={scheduleConfig} label={scheduleBadge.label} /> : null}
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

  useEffect(() => {
    if (!open || !order) return;

    setAmount(order.financials.refundDue || order.financials.paidTotal);
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
  }, [open, order, paymentForm]);

  const pending = Object.values(actions).some((mutation) => mutation.isPending);
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

    if (action === 'refund') actions.refund.mutate({ id: order.id, data: { amount, method, note: note || undefined } }, { onSuccess: close });
    if (action === 'handover') actions.handover.mutate({ id: order.id, data: { note: note || undefined } }, { onSuccess: close });
    if (action === 'return') actions.returnOrder.mutate({ id: order.id, data: { note: note || undefined } }, { onSuccess: close });
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

  const currentError = useMemo(() => Object.values(actions).find((mutation) => mutation.error)?.error, [actions]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl ring-0">
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

        {order ? <RentalOrderActionOverview order={order} /> : null}

        {order && action === 'payment' ? (
          <form onSubmit={paymentForm.handleSubmit(handlePayment)} className="grid gap-4">
            <Field data-invalid={Boolean(paymentForm.formState.errors.amount)}>
              <FieldLabel htmlFor="rental-order-payment-amount">Số tiền</FieldLabel>
              <CurrencyInput
                id="rental-order-payment-amount"
                value={paymentForm.watch('amount')}
                min="0.01"
                aria-invalid={Boolean(paymentForm.formState.errors.amount)}
                onValueChange={(value) => paymentForm.setValue('amount', value, { shouldDirty: true, shouldValidate: true })}
              />
              <FieldError errors={[paymentForm.formState.errors.amount]} />
            </Field>
            <Field>
              <FieldLabel>Phương thức</FieldLabel>
              <Select value={paymentForm.watch('method')} onValueChange={(value: PaymentFormValues['method']) => paymentForm.setValue('method', value)}>
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
              <Select value={paymentForm.watch('status')} onValueChange={(value: PaymentFormValues['status']) => paymentForm.setValue('status', value)}>
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

        {order && action === 'refund' ? (
          <div className="grid gap-4">
            <div className="rounded-lg bg-muted/30 p-3 text-sm">
              Số tiền có thể hoàn: <strong>{formatCurrency(order.financials.refundDue)}</strong>
            </div>
            <Field>
              <FieldLabel htmlFor="rental-order-refund-amount">Số tiền hoàn</FieldLabel>
              <CurrencyInput id="rental-order-refund-amount" min="0.01" value={amount} onValueChange={setAmount} />
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
            <ActionFooter onCancel={close} onConfirm={handleSubmit} pending={pending} label="Tạo yêu cầu hoàn" />
          </div>
        ) : null}

        {order && (action === 'handover' || action === 'return' || action === 'settle') ? (
          <div className="grid gap-4">
            <div className="rounded-lg bg-muted/30 p-4 text-sm">
              {action === 'handover' ? (
                <>
                  Còn phải thu trước bàn giao: <strong>{formatCurrency(order.financials.amountDueBeforeHandover)}</strong>. Chỉ bàn giao khi payment thành công đủ và allocation đủ số lượng.
                </>
              ) : action === 'return' ? (
                'Ghi nhận thời điểm trả máy. Sau bước này cần lập inspection return.'
              ) : (
                <>
                  Thanh toán: <strong>{order.settlementStatus}</strong>. Chỉ đóng đơn khi không còn khoản phải thu hoặc hoàn.
                </>
              )}
            </div>
            <Field>
              <FieldLabel>Ghi chú</FieldLabel>
              <Textarea value={note} onChange={(event) => setNote(event.target.value)} />
            </Field>
            <ActionFooter
              onCancel={close}
              onConfirm={handleSubmit}
              pending={pending}
              label={action === 'handover' ? 'Bàn giao' : action === 'return' ? 'Nhận trả máy' : 'Đóng đơn'}
            />
          </div>
        ) : null}

        {order && action === 'inspection' ? (
          <div className="grid max-h-[55dvh] gap-4 overflow-y-auto">
            {inspectionItems.map((item, index) => (
              <div key={item.allocationId} className="grid gap-3 rounded-lg bg-muted/20 p-3">
                <div className="font-medium">{item.serialNumber}</div>
                <Select
                  value={item.condition}
                  onValueChange={(value: RentalInspectionCondition) =>
                    setInspectionItems((current) => current.map((entry, entryIndex) => (entryIndex === index ? { ...entry, condition: value } : entry)))
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
                    setInspectionItems((current) => current.map((entry, entryIndex) => (entryIndex === index ? { ...entry, note: event.target.value } : entry)))
                  }
                />
                {item.accessories.length ? (
                  <div className="grid gap-2 rounded-md bg-muted/30 p-2">
                    <div className="text-xs font-medium text-muted-foreground">Phụ kiện</div>
                    {item.accessories.map((accessory, accessoryIndex) => (
                      <div key={`${item.allocationId}-${accessory.name}-${accessoryIndex}`} className="grid gap-2 sm:grid-cols-[1fr_90px_150px]">
                        <div className="text-sm">
                          {accessory.name}{' '}
                          <span className="text-xs text-muted-foreground">(cần {accessory.expectedQuantity})</span>
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
                                        itemAccessoryIndex === accessoryIndex ? { ...itemAccessory, status: value } : itemAccessory,
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
            <ActionFooter onCancel={close} onConfirm={handleSubmit} pending={pending} label="Lưu kiểm tra" />
          </div>
        ) : null}

        {order && action === 'cancel' ? (
          <div className="grid gap-4">
            <Field>
              <FieldLabel>Lý do hủy</FieldLabel>
              <Textarea value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Bắt buộc" />
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
                  Bật nếu khoản đã thu được phép hoàn theo lý do hủy. Số tiền thực tế sẽ được backend kiểm tra theo chính sách.
                </FieldDescription>
              </FieldContent>
            </Field>
            {allowRefund ? (
              <Field>
                <FieldLabel htmlFor="rental-order-cancel-refund-amount">Số tiền hoàn đề xuất</FieldLabel>
                <CurrencyInput id="rental-order-cancel-refund-amount" min="0" value={amount} onValueChange={setAmount} />
                <FieldDescription>Đã thu: {formatCurrency(order.financials.paidTotal)}.</FieldDescription>
              </Field>
            ) : null}
            <Field>
              <FieldLabel>Ghi chú</FieldLabel>
              <Textarea value={note} onChange={(event) => setNote(event.target.value)} />
            </Field>
            <ActionFooter onCancel={close} onConfirm={handleSubmit} pending={pending} label="Hủy đơn" destructive />
          </div>
        ) : null}

        {currentError ? <div className="text-sm text-destructive">Thao tác chưa thành công. Backend đã từ chối yêu cầu theo trạng thái hoặc số tiền hiện tại.</div> : null}
      </DialogContent>
    </Dialog>
  );
}

function ActionFooter({
  onCancel,
  onConfirm,
  pending,
  label,
  destructive = false,
}: {
  onCancel: () => void;
  onConfirm: () => void;
  pending: boolean;
  label: string;
  destructive?: boolean;
}) {
  return (
    <DialogFooter className={actionFooterClass}>
      <Button type="button" variant="outline" onClick={onCancel}>
        Đóng
      </Button>
      <Button type="button" variant={destructive ? 'destructive' : 'default'} onClick={onConfirm} disabled={pending}>
        {pending ? <IconLoader data-icon="inline-start" className="animate-spin" /> : null}
        {label}
      </Button>
    </DialogFooter>
  );
}
