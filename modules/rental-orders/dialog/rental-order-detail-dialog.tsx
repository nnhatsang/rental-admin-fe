'use client';

import {
  Timeline,
  TimelineContent,
  TimelineDate,
  TimelineHeader,
  TimelineIndicator,
  TimelineItem,
  TimelineSeparator,
  TimelineTitle,
} from '@/components/reui/timeline';
import { BadgeCustom } from '@/components/shared/badge-custom';
import { DetailCard, Info } from '@/components/shared/card-custom';
import { CopyText } from '@/components/shared/copy-text';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
  IconCalendarTime,
  IconCash,
  IconClipboardList,
  IconCreditCard,
  IconExternalLink,
  IconHistory,
  IconPackage,
  IconUser,
} from '@tabler/icons-react';
import type { ReactNode } from 'react';
import {
  collateralTypeConfig,
  orderStatusConfig,
  paymentKindConfig,
  paymentStatusConfig,
  pickupMethodConfig,
} from '../display-config';
import { useGetRentalOrderById } from '../hooks/use-get-rental-order-by-id';
import { useRentalOrders } from '../rental-orders-provider';
import type { IRentalOrderOut } from '../type';
import {
  calculateAmountDueAtHandover,
  calculateAmountDueNow,
  canUseRentalOrderAction,
  formatRentalDuration,
} from '../utils';

