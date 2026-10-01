'use client';

import { DateTimeRangePicker, type DateTimeRange } from '@/components/shared/date-time-range-picker';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CopyText } from '@/components/shared/copy-text';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel, FieldSeparator } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Spinner } from '@/components/ui/spinner';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { cn, formatCurrency, parseDate, toIso } from '@/lib/utils';
import type { ProductOption } from '@/modules/asset-units/product-combobox';
import { zodResolver } from '@hookform/resolvers/zod';
import { type ReactNode, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { orderStatusConfig } from '../../display-config';
import { formatRentalDuration, formatRentalPeriod } from '../../display-utils';
import { useCreateRentalQuote, useUpdateRentalOrder } from '../../hooks/mutations';
import { useGetRentalOrderById } from '../../hooks/queries';
import type { RentalOrderDetail, RentalOrderQuote } from '../../model';
import { RentalOrderUpdateItemsField } from './rental-order-update-items-field';
import { RentalOrderBadge } from '../status-badge';
import { type UpdateQuoteFormValues, updateQuoteFormSchema } from '../../model';

function areRentalItemsEqual(left: UpdateQuoteFormValues['items'], right: UpdateQuoteFormValues['items']) {
  if (left.length !== right.length) return false;

  const rightByProductId = new Map(right.map((item) => [item.productId, item]));

  return left.every((item) => {
    const rightItem = rightByProductId.get(item.productId);
    return rightItem?.quantity === item.quantity && (rightItem?.note ?? '') === (item.note ?? '');
  });
}

const updateSurfaceClass = 'border-0 bg-muted/60 shadow-none ring-0';

function toCustomerSnapshotInput(snapshot: UpdateQuoteFormValues['customerSnapshot']) {
  return {
    name: snapshot.name.trim(),
    phone: snapshot.phone.trim() || null,
    email: snapshot.email.trim() || null,
    address: snapshot.address.trim() || null,
    identityNumber: snapshot.identityNumber.trim() || null,
    socialContact: snapshot.socialContact.trim(),
  };
}

function UpdateDialogLoading() {
  return (
    <div className="grid gap-4 px-6 py-5">
      <div className="grid gap-3 md:grid-cols-2">
        <Skeleton className="h-20" />
        <Skeleton className="h-20" />
      </div>
      <Skeleton className="h-36" />
      <Skeleton className="h-28" />
    </div>
  );
}

function QuoteSummary({ quote }: { quote: RentalOrderQuote }) {
  const isAvailable = quote.availability.available;

  return (
    <Card className={updateSurfaceClass}>
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="grid gap-1">
            <CardTitle>Kiểm tra quote trước khi lưu</CardTitle>
            <CardDescription>
              Quote {quote.quoteId} · hết hạn {new Date(quote.expiresAt).toLocaleString('vi-VN')}
            </CardDescription>
          </div>
          <Badge variant={isAvailable ? 'secondary' : 'destructive'}>
            {isAvailable ? 'Đủ máy trống' : 'Không đủ máy trống'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid gap-0 divide-y divide-border/60">
          {quote.lines.map((line) => (
            <div
              key={line.productId}
              className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
            >
              <span className="font-medium">
                {line.productName} · {line.sku} × {line.quantity}
              </span>
              <span className="tabular-nums">{formatCurrency(line.lineRentalTotal)}</span>
            </div>
          ))}
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <QuoteMetric label="Tiền thuê" value={quote.summary.rentalFeeTotal} />
          <QuoteMetric label="Giữ lịch" value={quote.summary.bookingHoldTotal} />
          <QuoteMetric label="Tiền cọc" value={quote.summary.securityDepositTotal} />
          <QuoteMetric label="Tổng nghĩa vụ" value={quote.summary.totalCustomerObligation} />
          <QuoteMetric label="Còn phải thu trước bàn giao" value={quote.summary.amountDueBeforeHandover} />
        </div>

        {!isAvailable ? (
          <Alert variant="destructive">
            <AlertTitle>Không thể cập nhật theo lịch này</AlertTitle>
            <AlertDescription>
              <div className="grid gap-1">
                {quote.availability.conflicts.length ? (
                  quote.availability.conflicts.map((conflict) => (
                    <span key={conflict.productId}>
                      <strong>{conflict.productName}</strong>: {conflict.message} ({conflict.availableQuantity}/
                      {conflict.requestedQuantity} máy trống)
                    </span>
                  ))
                ) : (
                  <span>Sản phẩm không còn đủ máy trống.</span>
                )}
              </div>
            </AlertDescription>
          </Alert>
        ) : null}
      </CardContent>
    </Card>
  );
}

function QuoteMetric({ label, value }: { label: string; value: number }) {
  return (
    <div className="grid gap-1 rounded-lg bg-background/50 p-3">
      <span className="text-xs text-muted-foreground">{label}</span>
      <strong>{formatCurrency(value)}</strong>
    </div>
  );
}

function OverviewMetric({ label, value, className }: { label: string; value: ReactNode; className?: string }) {
  return (
    <div className={cn('grid min-w-0 gap-1', className)}>
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="break-words text-sm font-medium tabular-nums">{value}</span>
    </div>
  );
}

function UpdateOrderOverview({
  order,
  startDate,
  endDate,
  hasRentalChanges,
  hasQuote,
}: {
  order: RentalOrderDetail;
  startDate: string;
  endDate: string;
  hasRentalChanges: boolean;
  hasQuote: boolean;
}) {
  const period = formatRentalPeriod(startDate, endDate);
  const duration = formatRentalDuration(startDate, endDate);
  const quoteStatus = hasQuote ? 'Quote mới đã sẵn sàng' : hasRentalChanges ? 'Cần tính quote lại' : 'Chưa thay đổi lịch hoặc máy';

  return (
    <section className="grid gap-4 rounded-xl bg-muted/20 p-4" aria-label="Tổng quan đơn thuê">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="grid min-w-0 gap-1">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Tổng quan đơn thuê</span>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="truncate font-medium">{order.customerSnapshot.name || 'Chưa có tên khách hàng'}</span>
            <span className="text-sm text-muted-foreground">· #{order.code}</span>
          </div>
          <span className="text-xs text-muted-foreground">{period}</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <RentalOrderBadge config={orderStatusConfig[order.status]} />
          <Badge variant={hasQuote ? 'secondary' : hasRentalChanges ? 'outline' : 'secondary'}>{quoteStatus}</Badge>
        </div>
      </div>

      <Separator />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <OverviewMetric label="Thời lượng thuê" value={duration} />
        <OverviewMetric label="Tiền thuê hiện tại" value={formatCurrency(order.financials.rentalFeeTotal)} />
        <OverviewMetric label="Giữ lịch" value={formatCurrency(order.financials.bookingHoldTotal)} />
        <OverviewMetric label="Tiền cọc" value={formatCurrency(order.financials.securityDepositTotal)} />
        <OverviewMetric label="Còn phải thu trước bàn giao" value={formatCurrency(order.financials.amountDueBeforeHandover)} />
      </div>
    </section>
  );
}

export function UpdateRentalOrderDialog({
  open,
  orderId,
  orderCode,
  onOpenChange,
}: {
  open: boolean;
  orderId: string | null;
  orderCode?: string;
  onOpenChange: (open: boolean) => void;
}) {
  const orderQuery = useGetRentalOrderById(orderId, open && Boolean(orderId));
  const order = orderQuery.data;
  const displayOrderCode = order?.code ?? orderCode;
  const [quote, setQuote] = useState<RentalOrderQuote | null>(null);
  const [dateRangeOpen, setDateRangeOpen] = useState(false);
  const [note, setNote] = useState('');
  const [internalNote, setInternalNote] = useState('');
  const [initialNotes, setInitialNotes] = useState({ customerNote: '', internalNote: '' });
  const [portalContainer, setPortalContainer] = useState<HTMLDivElement | null>(null);
  const form = useForm<UpdateQuoteFormValues>({
    resolver: zodResolver(updateQuoteFormSchema),
    defaultValues: {
      customerId: '',
      startDate: '',
      endDate: '',
      pickupMethod: 'PICKUP_AT_STORE',
      deliveryAddress: '',
      items: [],
      customerSnapshot: {
        name: '',
        phone: '',
        email: '',
        address: '',
        identityNumber: '',
        socialContact: '',
      },
    },
  });
  const { startDate, endDate, items, pickupMethod } = form.watch();
  const { dirtyFields } = form.formState;
  const initialItems = useMemo<UpdateQuoteFormValues['items']>(
    () =>
      order?.lines.map((line) => ({
        productId: line.productId,
        quantity: line.quantity,
        note: line.note ?? undefined,
      })) ?? [],
    [order?.lines],
  );
  const hasItemChanges = useMemo(() => !areRentalItemsEqual(items, initialItems), [initialItems, items]);
  const hasRentalChanges = Boolean(
    dirtyFields.startDate ||
    dirtyFields.endDate ||
    dirtyFields.pickupMethod ||
    dirtyFields.deliveryAddress ||
    hasItemChanges,
  );
  const hasCustomerSnapshotChanges = Boolean(
    dirtyFields.customerSnapshot?.name ||
    dirtyFields.customerSnapshot?.phone ||
    dirtyFields.customerSnapshot?.email ||
    dirtyFields.customerSnapshot?.address ||
    dirtyFields.customerSnapshot?.identityNumber ||
    dirtyFields.customerSnapshot?.socialContact,
  );
  const hasNoteChanges = note !== initialNotes.customerNote || internalNote !== initialNotes.internalNote;
  const hasChanges = hasRentalChanges || hasCustomerSnapshotChanges || hasNoteChanges;
  const dateRange = useMemo<DateTimeRange>(
    () => ({ from: parseDate(startDate), to: parseDate(endDate) }),
    [endDate, startDate],
  );
  const initialProducts = useMemo<ProductOption[]>(
    () =>
      order?.lines.map((line) => ({
        id: line.productId,
        name: line.productName,
        sku: line.sku,
        assetUnitCount: line.assetUnitCount,
        rentalPrice: line.unitRentalFee,
      })) ?? [],
    [order?.lines],
  );
  const quoteMutation = useCreateRentalQuote();
  const updateMutation = useUpdateRentalOrder();
  const canEdit = order?.status === 'CREATED';

  useEffect(() => {
    if (!open || !order) return;

    form.reset({
      customerId: order.customerId,
      startDate: order.rentalPeriod.startDate,
      endDate: order.rentalPeriod.endDate,
      pickupMethod: order.fulfillment.pickupMethod,
      deliveryAddress: order.fulfillment.deliveryAddress ?? '',
      items: order.lines.map((line) => ({
        productId: line.productId,
        quantity: line.quantity,
        note: line.note ?? undefined,
      })),
      customerSnapshot: {
        name: order.customerSnapshot.name,
        phone: order.customerSnapshot.phone ?? '',
        email: order.customerSnapshot.email ?? '',
        address: order.customerSnapshot.address ?? '',
        identityNumber: order.customerSnapshot.identityNumber ?? '',
        socialContact: order.customerSnapshot.socialContact ?? '',
      },
    });
    setNote(order.notes.customerNote ?? '');
    setInternalNote(order.notes.internalNote ?? '');
    setInitialNotes({
      customerNote: order.notes.customerNote ?? '',
      internalNote: order.notes.internalNote ?? '',
    });
    setQuote(null);
  }, [form, open, order]);

  useEffect(() => {
    if (open) return;

    form.reset();
    setQuote(null);
    setDateRangeOpen(false);
    setNote('');
    setInternalNote('');
    setInitialNotes({ customerNote: '', internalNote: '' });
  }, [form, open]);

  const invalidateQuote = () => setQuote(null);

  const handleDateRangeUpdate = ({ range }: { range: DateTimeRange }) => {
    form.setValue('startDate', range.from ? range.from.toISOString() : '', {
      shouldDirty: true,
      shouldValidate: true,
    });
    form.setValue('endDate', range.to ? range.to.toISOString() : '', {
      shouldDirty: true,
      shouldValidate: true,
    });
    invalidateQuote();
  };

  const handleItemsChange = (nextItems: UpdateQuoteFormValues['items']) => {
    form.setValue('items', nextItems, { shouldDirty: true, shouldValidate: true });
    invalidateQuote();
  };

  const submitQuote = (values: UpdateQuoteFormValues) => {
    const { customerSnapshot: _customerSnapshot, ...quoteValues } = values;
    quoteMutation.mutate(
      {
        ...quoteValues,
        startDate: toIso(quoteValues.startDate),
        endDate: toIso(quoteValues.endDate),
        excludeOrderId: orderId ?? undefined,
      },
      { onSuccess: setQuote },
    );
  };

  const confirmUpdate = (values: UpdateQuoteFormValues) => {
    if (!orderId || (hasRentalChanges && (!quote || !quote.availability.available))) return;

    updateMutation.mutate(
      {
        id: orderId,
        data: {
          ...(hasRentalChanges && quote ? { quoteId: quote.quoteId } : {}),
          customerSnapshot: toCustomerSnapshotInput(values.customerSnapshot),
          note: note.trim() || null,
          internalNote: internalNote.trim() || null,
        },
      },
      { onSuccess: () => onOpenChange(false) },
    );
  };

  const handleFormSubmit = form.handleSubmit((values) => {
    if (hasRentalChanges && !quote?.availability.available) {
      submitQuote(values);
      return;
    }
    confirmUpdate(values);
  });

  const deliveryAddressField = form.register('deliveryAddress');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-6xl">
        <div ref={setPortalContainer} className="pointer-events-none absolute inset-0" />
        <DialogHeader>
          <DialogTitle className="flex flex-wrap items-center gap-2">
            <span>Sửa đơn thuê</span>
            {displayOrderCode ? (
              <CopyText text={String(displayOrderCode)} className="py-1 font-bold text-primary underline">
                <span>#{displayOrderCode}</span>
              </CopyText>
            ) : null}
          </DialogTitle>
          <DialogDescription>
            {order ? (
              <>
                <span>{order.code} · snapshot khách được lưu riêng trên đơn; lịch và sản phẩm sẽ được quote lại.</span>
                <span className="block text-xs">
                  {formatRentalPeriod(startDate, endDate)} · {formatRentalDuration(startDate, endDate)} · Tiền thuê hiện tại{' '}
                  {formatCurrency(order.financials.rentalFeeTotal)}
                </span>
              </>
            ) : displayOrderCode ? (
              `#${displayOrderCode} · đang tải thông tin đơn thuê…`
            ) : (
              'Đang tải thông tin đơn thuê…'
            )}
          </DialogDescription>
        </DialogHeader>

        {orderQuery.isError ? (
          <Alert variant="destructive" className="mt-5">
            <AlertTitle>Không tải được đơn thuê</AlertTitle>
            <AlertDescription>Vui lòng đóng dialog và thử mở lại.</AlertDescription>
          </Alert>
        ) : order ? (
          <form id="rental-order-update-form" onSubmit={handleFormSubmit}>
              <ScrollArea className="h-[60dvh] max-h-[calc(100dvh-220px)]">
                <div className="py-2">
                  <FieldGroup className="gap-4">
                    <UpdateOrderOverview
                      order={order}
                      startDate={startDate}
                      endDate={endDate}
                      hasRentalChanges={hasRentalChanges}
                      hasQuote={Boolean(quote && hasRentalChanges)}
                    />

                    {!canEdit ? (
                      <Alert variant="destructive">
                        <AlertTitle>Đơn này không còn ở trạng thái có thể sửa</AlertTitle>
                        <AlertDescription>
                          Chỉ đơn mới tạo mới được thay đổi thông tin thuê và tính quote lại.
                        </AlertDescription>
                      </Alert>
                    ) : null}

                    <Card className={updateSurfaceClass}>
                      <CardHeader>
                        <CardTitle>Thông tin khách trên đơn</CardTitle>
                        <CardDescription>
                          Thông tin khách hàng đặt có thể chỉnh sửa và lịch sử khách hàng không thay đổi.
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="grid gap-4 md:grid-cols-3">
                        <Field data-invalid={Boolean(form.formState.errors.customerSnapshot?.name)}>
                          <FieldLabel htmlFor="update-rental-order-customer-name">Họ tên</FieldLabel>
                          <Input
                            id="update-rental-order-customer-name"
                            placeholder="Nhập họ tên khách hàng"
                            disabled={!canEdit}
                            aria-invalid={Boolean(form.formState.errors.customerSnapshot?.name)}
                            {...form.register('customerSnapshot.name')}
                          />
                          <FieldError errors={[form.formState.errors.customerSnapshot?.name]} />
                        </Field>
                        <Field data-invalid={Boolean(form.formState.errors.customerSnapshot?.phone)}>
                          <FieldLabel htmlFor="update-rental-order-customer-phone">Số điện thoại</FieldLabel>
                          <Input
                            id="update-rental-order-customer-phone"
                            placeholder="0900000000"
                            disabled={!canEdit}
                            aria-invalid={Boolean(form.formState.errors.customerSnapshot?.phone)}
                            {...form.register('customerSnapshot.phone')}
                          />
                          <FieldError errors={[form.formState.errors.customerSnapshot?.phone]} />
                        </Field>
                        <Field data-invalid={Boolean(form.formState.errors.customerSnapshot?.email)}>
                          <FieldLabel htmlFor="update-rental-order-customer-email">Email</FieldLabel>
                          <Input
                            id="update-rental-order-customer-email"
                            type="email"
                            placeholder="email@example.com"
                            disabled={!canEdit}
                            aria-invalid={Boolean(form.formState.errors.customerSnapshot?.email)}
                            {...form.register('customerSnapshot.email')}
                          />
                          <FieldError errors={[form.formState.errors.customerSnapshot?.email]} />
                        </Field>
                        <Field data-invalid={Boolean(form.formState.errors.customerSnapshot?.socialContact)}>
                          <FieldLabel htmlFor="update-rental-order-customer-social-contact">
                            Liên hệ mạng xã hội
                          </FieldLabel>
                          <Input
                            id="update-rental-order-customer-social-contact"
                            placeholder="zalo.me/0900000000"
                            disabled={!canEdit}
                            aria-invalid={Boolean(form.formState.errors.customerSnapshot?.socialContact)}
                            {...form.register('customerSnapshot.socialContact')}
                          />
                          <FieldError errors={[form.formState.errors.customerSnapshot?.socialContact]} />
                        </Field>
                        <Field data-invalid={Boolean(form.formState.errors.customerSnapshot?.identityNumber)}>
                          <FieldLabel htmlFor="update-rental-order-customer-identity">CCCD/Giấy tờ</FieldLabel>
                          <Input
                            id="update-rental-order-customer-identity"
                            placeholder="Nhập số giấy tờ"
                            disabled={!canEdit}
                            aria-invalid={Boolean(form.formState.errors.customerSnapshot?.identityNumber)}
                            {...form.register('customerSnapshot.identityNumber')}
                          />
                          <FieldError errors={[form.formState.errors.customerSnapshot?.identityNumber]} />
                        </Field>
                        <Field className="md:col-span-3">
                          <FieldLabel htmlFor="update-rental-order-customer-address">Địa chỉ khách hàng</FieldLabel>
                          <Textarea
                            id="update-rental-order-customer-address"
                            placeholder="Nhập địa chỉ khách hàng"
                            disabled={!canEdit}
                            {...form.register('customerSnapshot.address')}
                          />
                        </Field>
                      </CardContent>
                    </Card>

                    <Card className={updateSurfaceClass}>
                      <CardHeader>
                        <CardTitle>Lịch thuê & nhận hàng</CardTitle>
                        <CardDescription>
                          {hasRentalChanges
                            ? 'Thay đổi lịch, sản phẩm hoặc hình thức nhận sẽ yêu cầu quote lại để kiểm tra máy trống và chi phí.'
                            : 'Kiểm tra nhanh thời lượng thuê và thông tin nhận máy trước khi lưu.'}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <FieldGroup className="gap-4">
                          <Field data-invalid={Boolean(form.formState.errors.startDate || form.formState.errors.endDate)}>
                            <FieldLabel htmlFor="update-rental-order-period">Khung thời gian thuê</FieldLabel>
                            <DateTimeRangePicker
                              id="update-rental-order-period"
                              value={dateRange}
                              className="w-full"
                              updateMode="manual"
                              enableTime
                              allowPastDates={false}
                              open={dateRangeOpen}
                              setOpen={setDateRangeOpen}
                              onUpdate={handleDateRangeUpdate}
                              portalContainer={portalContainer}
                            />
                            <FieldDescription className="flex flex-wrap items-center gap-x-2 gap-y-1">
                              <span>{formatRentalPeriod(startDate, endDate)}</span>
                              <span aria-hidden="true">·</span>
                              <span className="font-medium text-foreground">{formatRentalDuration(startDate, endDate)}</span>
                              <span>· Chọn giờ nhận và giờ trả theo giờ hoạt động của cửa hàng.</span>
                            </FieldDescription>
                            <FieldError errors={[form.formState.errors.startDate, form.formState.errors.endDate]} />
                          </Field>

                          <FieldSeparator>Thông tin nhận hàng</FieldSeparator>

                          <FieldGroup className="grid gap-4 md:grid-cols-2">
                            <Field data-disabled={!canEdit}>
                              <FieldLabel htmlFor="update-rental-order-pickup-method">Phương thức nhận</FieldLabel>
                              <Select
                                value={pickupMethod}
                                disabled={!canEdit}
                                onValueChange={(value: UpdateQuoteFormValues['pickupMethod']) => {
                                  form.setValue('pickupMethod', value, { shouldDirty: true, shouldValidate: true });
                                  invalidateQuote();
                                }}
                              >
                                <SelectTrigger id="update-rental-order-pickup-method" className="w-full">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectGroup>
                                    <SelectItem value="PICKUP_AT_STORE">Nhận tại cửa hàng</SelectItem>
                                    <SelectItem value="DELIVERY">Giao máy</SelectItem>
                                  </SelectGroup>
                                </SelectContent>
                              </Select>
                              <FieldDescription>
                                {pickupMethod === 'DELIVERY' ? 'Đơn sẽ được giao đến địa chỉ bên cạnh.' : 'Khách nhận máy tại cửa hàng.'}
                              </FieldDescription>
                            </Field>

                            <Field
                              data-disabled={!canEdit || pickupMethod !== 'DELIVERY'}
                              data-invalid={Boolean(form.formState.errors.deliveryAddress)}
                            >
                              <FieldLabel htmlFor="update-rental-order-delivery-address">Địa chỉ giao máy</FieldLabel>
                              <Input
                                id="update-rental-order-delivery-address"
                                disabled={!canEdit || pickupMethod !== 'DELIVERY'}
                                placeholder="Nhập địa chỉ giao máy"
                                aria-invalid={Boolean(form.formState.errors.deliveryAddress)}
                                {...deliveryAddressField}
                                onChange={(event) => {
                                  deliveryAddressField.onChange(event);
                                  invalidateQuote();
                                }}
                              />
                              <FieldDescription>
                                {pickupMethod === 'DELIVERY' ? 'Địa chỉ dùng để tính và thực hiện giao máy.' : 'Không cần nhập khi nhận tại cửa hàng.'}
                              </FieldDescription>
                              <FieldError errors={[form.formState.errors.deliveryAddress]} />
                            </Field>
                          </FieldGroup>
                        </FieldGroup>
                      </CardContent>
                    </Card>

                    <Card className={updateSurfaceClass}>
                      <CardHeader>
                        <CardTitle>Sản phẩm và số lượng</CardTitle>
                        <CardDescription>Backend sẽ tự chọn máy đang trống theo khoảng thời gian mới.</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <RentalOrderUpdateItemsField
                          value={items}
                          onChange={handleItemsChange}
                          error={form.formState.errors.items}
                          initialItems={initialItems}
                          initialProducts={initialProducts}
                          portalContainer={portalContainer}
                          disabled={!canEdit}
                        />
                      </CardContent>
                    </Card>

                    <Card className={updateSurfaceClass}>
                      <CardHeader>
                        <CardTitle>Ghi chú</CardTitle>
                        <CardDescription>Ghi chú khách hàng và ghi chú nội bộ được cập nhật cùng đơn.</CardDescription>
                      </CardHeader>
                      <CardContent className="grid gap-4 md:grid-cols-2">
                        <Field>
                          <FieldLabel htmlFor="update-rental-order-note">Ghi chú khách hàng</FieldLabel>
                          <Textarea
                            id="update-rental-order-note"
                            value={note}
                            onChange={(event) => setNote(event.target.value)}
                            placeholder="Thông tin cần lưu ý cho đơn thuê"
                            disabled={!canEdit}
                          />
                        </Field>
                        <Field>
                          <FieldLabel htmlFor="update-rental-order-internal-note">Ghi chú nội bộ</FieldLabel>
                          <Textarea
                            id="update-rental-order-internal-note"
                            value={internalNote}
                            onChange={(event) => setInternalNote(event.target.value)}
                            placeholder="Thông tin dành cho nhân viên"
                            disabled={!canEdit}
                          />
                        </Field>
                      </CardContent>
                    </Card>

                    {quote && hasRentalChanges ? <QuoteSummary quote={quote} /> : null}

                    {quoteMutation.error || updateMutation.error ? (
                      <Alert variant="destructive">
                        <AlertTitle>Không thể cập nhật đơn</AlertTitle>
                        <AlertDescription>
                          Backend có thể đã từ chối vì đơn không còn ở trạng thái mới tạo, quote hết hạn hoặc lịch không
                          còn khả dụng.
                        </AlertDescription>
                      </Alert>
                    ) : null}
                  </FieldGroup>
                </div>
              </ScrollArea>

              <DialogFooter className="flex-row! justify-between!">
                <Button
                  className="w-auto uppercase tracking-widest sm:min-w-[160px]"
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                >
                  Đóng
                </Button>
                {hasRentalChanges && !quote?.availability.available ? (
                  <Button
                    className="w-auto uppercase tracking-widest sm:min-w-[160px]"
                    type="submit"
                    disabled={!canEdit || quoteMutation.isPending}
                  >
                    {quoteMutation.isPending ? <Spinner data-icon="inline-start" /> : null}
                    Tính toán và kiếm tra lịch
                  </Button>
                ) : (
                  <Button
                    className="w-auto uppercase tracking-widest sm:min-w-[160px]"
                    type="submit"
                    disabled={!canEdit || !hasChanges || updateMutation.isPending}
                  >
                    {updateMutation.isPending ? <Spinner data-icon="inline-start" /> : null}
                    Lưu thay đổi
                  </Button>
                )}
              </DialogFooter>
          </form>
        ) : orderQuery.isLoading ? (
          <UpdateDialogLoading />
        ) : (
          <Alert variant="destructive" className="mx-6 my-5">
            <AlertTitle>Không tìm thấy đơn thuê</AlertTitle>
            <AlertDescription>Đơn có thể đã bị xoá hoặc không còn quyền truy cập.</AlertDescription>
          </Alert>
        )}
      </DialogContent>
    </Dialog>
  );
}
