'use client';

import { DateTimeRangePicker, type DateTimeRange } from '@/components/shared/date-time-range-picker';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import { Textarea } from '@/components/ui/textarea';
import { formatCurrency, parseDate, toIso } from '@/lib/utils';
import { CustomerCombobox } from '@/modules/customers/customer-combobox';
import { CustomerFormDialog } from '@/modules/customers/dialog';
import type { ICustomerOut } from '@/modules/customers/type';
import type { ProductOption } from '@/modules/asset-units/product-combobox';
import { zodResolver } from '@hookform/resolvers/zod';
import { IconUserPlus } from '@tabler/icons-react';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { RentalOrderItemsField } from '../form/rental-order-items-field';
import { useCreateRentalOrder, useCreateRentalQuote } from '../../hooks/mutations';
import { formatRentalDuration } from '../../display-utils';
import type { RentalOrderQuote } from '../../model';
import { quoteFormSchema, type QuoteFormValues } from '../../model';
import { ScrollArea } from '@/components/ui/scroll-area';

export type CreateRentalOrderPrefill = {
  startDate?: string;
  endDate?: string;
  items?: Array<{ productId: string; quantity: number; note?: string }>;
  initialProducts?: ProductOption[];
};

function formatRentalDate(value?: Date) {
  return value
    ? value.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', weekday: 'short', year: 'numeric' })
    : 'Chưa chọn ngày';
}

function formatRentalTime(value?: Date) {
  return value ? value.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '--:--';
}

