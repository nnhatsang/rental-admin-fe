'use client';

import { DateTimeRangePicker, type DateTimeRange } from '@/components/shared/date-time-range-picker';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Spinner } from '@/components/ui/spinner';
import { Textarea } from '@/components/ui/textarea';
import {
  Stepper,
  StepperDescription,
  StepperIndicator,
  StepperItem,
  StepperNav,
  StepperSeparator,
  StepperTitle,
  StepperTrigger,
} from '@/components/reui/stepper';
import { formatCurrency } from '@/lib/utils';
import { CustomerCombobox, type CustomerOption } from '@/modules/customers/customer-combobox';
import type { ProductOption } from '@/modules/asset-units/product-combobox';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useCreateRentalQuote, useUpdateRentalOrder } from '../../hooks/mutations';
import { useGetRentalOrderById } from '../../hooks/queries';
import { RentalOrderItemsField } from '../form/rental-order-items-field';
import type { RentalOrderQuote } from '../../model';
import { quoteFormSchema, type QuoteFormValues } from '../../model';

function toIso(value?: string) {
  if (!value) return '';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : date.toISOString();
}

function parseDate(value?: string) {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
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
    <Card>
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
        <div className="grid gap-2">
          {quote.lines.map((line) => (
            <div
              key={line.productId}
              className="flex flex-wrap items-center justify-between gap-2 rounded-md border bg-muted/20 px-3 py-2"
            >
              <span className="font-medium">
                {line.productName} · {line.sku} × {line.quantity}
              </span>
              <span>{formatCurrency(line.lineRentalTotal)}</span>
            </div>
          ))}
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <QuoteMetric label="Tiền thuê" value={quote.summary.rentalFeeTotal} />
          <QuoteMetric label="Giữ lịch" value={quote.summary.bookingHoldTotal} />
          <QuoteMetric label="Tiền cọc" value={quote.summary.securityDepositTotal} />
          <QuoteMetric label="Tổng nghĩa vụ" value={quote.summary.totalCustomerObligation} />
          <QuoteMetric label="Còn trước giao" value={quote.summary.amountDueBeforeHandover} />
        </div>

        {!isAvailable ? (
          <Alert variant="destructive">
            <AlertTitle>Không thể cập nhật theo lịch này</AlertTitle>
            <AlertDescription>
              {quote.availability.conflicts.map((conflict) => conflict.reason).join(', ') || 'Sản phẩm không còn đủ máy trống.'}
            </AlertDescription>
          </Alert>
        ) : null}
      </CardContent>
    </Card>
  );
}

function QuoteMetric({ label, value }: { label: string; value: number }) {
  return (
    <div className="grid gap-1 rounded-md border bg-muted/20 p-3">
      <span className="text-xs text-muted-foreground">{label}</span>
      <strong>{formatCurrency(value)}</strong>
    </div>
  );
}

function UpdateProgress({ hasQuote }: { hasQuote: boolean }) {
  return (
    <Stepper
      value={hasQuote ? 2 : 1}
      orientation="horizontal"
      className="rounded-lg border bg-muted/20 px-4 py-3"
    >
      <StepperNav>
        <StepperItem step={1} completed={hasQuote} className="min-w-0">
          <StepperTrigger type="button" className="min-w-0 justify-start text-left">
            <StepperIndicator>1</StepperIndicator>
            <span className="grid min-w-0 gap-1">
              <StepperTitle>Thông tin thuê</StepperTitle>
              <StepperDescription className="truncate">Khách, lịch và sản phẩm</StepperDescription>
            </span>
          </StepperTrigger>
          <StepperSeparator />
        </StepperItem>
        <StepperItem step={2} className="min-w-0">
          <StepperTrigger type="button" className="min-w-0 justify-start text-left">
            <StepperIndicator>2</StepperIndicator>
            <span className="grid min-w-0 gap-1">
              <StepperTitle>Quote và lưu</StepperTitle>
              <StepperDescription className="truncate">Kiểm tra máy trống và chi phí</StepperDescription>
            </span>
          </StepperTrigger>
        </StepperItem>
      </StepperNav>
    </Stepper>
  );
}