type RentalOrderDetailDialogProps = {
  orderId?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function EmptyState({ children }: { children: ReactNode }) {
  return <p className="rounded-md border border-dashed bg-muted/20 p-4 text-sm text-muted-foreground">{children}</p>;
}

function DetailSkeleton() {
  return (
    <div className="space-y-5 p-5">
      <div className="grid gap-3 sm:grid-cols-4">
        <Skeleton className="h-20" />
        <Skeleton className="h-20" />
        <Skeleton className="h-20" />
        <Skeleton className="h-20" />
      </div>
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-5">
          <Skeleton className="h-36" />
          <Skeleton className="h-64" />
          <Skeleton className="h-48" />
        </div>
        <div className="space-y-5">
          <Skeleton className="h-80" />
          <Skeleton className="h-40" />
        </div>
      </div>
    </div>
  );
}

function RentalOrderDetailHeader({ order }: { order: IRentalOrderOut }) {
  const { startDate, endDate } = order.rentalPeriod;
  const durationLabel = formatRentalDuration({ from: new Date(startDate), to: new Date(endDate) });
  const periodLabel =
    [formatDate(startDate, 'shortDateTime'), formatDate(endDate, 'shortDateTime')].filter(Boolean).join(' - ') || '-';

  return (
    <DialogHeader className="min-w-0">
      <DialogTitle className="flex flex-wrap items-center gap-x-2 gap-y-1 leading-6">
        Chi tiết đơn thuê
        <CopyText text={String(order.code)} className="py-1 font-bold text-primary underline">
          <span>#{order.code}</span>
        </CopyText>
        <BadgeCustom status={order.status} config={orderStatusConfig} />
        <BadgeCustom status={order.paymentStatus} config={paymentStatusConfig} />
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

function RentalOrderItemsTable({ order }: { order: IRentalOrderOut }) {
  if (!order.items.length) return <EmptyState>Chưa có thiết bị trong đơn.</EmptyState>;

  return (
    <div className="w-full min-w-0 overflow-x-auto">
      <Table className="min-w-[1040px]">
        <TableHeader>
          <TableRow className="bg-muted/30 hover:bg-muted/30">
            <TableHead className="px-4">Thiết bị</TableHead>
            <TableHead>Cách tính</TableHead>
            <TableHead className="text-right">Tiền thuê</TableHead>
            <TableHead className="text-right">Tiền cọc</TableHead>
            <TableHead className="text-right">Giữ lịch</TableHead>
            <TableHead className="pr-4 text-right">Thành tiền</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {order.items.map((item) => {
            const productName = item.productSnapshot?.name ?? item.product?.name ?? '-';
            const sku = item.productSnapshot?.sku ?? item.product?.sku;
            const serialNumber = item.assetUnitSnapshot?.serialNumber ?? item.assetUnit?.serialNumber ?? '-';
            const tierLabel = item.pricing.appliedTier?.name ?? item.pricing.pricingLabel;

            return (
              <TableRow key={item.id}>
                <TableCell className="max-w-[260px] px-4">
                  <div className="truncate font-medium">{productName}- {serialNumber}</div>
                  <div className="truncate text-xs text-muted-foreground">{sku ?? '-'}</div>
                  {item.note ? <div className="mt-1 truncate text-xs text-muted-foreground">{item.note}</div> : null}
                </TableCell>
                <TableCell className="max-w-[220px]">
                  <div className="truncate text-sm font-medium">{tierLabel}</div>
                  <div className="text-xs text-muted-foreground">
                    {item.pricing.billableDays ? `${item.pricing.billableDays} ngày` : null}
                    {item.pricing.billableHalfDays
                      ? `${item.pricing.billableDays ? ' + ' : ''}${item.pricing.billableHalfDays} nửa ngày`
                      : null}
                    {!item.pricing.billableDays && !item.pricing.billableHalfDays
                      ? `${item.pricing.durationHours} giờ`
                      : null}
                  </div>
                </TableCell>
                <TableCell className="text-right tabular-nums">{formatCurrency(item.pricing.unitPrice)}</TableCell>
                <TableCell className="text-right tabular-nums">{formatCurrency(item.pricing.depositAmount)}</TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatCurrency(item.pricing.bookingHoldAmount)}
                </TableCell>
                <TableCell className="pr-4 text-right font-semibold tabular-nums">
                  {formatCurrency(item.pricing.lineTotal)}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

function PaymentsList({ order }: { order: IRentalOrderOut }) {
  if (!order.payments.length) return <EmptyState>Chưa ghi nhận thanh toán.</EmptyState>;

  return (
    <Timeline defaultValue={order.payments.length - 1}>
      {order.payments.map((payment, index) => (
        <TimelineItem key={payment.id} step={index}>
          <TimelineHeader>
            <TimelineDate>{formatDate(payment.createdAt)}</TimelineDate>
            <TimelineTitle>{paymentKindConfig[payment.kind]?.label ?? payment.kind}</TimelineTitle>
          </TimelineHeader>
          <TimelineIndicator />
          <TimelineSeparator />
          <TimelineContent>
            <div className="space-y-1">
              <div className="font-medium">{formatCurrency(payment.amount)}</div>
              {payment.referenceCode ? (
                <div className="text-xs text-muted-foreground">Mã tham chiếu: {payment.referenceCode}</div>
              ) : null}
              {payment.note ? <div>{payment.note}</div> : null}
            </div>
          </TimelineContent>
        </TimelineItem>
      ))}
    </Timeline>
  );
}

function StatusTimeline({ order }: { order: IRentalOrderOut }) {
  if (!order.statusHistories.length) return <EmptyState>Chưa có lịch sử trạng thái.</EmptyState>;

  return (
    <Timeline defaultValue={order.statusHistories.length - 1}>
      {order.statusHistories.map((history, index) => (
        <TimelineItem key={history.id} step={index}>
          <TimelineHeader>
            <TimelineDate>{formatDate(history.createdAt)}</TimelineDate>
            <TimelineTitle>{orderStatusConfig[history.toStatus]?.label ?? history.toStatus}</TimelineTitle>
          </TimelineHeader>
          <TimelineIndicator />
          <TimelineSeparator />
          <TimelineContent>{history.note}</TimelineContent>
        </TimelineItem>
      ))}
    </Timeline>
  );
}

function RentalOrderDetail({ order }: { order: IRentalOrderOut }) {
  const { setOpen } = useRentalOrders();
  const { customerSnapshot, financials, fulfillment, notes, rentalPeriod } = order;
  const amountDue = calculateAmountDueNow({ status: order.status, ...financials });
  const amountDueAtHandover = calculateAmountDueAtHandover({ status: order.status, ...financials });
  const bookingHoldDue = Math.max(financials.bookingHoldTotal - financials.paidTotal, 0);
  const canRecordPayment = canUseRentalOrderAction(order.status, 'recordPayment');
  const pickupMethod = pickupMethodConfig[fulfillment.pickupMethod];
  const collateralType = collateralTypeConfig[fulfillment.collateralType ?? 'NONE'];
  const PickupIcon = pickupMethod.icon;
  const socialContact = customerSnapshot.socialContact;

  return (
    <div className="space-y-5 p-1">
      <div className="grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="min-w-0 space-y-5">
          <div className="grid gap-5 md:grid-cols-2">
            <DetailCard icon={<IconUser className="size-4" />} title="Khách hàng">
              <div className="grid gap-4 md:grid-cols-2">
                <Info label="Tên khách hàng" value={customerSnapshot.name} />
                <Info label="Số điện thoại" value={customerSnapshot.phone} />
                <Info label="CCCD/CMND" value={customerSnapshot.identityNumber} />
                <Info label="Email" value={customerSnapshot.email} />
                <Info label="Địa chỉ" className="sm:col-span-2" value={customerSnapshot.address} />
                {socialContact ? (
                  <Info
                    label=""
                    className="flex items-center sm:col-span-2"
                    value={
                      <Button asChild variant="outline" size="sm" className="h-8 gap-1.5">
                        <a href={socialContact} target="_blank" rel="noopener noreferrer">
                          <IconExternalLink className="size-3.5" />
                          Mở trang cá nhân
                        </a>
                      </Button>
                    }
                  />
                ) : null}
              </div>
            </DetailCard>

            <DetailCard
              icon={<IconCalendarTime className="size-4" />}
              title={
                <div className="flex items-center gap-2">
                  <span>Thời gian & Nhận hàng</span>
                  <Badge>
                    {formatRentalDuration({
                      from: new Date(rentalPeriod.startDate),
                      to: new Date(rentalPeriod.endDate),
                    })}
                  </Badge>
                </div>
              }
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <Info label="Ngày nhận" value={formatDate(rentalPeriod.startDate, 'shortDateTime')} />
                <Info label="Ngày trả" value={formatDate(rentalPeriod.endDate, 'shortDateTime')} />
                <Info
                  label="Nhận thực tế"
                  value={
                    rentalPeriod.actualPickupDate ? formatDate(rentalPeriod.actualPickupDate, 'shortDateTime') : '-'
                  }
                />
                <Info
                  label="Trả thực tế"
                  value={
                    rentalPeriod.actualReturnDate ? formatDate(rentalPeriod.actualReturnDate, 'shortDateTime') : '-'
                  }
                />
                <Info
                  label="Phương thức nhận"
                  value={
                    <span className="inline-flex items-center gap-1.5">
                      {PickupIcon ? <PickupIcon className="size-4 text-primary" /> : null}
                      {pickupMethod.label}
                    </span>
                  }
                />
                <Info label="Phí giao" value={formatCurrency(financials.deliveryFeeTotal)} />
                <Info label="Địa chỉ giao" className="sm:col-span-2" value={fulfillment.deliveryAddress} />
                <Info label="Loại thế chấp" value={collateralType.label} />
                <Info label="Tài sản/giấy tờ giữ" value={fulfillment.collateralDescription} />
              </div>
            </DetailCard>
          </div>

          <DetailCard
            action={<Badge className="shrink-0">{order.items.length} máy</Badge>}
            icon={<IconPackage className="size-4" />}
            title="Danh sách thiết bị"
          >
            <div className="-m-4!">
              <RentalOrderItemsTable order={order} />
            </div>
          </DetailCard>

          <div className="grid gap-5 lg:grid-cols-2">
            <DetailCard
              icon={<IconCreditCard className="size-4" />}
              title="Lịch sử thanh toán"
              action={
                <Button
                  size="sm"
                  variant="outline"
                  className="-mr-3"
                  disabled={!canRecordPayment}
                  onClick={() => setOpen('payment')}
                >
                  <IconCreditCard className="mr-1.5 size-4" />
                  Ghi nhận thanh toán
                </Button>
              }
            >
              <div className="p-2">
                <PaymentsList order={order} />
              </div>
            </DetailCard>
            <DetailCard icon={<IconHistory className="size-4" />} title="Lịch sử đơn thuê">
              <StatusTimeline order={order} />
            </DetailCard>
          </div>
        </div>

        <aside className="min-w-0 space-y-5 xl:sticky xl:top-5 xl:self-start">
          <DetailCard icon={<IconCash className="size-4" />} title="Chi tiết tài chính">
            <div className="space-y-2">
              <Info line label="Tiền thuê dự kiến" value={formatCurrency(financials.rentalFeeTotal)} />
              <Info line label="Phí giao" value={formatCurrency(financials.deliveryFeeTotal)} />
              <Info
                line
                label="Giảm giá"
                value={formatCurrency(financials.discountTotal)}
                tone={financials.discountTotal > 0 ? 'success' : 'default'}
              />
              <Info line label="Phí trễ hạn" value={formatCurrency(financials.lateFeeTotal)} />
              <Info line label="Phí hư hỏng" value={formatCurrency(financials.damageFeeTotal)} />
              <Info line label="Bồi thường" value={formatCurrency(financials.compensationFeeTotal)} />
              <Separator />
              <Info line label="Tiền thuê & phí giữ lại" value={formatCurrency(financials.chargeTotal)} />
              <Info line label="Tiền cọc/tạm ứng" value={formatCurrency(financials.depositTotal)} />
              <Info line label="Cọc áp dụng khi giao" value={formatCurrency(financials.adjustedDepositTotal)} />
              <Info line label="Tổng yêu cầu khi giao" value={formatCurrency(financials.handoverRequiredTotal)} />
              <Info line label="Phí giữ lịch" value={formatCurrency(financials.bookingHoldTotal)} />
              <Info
                line
                label="Đã thanh toán"
                value={formatCurrency(financials.paidTotal)}
                tone={financials.paidTotal > 0 ? 'success' : 'warning'}
              />
              <Separator />
              <Info
                line
                label="Cần thu giữ lịch"
                value={formatCurrency(bookingHoldDue)}
                tone={bookingHoldDue > 0 ? 'warning' : 'default'}
              />
              <Info
                line
                label="Cần thu khi giao"
                value={formatCurrency(amountDueAtHandover)}
                tone={amountDueAtHandover > 0 ? 'warning' : 'default'}
              />
              <Info
                line
                label="Cần thu hiện tại"
                value={formatCurrency(amountDue)}
                tone={amountDue > 0 ? 'warning' : 'default'}
              />
              <Info
                line
                label="Ước tính hoàn cọc"
                className="bg-muted p-2 border font-bold "
                value={formatCurrency(financials.estimatedRefundTotal)}
              />
              <Info line label="Đã hoàn" value={formatCurrency(financials.actualRefundTotal)} />
            </div>
          </DetailCard>

          <DetailCard icon={<IconClipboardList className="size-4" />} title="Ghi chú">
            <div className="space-y-2">
              <Info label="Ghi chú đơn hàng" value={notes.customerNote} />
              <Info label="Ghi chú nội bộ" value={notes.internalNote} />
              <Info label="Lý do hủy" tone={notes.cancelReason ? 'error' : 'default'} value={notes.cancelReason} />
            </div>
          </DetailCard>
        </aside>
      </div>
    </div>
  );
}

export function RentalOrderDetailDialog({ orderId, open, onOpenChange }: RentalOrderDetailDialogProps) {
  const query = useGetRentalOrderById(open ? orderId : undefined);
  const order = query.data;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-7xl">
        {order ? <RentalOrderDetailHeader order={order} /> : null}
        {!order ? (
          <DialogHeader>
            <DialogTitle>Chi tiết đơn thuê</DialogTitle>
            <DialogDescription>Thông tin đơn sẽ được tải theo mã đơn.</DialogDescription>
          </DialogHeader>
        ) : null}
        <ScrollArea className="h-[calc(92dvh-105px)]">
          {query.isLoading ? <DetailSkeleton /> : null}
          {!query.isLoading && !order ? (
            <div className="p-5">
              <EmptyState>Không tìm thấy đơn thuê.</EmptyState>
            </div>
          ) : null}
          {order ? <RentalOrderDetail order={order} /> : null}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