export function CreateRentalOrderDialog({
  open,
  onOpenChange,
  prefill,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prefill?: CreateRentalOrderPrefill | null;
}) {
  const [quote, setQuote] = useState<RentalOrderQuote | null>(null);
  const [note, setNote] = useState('');
  const [dateRangeOpen, setDateRangeOpen] = useState(false);
  const [customerDialogOpen, setCustomerDialogOpen] = useState(false);
  const [createdCustomer, setCreatedCustomer] = useState<ICustomerOut | null>(null);
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
  const startDate = form.watch('startDate');
  const endDate = form.watch('endDate');
  const items = form.watch('items');
  const pickupMethod = form.watch('pickupMethod');
  const dateRange = useMemo<DateTimeRange>(
    () => ({ from: parseDate(startDate), to: parseDate(endDate) }),
    [endDate, startDate],
  );
  const rentalDurationLabel = useMemo(
    () =>
      dateRange.from && dateRange.to
        ? formatRentalDuration(dateRange.from.toISOString(), dateRange.to.toISOString())
        : null,
    [dateRange.from, dateRange.to],
  );
  const quoteMutation = useCreateRentalQuote();
  const createMutation = useCreateRentalOrder();

  useEffect(() => {
    if (!open) {
      form.reset();
      setQuote(null);
      setNote('');
      setDateRangeOpen(false);
      setCustomerDialogOpen(false);
      setCreatedCustomer(null);
    }
    if (open && prefill) {
      form.reset({
        customerId: '',
        startDate: prefill.startDate ?? '',
        endDate: prefill.endDate ?? '',
        pickupMethod: 'PICKUP_AT_STORE',
        deliveryAddress: '',
        items: prefill.items ?? [],
      });
      setQuote(null);
      setNote('');
    }
  }, [form, open, prefill]);

  const handleDateRangeUpdate = ({ range }: { range: DateTimeRange }) => {
    form.setValue('startDate', range.from ? range.from.toISOString() : '', { shouldDirty: true, shouldValidate: true });
    form.setValue('endDate', range.to ? range.to.toISOString() : '', { shouldDirty: true, shouldValidate: true });
    setQuote(null);
  };

  const handleItemsChange = (nextItems: QuoteFormValues['items']) => {
    form.setValue('items', nextItems, { shouldDirty: true, shouldValidate: true });
    setQuote(null);
  };

  const submitQuote = (values: QuoteFormValues) => {
    quoteMutation.mutate(
      { ...values, startDate: toIso(values.startDate), endDate: toIso(values.endDate) },
      { onSuccess: setQuote },
    );
  };

  const confirmOrder = () => {
    if (!quote) return;
    createMutation.mutate(
      { quoteId: quote.quoteId, note: note.trim() || undefined },
      { onSuccess: () => onOpenChange(false) },
    );
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-5xl ring-0">
          <div ref={setPortalContainer} className="contents">
            <DialogHeader>
              <DialogTitle>Tạo đơn thuê</DialogTitle>
              <DialogDescription>
                Chọn khách hàng, thời gian thuê, sản phẩm và số lượng. Hệ thống sẽ tự tìm và tính toán thiết bị khả dụng
                để thuê
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={form.handleSubmit(submitQuote)}>
              <ScrollArea className="h-[calc(60dvh-105px)]">
                <FieldGroup className="gap-5 py-2">
                  <div className="grid gap-4 md:grid-cols-2">
                    <Field data-invalid={Boolean(form.formState.errors.customerId)}>
                      <FieldLabel htmlFor="rental-order-customer">Khách hàng</FieldLabel>
                      <div className="flex items-start gap-2">
                        <CustomerCombobox
                          value={form.watch('customerId')}
                          selectedCustomer={createdCustomer}
                          includeUnavailable
                          onChange={(value) => {
                            form.setValue('customerId', value, { shouldDirty: true, shouldValidate: true });
                            setQuote(null);
                          }}
                          ariaInvalid={Boolean(form.formState.errors.customerId)}
                          className="w-full"
                          portalContainer={portalContainer}
                        />
                        <Button
                          type="button"
                          variant="default"
                          size="icon"
                          aria-label="Thêm khách hàng"
                          title="Thêm khách hàng"
                          onClick={() => setCustomerDialogOpen(true)}
                          className="size-9!"
                        >
                          <IconUserPlus aria-hidden="true" data-icon="inline-start" />
                        </Button>
                      </div>
                      <FieldDescription>Chưa có khách hàng? Thêm mới ngay trong form này.</FieldDescription>
                      <FieldError errors={[form.formState.errors.customerId]} />
                    </Field>

                    <Field data-invalid={Boolean(form.formState.errors.startDate || form.formState.errors.endDate)}>
                      <FieldLabel htmlFor="rental-order-period">Thời gian thuê máy</FieldLabel>
                      <DateTimeRangePicker
                        id="rental-order-period"
                        value={dateRange}
                        className="w-full"
                        updateMode="instant"
                        enableTime
                        allowPastDates={false}
                        open={dateRangeOpen}
                        setOpen={setDateRangeOpen}
                        onUpdate={handleDateRangeUpdate}
                        portalContainer={portalContainer}
                      />
                      <FieldDescription className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <span>Chọn giờ nhận và giờ trả theo giờ hoạt động của cửa hàng.</span>
                        {rentalDurationLabel ? (
                          <span className="font-medium text-foreground">Thời lượng: {rentalDurationLabel}</span>
                        ) : null}
                      </FieldDescription>
                      <FieldError errors={[form.formState.errors.startDate, form.formState.errors.endDate]} />
                    </Field>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <Field>
                      <FieldLabel htmlFor="rental-order-pickup-method">Hình thức nhận máy</FieldLabel>
                      <Select
                        value={pickupMethod}
                        onValueChange={(value: QuoteFormValues['pickupMethod']) =>
                          form.setValue('pickupMethod', value, { shouldDirty: true, shouldValidate: true })
                        }
                      >
                        <SelectTrigger id="rental-order-pickup-method" className="w-full">
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
                      <FieldLabel htmlFor="rental-order-delivery-address">Địa chỉ giao</FieldLabel>
                      <Input
                        id="rental-order-delivery-address"
                        disabled={pickupMethod !== 'DELIVERY'}
                        placeholder="Chỉ cần khi chọn giao máy"
                        aria-invalid={Boolean(form.formState.errors.deliveryAddress)}
                        {...form.register('deliveryAddress')}
                      />
                      <FieldError errors={[form.formState.errors.deliveryAddress]} />
                    </Field>
                  </div>

                  <RentalOrderItemsField
                    value={items}
                    onChange={handleItemsChange}
                    error={form.formState.errors.items}
                    initialProducts={prefill?.initialProducts}
                    portalContainer={portalContainer}
                  />

                  {quote ? (
                    <section className="grid gap-5 rounded-xl bg-muted/30 p-4 sm:p-5" aria-label="Thông tin báo giá">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="grid gap-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge variant="secondary">Quote {quote.quoteId}</Badge>
                            <span className="text-xs text-muted-foreground">Báo giá tạm tính</span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Hết hạn {new Date(quote.expiresAt).toLocaleString('vi-VN')}
                          </p>
                        </div>
                        <Badge variant={quote.availability.available ? 'secondary' : 'destructive'}>
                          {quote.availability.available ? 'Đủ máy trống' : 'Thiếu máy trống'}
                        </Badge>
                      </div>

                      <div className="grid gap-3 divide-y divide-border/60 sm:grid-cols-2 sm:divide-x sm:divide-y-0">
                        <div className="grid gap-1 pb-3 sm:pr-5 sm:pb-0">
                          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Khoảng thuê</span>
                          <span className="font-medium">
                            {formatRentalDate(dateRange.from)} → {formatRentalDate(dateRange.to)}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {formatRentalTime(dateRange.from)} → {formatRentalTime(dateRange.to)}
                          </span>
                        </div>
                        <div className="grid gap-1 pt-3 sm:pl-5 sm:pt-0">
                          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Thời lượng thuê</span>
                          <span className="font-medium">{rentalDurationLabel ?? 'Chưa đủ dữ liệu thời gian'}</span>
                          <span className="text-sm text-muted-foreground">Thời lượng được dùng để tính giá thuê theo chính sách.</span>
                        </div>
                      </div>

                      <div className="grid gap-0 divide-y divide-border/60">
                        {quote.lines.map((line) => (
                          <div key={line.productId} className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                            <div className="grid min-w-0 gap-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="truncate font-medium">{line.productName}</span>
                                <Badge variant="secondary" className="font-mono text-[11px]">
                                  {line.sku}
                                </Badge>
                              </div>
                              <span className="text-xs text-muted-foreground">
                                {line.quantity} sản phẩm · {line.pricingLabel}
                              </span>
                            </div>
                            <strong className="tabular-nums">{formatCurrency(line.lineRentalTotal)}</strong>
                          </div>
                        ))}
                      </div>

                      <div className="grid gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
                        <div className="grid gap-1">
                          <span className="text-xs text-muted-foreground">Tiền thuê</span>
                          <strong className="tabular-nums">{formatCurrency(quote.summary.rentalFeeTotal)}</strong>
                        </div>
                        <div className="grid gap-1">
                          <span className="text-xs text-muted-foreground">Giữ lịch đã thu</span>
                          <strong className="tabular-nums">{formatCurrency(quote.summary.bookingHoldTotal)}</strong>
                        </div>
                        <div className="grid gap-1">
                          <span className="text-xs text-muted-foreground">Tiền cọc</span>
                          <strong className="tabular-nums">{formatCurrency(quote.summary.securityDepositTotal)}</strong>
                        </div>
                        {quote.summary.deliveryFeeTotal > 0 ? (
                          <div className="grid gap-1">
                            <span className="text-xs text-muted-foreground">Phí giao máy</span>
                            <strong className="tabular-nums">{formatCurrency(quote.summary.deliveryFeeTotal)}</strong>
                          </div>
                        ) : null}
                        <div className="grid gap-1">
                          <span className="text-xs text-muted-foreground">Tổng cần thanh toán</span>
                          <strong className="tabular-nums">{formatCurrency(quote.summary.totalCustomerObligation)}</strong>
                        </div>
                        <div className="grid gap-1">
                          <span className="text-xs text-muted-foreground">Còn trước bàn giao</span>
                          <strong className="tabular-nums text-primary">{formatCurrency(quote.summary.amountDueBeforeHandover)}</strong>
                        </div>
                      </div>

                      {quote.availability.available ? (
                        <Field>
                          <FieldLabel htmlFor="rental-order-note">Ghi chú đơn</FieldLabel>
                          <Textarea
                            id="rental-order-note"
                            value={note}
                            onChange={(event) => setNote(event.target.value)}
                            placeholder="Ghi chú nội bộ hoặc cho khách"
                          />
                        </Field>
                      ) : (
                        <Alert variant="destructive">
                          <AlertDescription>
                            <div className="grid gap-1">
                              <span>Không đủ máy trống cho yêu cầu này:</span>
                              {quote.availability.conflicts.map((conflict) => (
                                <span key={conflict.productId}>
                                  <strong>{conflict.productName}</strong>: {conflict.message} ({conflict.availableQuantity}/
                                  {conflict.requestedQuantity} máy trống)
                                </span>
                              ))}
                            </div>
                          </AlertDescription>
                        </Alert>
                      )}
                    </section>
                  ) : null}

                  {quoteMutation.error || createMutation.error ? (
                    <Alert variant="destructive">
                      <AlertDescription>
                        Không thể hoàn tất thao tác. Vui lòng kiểm tra lại khách hàng, lịch, sản phẩm và số lượng.
                      </AlertDescription>
                    </Alert>
                  ) : null}
                </FieldGroup>
              </ScrollArea>

              <>
                <DialogFooter className="flex-row! justify-between!">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => onOpenChange(false)}
                    className="w-auto uppercase tracking-widest sm:min-w-[160px]"
                  >
                    Đóng
                  </Button>
                  {quote?.availability.available ? (
                    <Button
                      className="w-auto uppercase tracking-widest sm:min-w-[160px]"
                      type="button"
                      disabled={createMutation.isPending}
                      onClick={confirmOrder}
                    >
                      {createMutation.isPending ? <Spinner data-icon="inline-start" /> : null}
                      Tạo đơn
                    </Button>
                  ) : (
                    <Button
                      className="w-auto uppercase tracking-widest sm:min-w-[160px]"
                      type="submit"
                      disabled={quoteMutation.isPending}
                    >
                      {quoteMutation.isPending ? <Spinner data-icon="inline-start" /> : null}
                      Tính toán kiểm tra lịch thuê
                    </Button>
                  )}
                </DialogFooter>
              </>
            </form>
          </div>
        </DialogContent>
      </Dialog>

      <CustomerFormDialog
        open={customerDialogOpen}
        mode="create"
        onOpenChange={setCustomerDialogOpen}
        onSuccess={(customer) => {
          setCreatedCustomer(customer);
          form.setValue('customerId', customer.id, { shouldDirty: true, shouldValidate: true });
          setQuote(null);
        }}
      />
    </>
  );
}
