'use client';

import { BadgeCustom } from '@/components/shared/badge-custom';
import { DetailCard, Info } from '@/components/shared/card-custom';
import { CopyText } from '@/components/shared/copy-text';
import { DateTimeRangePicker } from '@/components/shared/date-time-range-picker';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { CurrencyInput } from '@/components/ui/currency-input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Field, FieldContent, FieldDescription, FieldError, FieldLabel, FieldTitle } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { cn, formatCurrency, formatDate } from '@/lib/utils';
import {
  IconAlertTriangle,
  IconArrowBackUp,
  IconCalendarTime,
  IconCash,
  IconCreditCard,
  IconEdit,
  IconHistory,
  IconLoader,
  IconNotes,
  IconPackage,
  IconTrash,
  IconUser,
} from '@tabler/icons-react';
import { useState, type ReactNode } from 'react';
import { Controller } from 'react-hook-form';
import {
  orderStatusConfig,
  paymentStatusConfig,
  pickupMethodConfig,
  refundStatusConfig,
  rentalOrderEditableLineFilterConfig,
  rentalOrderEditableLineFilterOptions,
  rentalOrderEditableLineStateConfig
} from '../display-config';
import { useRentalOrderUpdateLogic } from '../hooks/use-rental-order-update-logic';
import { useRentalOrders } from '../rental-orders-provider';
import type { IRentalOrderOut, PickupMethod } from '../type';
import { formatRentalDuration } from '../utils';
import { RentalOrderAssetSelectionTable } from './rental-order-asset-selection-table';
import { OrderLogsTimeline, PaymentsList, StatusTimeline } from './rental-order-detail-dialog';