export function UpdateRentalOrderDialog({
  open,
  orderId,
  onOpenChange,
}: {
  open: boolean;
  orderId: string | null;
  onOpenChange: (open: boolean) => void;
}) {
  const orderQuery = useGetRentalOrderById(orderId, open && Boolean(orderId));
  const order = orderQuery.data;
  const [quote, setQuote] = useState<RentalOrderQuote | null>(null);
  const [dateRangeOpen, setDateRangeOpen] = useState(false);
  const [note, setNote] = useState('');
  const [internalNote, setInternalNote] = useState('');
  const [portalContainer, setPortalContainer] = useState<HTMLDivElement | null>(null);
  const form = useForm<QuoteFormValues>({
    resolver: zodResolver(quoteFormSchema),
    defaultValues: {
      customerId: '',
      startDate: '',
      endDate: '',
      pickupMethod: 'PICKUP_AT_STORE',
      deliveryAddress: '',
      items: [],
    },
  });
  const { customerId, startDate, endDate, items, pickupMethod } = form.watch();
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
      })) ?? [],
    [order?.lines],
  );
  const selectedCustomer = useMemo<CustomerOption | null>(
    () =>
      order
        ? {
            id: order.customerId,
            name: order.customerSnapshot.name,
            phone: order.customerSnapshot.phone,
          }
        : null,
    [order],
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
    });
    setNote(order.notes.customerNote ?? '');
    setInternalNote(order.notes.internalNote ?? '');
    setQuote(null);
  }, [form, open, order]);

  useEffect(() => {
    if (open) return;

    form.reset();
    setQuote(null);
    setDateRangeOpen(false);
    setNote('');
    setInternalNote('');
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

  const handleItemsChange = (nextItems: QuoteFormValues['items']) => {
    form.setValue('items', nextItems, { shouldDirty: true, shouldValidate: true });
    invalidateQuote();
  };

  const submitQuote = (values: QuoteFormValues) => {
    quoteMutation.mutate(
      {
        ...values,
        startDate: toIso(values.startDate),
        endDate: toIso(values.endDate),
        excludeOrderId: orderId ?? undefined,
      },
      { onSuccess: setQuote },
    );
  };

  const confirmUpdate = () => {
    if (!quote || !quote.availability.available || !orderId) return;

    updateMutation.mutate(
      {
        id: orderId,
        data: {
          quoteId: quote.quoteId,
          note: note.trim() || null,
          internalNote: internalNote.trim() || null,
        },
      },
      { onSuccess: () => onOpenChange(false) },
    );
  };

  const deliveryAddressField = form.register('deliveryAddress');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[calc(100dvh-24px)] overflow-hidden p-0 sm:max-w-6xl">
        <div ref={setPortalContainer} className="contents">
          <DialogHeader className="border-b px-6 py-5 pr-14">
            <DialogTitle>Sửa đơn thuê</DialogTitle>
            <DialogDescription>
              {order
                ? `${order.code} · thay đổi sẽ được quote lại để kiểm tra lịch và máy trống`
                : 'Đang tải thông tin đơn thuê…'}
            </DialogDescription>
          </DialogHeader>

          {orderQuery.isError ? (
            <Alert variant="destructive" className="mx-6 mt-5">
              <AlertTitle>Không tải được đơn thuê</AlertTitle>
              <AlertDescription>Vui lòng đóng dialog và thử mở lại.</AlertDescription>
            </Alert>
          ) : order ? (
            <form onSubmit={form.handleSubmit(submitQuote)} className="min-h-0">
              <ScrollArea className="max-h-[calc(100dvh-204px)] px-6">
                <FieldGroup className="gap-4 py-5">
                  <UpdateProgress hasQuote={Boolean(quote)} />

                  {!canEdit ? (
                    <Alert variant="destructive">
                      <AlertTitle>Đơn này không còn ở trạng thái có thể sửa</AlertTitle>
                      <AlertDescription>Chỉ đơn mới tạo mới được thay đổi thông tin thuê và tính quote lại.</AlertDescription>
                    </Alert>
                  ) : null}

                  <Card>
                    <CardHeader>
                      <CardTitle>Khách hàng và thời gian thuê</CardTitle>
                      <CardDescription>Thay đổi hai thông tin này sẽ yêu cầu kiểm tra khả dụng lại.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4 md:grid-cols-2">
                      <Field data-invalid={Boolean(form.formState.errors.customerId)}>
                        <FieldLabel htmlFor="update-rental-order-customer">Khách hàng</FieldLabel>
                        <CustomerCombobox
                          value={customerId}
                          selectedCustomer={selectedCustomer}
                          onChange={(value) => {
                            form.setValue('customerId', value, { shouldDirty: true, shouldValidate: true });
                            invalidateQuote();
                          }}
                          ariaInvalid={Boolean(form.formState.errors.customerId)}
                          className="w-full"
                          portalContainer={portalContainer}
                          disabled={!canEdit}
                        />
                        <FieldError errors={[form.formState.errors.customerId]} />
                      </Field>

                      <Field data-invalid={Boolean(form.formState.errors.startDate || form.formState.errors.endDate)}>
                        <FieldLabel htmlFor="update-rental-order-period">Thời gian thuê máy</FieldLabel>
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
                        <FieldDescription>Chọn giờ nhận và giờ trả theo giờ hoạt động của cửa hàng.</FieldDescription>
                        <FieldError errors={[form.formState.errors.startDate, form.formState.errors.endDate]} />
                      </Field>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Hình thức nhận máy</CardTitle>
                      <CardDescription>Địa chỉ giao chỉ được dùng khi chọn giao máy.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4 md:grid-cols-2">
                      <Field>
                        <FieldLabel htmlFor="update-rental-order-pickup-method">Hình thức</FieldLabel>
                        <Select
                          value={pickupMethod}
                          disabled={!canEdit}
                          onValueChange={(value: QuoteFormValues['pickupMethod']) => {
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
                      </Field>
                      <Field data-invalid={Boolean(form.formState.errors.deliveryAddress)}>
                        <FieldLabel htmlFor="update-rental-order-delivery-address">Địa chỉ giao</FieldLabel>
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
                        <FieldError errors={[form.formState.errors.deliveryAddress]} />
                      </Field>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Sản phẩm và số lượng</CardTitle>
                      <CardDescription>Backend sẽ tự chọn máy đang trống theo khoảng thời gian mới.</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <RentalOrderItemsField
                        value={items}
                        onChange={handleItemsChange}
                        error={form.formState.errors.items}
                        initialProducts={initialProducts}
                        portalContainer={portalContainer}
                      />
                    </CardContent>
                  </Card>

                  <Card>
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

                  {quote ? <QuoteSummary quote={quote} /> : null}

                  {quoteMutation.error || updateMutation.error ? (
                    <Alert variant="destructive">
                      <AlertTitle>Không thể cập nhật đơn</AlertTitle>
                      <AlertDescription>
                        Backend có thể đã từ chối vì đơn không còn ở trạng thái mới tạo, quote hết hạn hoặc lịch không còn khả dụng.
                      </AlertDescription>
                    </Alert>
                  ) : null}
                </FieldGroup>
              </ScrollArea>

              <DialogFooter className="mx-0 mb-0 border-t px-6 py-4">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Đóng
                </Button>
                {quote?.availability.available ? (
                  <Button type="button" disabled={!canEdit || updateMutation.isPending} onClick={confirmUpdate}>
                    {updateMutation.isPending ? <Spinner data-icon="inline-start" /> : null}
                    Lưu thay đổi
                  </Button>
                ) : (
                  <Button type="submit" disabled={!canEdit || quoteMutation.isPending}>
                    {quoteMutation.isPending ? <Spinner data-icon="inline-start" /> : null}
                    Tính quote mới
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
        </div>
      </DialogContent>
    </Dialog>
  );
}