type RentalOrderUpdateDialogProps = {
  orderId?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function EmptyBox({ children }: { children: ReactNode }) {
  return <p className="rounded-md border border-dashed bg-muted/20 p-4 text-sm text-muted-foreground">{children}</p>;
}



function DetailSkeleton() {
  return (
    <div className="grid gap-5 p-5 lg:grid-cols-[minmax(0,1fr)_360px]">
      <div className="space-y-5">
        <Skeleton className="h-32" />
        <Skeleton className="h-64" />
        <Skeleton className="h-60" />
      </div>
      <div className="space-y-5">
        <Skeleton className="h-64" />
        <Skeleton className="h-80" />
      </div>
    </div>
  );
}

const pickupMethodChoices = Object.entries(pickupMethodConfig).map(([value, config]) => ({
  ...config,
  value: value as PickupMethod,
}));

export function RentalOrderUpdateDialog({ orderId, open, onOpenChange }: RentalOrderUpdateDialogProps) {
  const [calendarPortalContainer, setCalendarPortalContainer] = useState<HTMLDivElement | null>(null);
  const {
    activeLines,
    assetTable,
    canEdit,
    canSubmit,
    checkAvailability,
    currentAmountDueAtHandover,
    currentBookingHoldTotal,
    currentDeliveryFeeTotal,
    currentDepositTotal,
    currentEstimatedRefund,
    currentForfeitedBookingHoldTotal,
    currentHandoverRequiredTotal,
    currentNetRental,
    currentPaidCreditTotal,
    currentRentalTotal,
    displayEstimatedLineById,
    discountTotal,
    filteredLines,
    form,
    getLineStateForLine,
    handleClose,
    hasAvailabilityConflict,
    hasValidRange,
    lineFilter,
    lineStateCounts,
    lines,
    order,
    orderQuery,
    pickupMethod,
    range,
    rangeOpen,
    removeLine,
    restoreLine,
    setLineFilter,
    setRangeOpen,
    updateLineNote,
    updateOrder,
    onSubmit,
  } = useRentalOrderUpdateLogic({
    orderId,
    open,
    onClose: () => onOpenChange(false),
  });
  const { setOpen } = useRentalOrders();

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => (nextOpen ? onOpenChange(true) : handleClose())}>
      <DialogContent
        ref={setCalendarPortalContainer}
        className="sm:max-w-7xl"
        onPointerDownOutside={(event) => event.preventDefault()}
      >
        {order ? <OrderHeader order={order} /> : null}
        {!order ? (
          <DialogHeader>
            <DialogTitle>Cập nhật đơn thuê</DialogTitle>
          </DialogHeader>
        ) : null}

        <ScrollArea className="h-[calc(80dvh-145px)]">
          {orderQuery.isLoading ? <DetailSkeleton /> : null}

          {!orderQuery.isLoading && !order ? (
            <div className="p-5">
              <EmptyBox>Không tìm thấy đơn thuê.</EmptyBox>
            </div>
          ) : null}

          {order ? (
            <form id="rental-order-update-form" onSubmit={form.handleSubmit(onSubmit)} className="p-1">
              <fieldset disabled={!canEdit || updateOrder.isPending} className="contents">
                {!canEdit ? (
                  <div className="mb-5 flex gap-3 rounded-md border border-amber-500/40 bg-amber-500/5 p-3 text-sm text-amber-700">
                    <IconAlertTriangle className="mt-0.5 size-4 shrink-0" />
                    <span>
                      Đơn {order.code} đã qua bước chỉnh sửa nên chỉ xem lại thông tin, không thể lưu thay đổi.
                    </span>
                  </div>
                ) : null}

                <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
                  <Tabs defaultValue="customer" className="min-w-0 h-auto">
                    <Card className="gap-0 p-0">
                      <CardHeader className="border-b p-0!">
                        <TabsList
                          variant="line"
                          className="h-11! w-full justify-start max-xl:overflow-x-auto overflow-y-hidden rounded-none"
                        >
                          <TabsTrigger value="customer" className="shrink-0 px-6">
                            <IconUser className="size-4" />
                            Khách hàng
                          </TabsTrigger>

                          <TabsTrigger value="schedule" className="shrink-0 px-6">
                            <IconCalendarTime className="size-4" />
                            Lịch thuê
                          </TabsTrigger>

                          <TabsTrigger value="items" className="shrink-0 px-6">
                            <IconPackage className="size-4" />
                            Thiết bị đang thuê
                          </TabsTrigger>

                          <TabsTrigger value="notes" className="shrink-0 px-6">
                            <IconNotes className="size-4" />
                            Ghi chú
                          </TabsTrigger>

                          <TabsTrigger value="history" className="shrink-0 px-6">
                            <IconHistory className="size-4" />
                            Lịch sử
                          </TabsTrigger>
                        </TabsList>
                      </CardHeader>
                      <CardContent className="p-4">
                        <TabsContent value="customer" className="mt-0">
                          <div className="grid gap-3 sm:grid-cols-3">
                            <Controller
                              control={form.control}
                              name="customerSnapshot.name"
                              render={({ field, fieldState }) => (
                                <Field className="sm:col-span-2" data-invalid={fieldState.invalid}>
                                  <FieldLabel htmlFor={field.name}>Tên khách hàng</FieldLabel>
                                  <Input {...field} id={field.name} aria-invalid={fieldState.invalid} />
                                  {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
                                </Field>
                              )}
                            />
                            <Controller
                              control={form.control}
                              name="customerSnapshot.phone"
                              render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                  <FieldLabel htmlFor={field.name}>Số điện thoại</FieldLabel>
                                  <Input {...field} id={field.name} aria-invalid={fieldState.invalid} />
                                  {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
                                </Field>
                              )}
                            />
                            <Controller
                              control={form.control}
                              name="customerSnapshot.email"
                              render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                  <FieldLabel htmlFor={field.name}>Email</FieldLabel>
                                  <Input {...field} id={field.name} aria-invalid={fieldState.invalid} />
                                  {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
                                </Field>
                              )}
                            />
                            <Controller
                              control={form.control}
                              name="customerSnapshot.identityNumber"
                              render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                  <FieldLabel htmlFor={field.name}>CCCD/CMND</FieldLabel>
                                  <Input {...field} id={field.name} aria-invalid={fieldState.invalid} />
                                  {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
                                </Field>
                              )}
                            />
                            <Controller
                              control={form.control}
                              name="customerSnapshot.socialContact"
                              render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                  <FieldLabel htmlFor={field.name}>Liên hệ MXH</FieldLabel>
                                  <Input type="url" {...field} id={field.name} aria-invalid={fieldState.invalid} />
                                  {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
                                </Field>
                              )}
                            />
                            <Controller
                              control={form.control}
                              name="customerSnapshot.address"
                              render={({ field, fieldState }) => (
                                <Field className="sm:col-span-3" data-invalid={fieldState.invalid}>
                                  <FieldLabel htmlFor={field.name}>Địa chỉ</FieldLabel>
                                  <Textarea {...field} id={field.name} aria-invalid={fieldState.invalid} />
                                  {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
                                </Field>
                              )}
                            />
                          </div>
                        </TabsContent>

                        <TabsContent value="schedule" className="mt-0">
                          <div className="space-y-5">
                            <Controller
                              control={form.control}
                              name="range"
                              render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                  <FieldLabel htmlFor={field.name} className="grid grid-cols-2">
                                    <span>Giờ nhận</span>
                                    <span>Giờ trả</span>
                                  </FieldLabel>
                                  <DateTimeRangePicker
                                    id={field.name}
                                    value={field.value}
                                    onUpdate={({ range: nextRange }) => field.onChange(nextRange)}
                                    open={rangeOpen}
                                    setOpen={setRangeOpen}
                                    enableTime
                                    updateMode="debounced"
                                    updateDebounceMs={1000}
                                    portalContainer={calendarPortalContainer}
                                  />
                                  {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
                                </Field>
                              )}
                            />
                            <Controller
                              control={form.control}
                              name="pickupMethod"
                              render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                  <FieldLabel htmlFor={field.name}>Phương thức vận chuyển</FieldLabel>
                                  <RadioGroup
                                    id={field.name}
                                    name={field.name}
                                    value={field.value}
                                    onValueChange={field.onChange}
                                    orientation="vertical"
                                    className="grid grid-cols-1 gap-4 sm:grid-cols-2"
                                  >
                                    {pickupMethodChoices.map((method) => {
                                      const Icon = method.icon;
                                      const selected = field.value === method.value;
                                      const itemId = `rental-order-update-pickup-method-${method.value}`;

                                      return (
                                        <FieldLabel htmlFor={itemId} key={method.value}>
                                          <Field orientation="horizontal">
                                            <FieldContent className="relative flex w-full flex-row items-center gap-4">
                                              <div
                                                className={cn(
                                                  'flex shrink-0 items-center',
                                                  selected ? 'text-primary' : 'text-foreground',
                                                )}
                                              >
                                                {Icon ? <Icon /> : null}
                                              </div>

                                              <div className="flex flex-1 flex-col gap-2">
                                                <FieldTitle className="text-sm font-bold">{method.label}</FieldTitle>

                                                <FieldDescription className="pt-1 text-xs text-text-sub">
                                                  {method.address}
                                                </FieldDescription>

                                                <Badge className={cn('mt-2 w-fit', method.badgeColor)}>
                                                  {method.badge}
                                                </Badge>
                                              </div>

                                              <div className="shrink-0">
                                                <RadioGroupItem
                                                  value={method.value}
                                                  id={itemId}
                                                  aria-invalid={fieldState.invalid}
                                                  className="absolute top-1/2 right-0 size-6 -translate-y-1/2"
                                                />
                                              </div>
                                            </FieldContent>
                                          </Field>
                                        </FieldLabel>
                                      );
                                    })}
                                  </RadioGroup>
                                  {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
                                </Field>
                              )}
                            />
                            <div className="grid gap-3 sm:grid-cols-2">
                              <Controller
                                control={form.control}
                                name="deliveryFeeTotal"
                                render={({ field, fieldState }) => (
                                  <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor={field.name}>Phí giao</FieldLabel>
                                    <CurrencyInput
                                      {...field}
                                      id={field.name}
                                      aria-invalid={fieldState.invalid}
                                      disabled={pickupMethod !== 'DELIVERY'}
                                      min={0}
                                    />
                                    {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
                                  </Field>
                                )}
                              />
                              <Controller
                                control={form.control}
                                name="discountTotal"
                                render={({ field, fieldState }) => (
                                  <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor={field.name}>Giảm giá</FieldLabel>
                                    <CurrencyInput
                                      {...field}
                                      id={field.name}
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
                              name="deliveryAddress"
                              render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                  <FieldLabel htmlFor={field.name}>Địa chỉ giao</FieldLabel>
                                  <Textarea
                                    {...field}
                                    id={field.name}
                                    aria-invalid={fieldState.invalid}
                                    disabled={pickupMethod !== 'DELIVERY'}
                                    placeholder="Bắt buộc nếu chọn giao tận nơi"
                                  />
                                  {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
                                </Field>
                              )}
                            />
                          </div>
                        </TabsContent>

                        <TabsContent value="items" className="mt-0 space-y-4">
                          <div className="flex flex-wrap items-center gap-2">
                            {rentalOrderEditableLineFilterOptions.map((option) => {
                              const filterConfig = rentalOrderEditableLineFilterConfig[option.value];
                              const count = option.value === 'ALL' ? lines.length : lineStateCounts[option.value];
                              const selected = lineFilter === option.value;

                              return (
                                <Button
                                  key={option.value}
                                  type="button"
                                  size="sm"
                                  variant={selected ? 'default' : 'outline'}
                                  className={cn('gap-2', selected ? '' : filterConfig.className)}
                                  onClick={() => setLineFilter(option.value)}
                                >
                                  {option.label}
                                  <Badge
                                    variant="outline"
                                    className={cn(
                                      'h-4 min-w-5 justify-center rounded-sm px-1.5 text-[11px]',
                                      selected
                                        ? 'border-primary-foreground/30 bg-primary-foreground/15 text-primary-foreground'
                                        : filterConfig.className,
                                    )}
                                  >
                                    {count}
                                  </Badge>
                                </Button>
                              );
                            })}
                          </div>
                          {checkAvailability.isPending ? (
                            <div className="flex items-center gap-2 rounded-md border bg-muted/30 px-3 py-2 text-sm text-muted-foreground">
                              <IconLoader className="size-4 animate-spin" />
                              Đang kiểm tra lịch của các thiết bị đã chọn...
                            </div>
                          ) : null}
                          {hasAvailabilityConflict ? (
                            <div className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                              <IconAlertTriangle className="mt-0.5 size-4 shrink-0" />
                              <span>Một số thiết bị đang chọn không còn khả dụng trong khoảng thời gian này.</span>
                            </div>
                          ) : null}
                          {lines.length ? (
                            filteredLines.length ? (
                              <div className="-mx-4 overflow-x-auto">
                                <Table className="min-w-[820px]">
                                  <TableHeader>
                                    <TableRow className="bg-muted/30 hover:bg-muted/30">
                                      <TableHead className="px-4">Thiết bị thuê</TableHead>
                                      <TableHead>Trạng thái</TableHead>
                                      <TableHead className="text-right">Tiền thuê</TableHead>
                                      <TableHead className="text-right">Tiền cọc</TableHead>
                                      <TableHead className="pr-4 text-right">Thao tác</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {filteredLines.map((line) => {
                                      const estimatedLine = displayEstimatedLineById.get(line.id);
                                      const lineState = getLineStateForLine(line);
                                      const stateConfig = rentalOrderEditableLineStateConfig[lineState];

                                      return (
                                        <TableRow
                                          key={line.id}
                                          className={cn(line.removed && 'bg-muted/30 opacity-70')}
                                        >
                                          <TableCell className="max-w-[300px] px-4">
                                            <div className={cn('truncate font-medium', line.removed && 'line-through')}>
                                              {line.productName} - {line.serialNumber}
                                            </div>
                                            <div className="truncate text-xs text-muted-foreground">
                                              {line.sku || '-'}
                                            </div>
                                            <Input
                                              className="mt-2 h-8"
                                              value={line.note ?? ''}
                                              onChange={(event) => updateLineNote(line.id, event.target.value)}
                                              placeholder="Ghi chú dòng"
                                              disabled={!canEdit || line.removed}
                                            />
                                          </TableCell>
                                          <TableCell>
                                            <Badge
                                              variant="outline"
                                              className={cn('whitespace-nowrap', stateConfig.className)}
                                            >
                                              {stateConfig.label}
                                            </Badge>
                                          </TableCell>
                                          <TableCell
                                            className={cn('text-right tabular-nums', line.removed && 'line-through')}
                                          >
                                            {estimatedLine ? formatCurrency(estimatedLine.rentalSubtotal) : '-'}
                                          </TableCell>
                                          <TableCell
                                            className={cn('text-right tabular-nums', line.removed && 'line-through')}
                                          >
                                            {estimatedLine ? formatCurrency(estimatedLine.depositAmount) : '-'}
                                          </TableCell>
                                          <TableCell className="pr-4 text-right">
                                            {line.removed ? (
                                              <Button
                                                type="button"
                                                size="sm"
                                                variant="outline"
                                                onClick={() => restoreLine(line.id)}
                                                disabled={!canEdit}
                                              >
                                                <IconArrowBackUp className="mr-1.5 size-4" />
                                                Khôi phục
                                              </Button>
                                            ) : (
                                              <Button
                                                type="button"
                                                size="icon"
                                                variant="ghost"
                                                onClick={() => removeLine(line.id)}
                                                aria-label={`Xóa ${line.productName}`}
                                                disabled={!canEdit}
                                              >
                                                <IconTrash className="size-4" />
                                              </Button>
                                            )}
                                          </TableCell>
                                        </TableRow>
                                      );
                                    })}
                                  </TableBody>
                                </Table>
                              </div>
                            ) : (
                              <EmptyBox>Không có thiết bị phù hợp bộ lọc.</EmptyBox>
                            )
                          ) : (
                            <EmptyBox>Chưa có thiết bị trong đơn.</EmptyBox>
                          )}
                          <Separator className="mb-2" />

                          {!hasValidRange ? <EmptyBox>Chọn thời gian thuê trước.</EmptyBox> : null}
                          <div className="-m-4">
                            <RentalOrderAssetSelectionTable assetTable={assetTable} className="h-[200px]" />
                          </div>
                        </TabsContent>

                        <TabsContent value="notes" className="mt-0">
                          <div className="grid gap-3 sm:grid-cols-2">
                            <Controller
                              control={form.control}
                              name="note"
                              render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                  <FieldLabel htmlFor={field.name}>Ghi chú khách hàng</FieldLabel>
                                  <Textarea {...field} id={field.name} aria-invalid={fieldState.invalid} />
                                  {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
                                </Field>
                              )}
                            />
                            <Controller
                              control={form.control}
                              name="internalNote"
                              render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                  <FieldLabel htmlFor={field.name}>Ghi chú nội bộ</FieldLabel>
                                  <Textarea {...field} id={field.name} aria-invalid={fieldState.invalid} />
                                  {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
                                </Field>
                              )}
                            />
                          </div>
                        </TabsContent>

                        <TabsContent value="history" className="mt-0">
                          <div className="grid gap-4 xl:grid-cols-2">
                            <DetailCard
                              icon={<IconHistory className="size-4 text-primary" />}
                              title="Lịch sử trạng thái"
                            >
                              <StatusTimeline order={order} />
                            </DetailCard>

                            <DetailCard
                              icon={<IconCreditCard className="size-4 text-primary" />}
                              title="Lịch sử thanh toán"
                              action={
                                <Button
                                  size="sm"
                                  variant="default"
                                  className="shrink-0"
                                  // disabled={!canRecordPayment}
                                  onClick={() => setOpen('payment')}
                                >
                                  <IconCreditCard className="mr-1.5 size-4" />
                                  Ghi nhận thanh toán
                                </Button>
                              }
                            >
                              <PaymentsList order={order} />
                            </DetailCard>
                            <div className="xl:col-end-2">
                              <DetailCard icon={<IconEdit className="size-4 text-primary" />} title="Nhật ký thay đổi">
                                <OrderLogsTimeline order={order} />
                              </DetailCard>
                            </div>
                          </div>
                        </TabsContent>
                      </CardContent>
                    </Card>
                  </Tabs>

                  <aside className="min-w-0 space-y-5 lg:sticky lg:top-5 lg:self-start">
                    <DetailCard
                      icon={<IconCash className="size-4" />}
                      title="Tóm tắt sau cập nhật"
                      className="uppercase"
                    >
                      <div className="space-y-3">
                        <Info
                          line
                          label="Thời lượng"
                          value={
                            hasValidRange
                              ? formatRentalDuration({ from: range.from, to: range.to })
                              : 'Chưa chọn thời gian'
                          }
                        />
                        <Info line label="Số thiết bị" value={`${activeLines.length} máy`} />
                        <Info line label="Tiền thuê hiện tại" value={formatCurrency(order.rentalFeeTotal)} />
                        <Info line label="Cọc theo thiết bị hiện tại" value={formatCurrency(order.depositTotal)} />
                        <Separator />
                        <Info line label="Tạm tính tiền thuê" value={formatCurrency(currentRentalTotal)} />
                        <Info line label="Phí giao" value={formatCurrency(currentDeliveryFeeTotal)} />
                        <Info
                          line
                          label="Giảm giá"
                          value={formatCurrency(discountTotal)}
                          tone={discountTotal > 0 ? 'success' : 'default'}
                        />
                        <Info
                          line
                          label="Tiền thuê & phí giữ lại"
                          value={formatCurrency(currentNetRental)}
                          tone="default"
                        />

                        <Info
                          line
                          label="Tiền cọc cần thu"
                          value={formatCurrency(currentDepositTotal)}
                          tone="warning"
                        />
                        <Info
                          line
                          label="Tổng yêu cầu khi giao"
                          value={formatCurrency(currentHandoverRequiredTotal)}
                          tone="warning"
                        />
                        {currentForfeitedBookingHoldTotal > 0 ? (
                          <Info
                            line
                            label="Phí giữ lịch bị giữ lại"
                            value={formatCurrency(currentForfeitedBookingHoldTotal)}
                            tone="warning"
                          />
                        ) : null}
                        <Info line label="Đã thu" value={formatCurrency(order.financials.paidTotal)} tone="success" />
                        {currentForfeitedBookingHoldTotal > 0 ? (
                          <Info
                            line
                            label="Được cấn trừ"
                            value={formatCurrency(currentPaidCreditTotal)}
                            tone="success"
                          />
                        ) : null}
                        <Info
                          line
                          label="Cần thu khi bàn giao"
                          value={formatCurrency(currentAmountDueAtHandover)}
                          tone={currentAmountDueAtHandover > 0 ? 'warning' : 'success'}
                        />
                        <Info
                          line
                          label="Dự kiến hoàn cọc"
                          value={formatCurrency(currentEstimatedRefund)}
                          tone="default"
                        />
                      </div>
                    </DetailCard>
                  </aside>
                </div>
              </fieldset>
            </form>
          ) : null}
        </ScrollArea>

        <DialogFooter className="border-t px-5 py-4">
          <Button type="button" variant="outline" onClick={handleClose}>
            Hủy
          </Button>
          <Button type="submit" form="rental-order-update-form" disabled={!canSubmit}>
            {updateOrder.isPending ? <IconLoader className="mr-2 size-4 animate-spin" /> : null}
            Lưu thay đổi
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function OrderHeader({ order }: { order: IRentalOrderOut }) {
  const { startDate, endDate } = order.rentalPeriod;
  const durationLabel = formatRentalDuration({ from: new Date(startDate), to: new Date(endDate) });
  const periodLabel =
    [formatDate(startDate, 'shortDateTime'), formatDate(endDate, 'shortDateTime')].filter(Boolean).join(' - ') || '-';

  return (
    <DialogHeader className="min-w-0">
      <DialogTitle className="flex flex-wrap items-center gap-x-2 gap-y-1 leading-6">
        Cập nhật đơn thuê
        <CopyText text={String(order.code)} className="py-1 font-bold text-primary underline">
          <span>#{order.code}</span>
        </CopyText>
        <BadgeCustom status={order.status} config={orderStatusConfig} />
        <BadgeCustom status={order.paymentStatus} config={paymentStatusConfig} />
        <BadgeCustom status={order.refundStatus} config={refundStatusConfig} />
      </DialogTitle>
      <DialogDescription className="mt-1 flex flex-wrap items-center gap-1 font-medium">
        {periodLabel} -{' '}
        <Badge variant="outline" className="shrink-0">
          {durationLabel}
        </Badge>
      </DialogDescription>
    </DialogHeader>
  );
}
