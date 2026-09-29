'use client';

import { ProtectedAction } from '@/components/shared/protected-action';
import { CopyText } from '@/components/shared/copy-text';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
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
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from '@/components/ui/empty';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { cn, formatCurrency, formatDate } from '@/lib/utils';
import { getRentalOrderFinancialSummary, getRentalOrderNextAction, getRentalOrderOperationalBadges, type RentalOrderOperationalBadge } from '../../display-semantics';
import { PermissionCode } from '@/utils/consts/rbac.const';
import {
  IconEdit,
  IconPackageExport,
  IconPackageImport,
  IconReceipt,
  IconRotateClockwise,
  IconTool,
  IconWallet,
  IconX,
} from '@tabler/icons-react';
import { useRentalOrderActions } from '../../hooks/mutations';
import { useGetRentalOrderById } from '../../hooks/queries';
import { paymentMethods, sourceLabel } from '../../constants';
import {
  handoverStatusConfig,
  orderStatusConfig,
  rentalOrderChargeKindConfig,
  rentalOrderChargeStatusConfig,
  rentalInspectionConditionConfig,
  rentalOrderAllocationStatusConfig,
  rentalOrderPaymentStatusConfig,
  rentalOrderRefundStatusConfig,
  returnStatusConfig,
  settlementStatusConfig,
} from '../../display-config';
import type { PaymentMethod, RentalOrderDetail } from '../../model';
import { RentalOrderBadge } from '../status-badge';
import { useRentalOrders } from '../../rental-orders-provider';

const paymentMethodLabel = (method: PaymentMethod) =>
  paymentMethods.find((option) => option.value === method)?.label ?? method;

const detailSurfaceClass = 'bg-card shadow-xs border border-accent shadow-none ring-0';

function DetailMetric({
  label,
  value,
  helper,
  valueClassName,
}: {
  label: string;
  value: string;
  helper?: string;
  valueClassName?: string;
}) {
  return (
    <div className="grid gap-1 rounded-lg bg-muted/20 p-3">
      <span className="text-xs text-muted-foreground">{label}</span>
      <strong className={cn('text-sm', valueClassName)}>{value}</strong>
      {helper ? <span className="text-xs text-muted-foreground">{helper}</span> : null}
    </div>
  );
}

function DetailField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1">
      <span className="text-xs text-muted-foreground">{label}</span>
      <div className="font-medium">{children}</div>
    </div>
  );
}

function DetailOperationalBadge({ badge }: { badge: RentalOrderOperationalBadge }) {
  if (badge.kind === 'handover') {
    return <RentalOrderBadge config={handoverStatusConfig[badge.status]} label={badge.label} />;
  }

  if (badge.kind === 'return') {
    return <RentalOrderBadge config={returnStatusConfig[badge.status]} label={badge.label} />;
  }

  return <RentalOrderBadge config={settlementStatusConfig[badge.status]} label={badge.label} />;
}

function SocialContactValue({ value }: { value?: string | null }) {
  const socialContact = value?.trim();

  if (!socialContact) {
    return <span className="text-muted-foreground">Chưa có</span>;
  }

  const href = /^https?:\/\//i.test(socialContact) ? socialContact : `https://${socialContact}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="break-all text-primary underline underline-offset-4"
    >
      {socialContact}
    </a>
  );
}

function RentalChargeBreakdown({ charges }: { charges: RentalOrderDetail['charges'] }) {
  return (
    <div className="grid gap-3 border-t border-accent/60 pt-4">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div className="grid gap-1">
          <h4 className="text-sm font-medium">Chi tiết các khoản phí</h4>
          <p className="text-xs text-muted-foreground">Theo dõi trạng thái thanh toán và khả năng hoàn của từng khoản.</p>
        </div>
        <span className="text-xs text-muted-foreground">{charges.length} khoản</span>
      </div>

      {charges.length ? (
        <div className="divide-y divide-accent/60 rounded-lg border border-accent/60">
          {charges.map((charge) => {
            const kindConfig = rentalOrderChargeKindConfig[charge.kind];
            const statusConfig = rentalOrderChargeStatusConfig[charge.status];

            return (
              <div key={charge.id} className="grid gap-2 px-3 py-3 sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:items-center">
                <div className="grid min-w-0 gap-1">
                  <span className="truncate text-sm font-medium">{kindConfig.label}</span>
                  <span className="text-xs text-muted-foreground">
                    {charge.refundable ? 'Có thể hoàn' : 'Không hoàn'}
                  </span>
                </div>
                <RentalOrderBadge config={statusConfig} />
                <span className="text-sm font-semibold sm:text-right">{formatCurrency(charge.amount)}</span>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-lg bg-muted/20 px-3 py-4 text-sm text-muted-foreground">Chưa phát sinh khoản phí nào.</div>
      )}
    </div>
  );
}

function RentalOrderFinancialSummary({ order }: { order: RentalOrderDetail }) {
  const financials = order.financials;
  const financialSummary = getRentalOrderFinancialSummary(order);
  const otherChargeTotal = order.charges
    .filter((charge) => charge.kind === 'OTHER_CHARGE' && charge.status !== 'WAIVED' && charge.status !== 'CANCELLED')
    .reduce((total, charge) => total + charge.amount, 0);

  return (
    <Card className={detailSurfaceClass}>
      <CardHeader className="gap-3 sm:flex sm:flex-row sm:items-start sm:justify-between">
        <div className="grid gap-1">
          <CardTitle>Tài chính</CardTitle>
          <CardDescription>Chi tiết nghĩa vụ, phát sinh và dòng tiền của đơn thuê.</CardDescription>
        </div>
        <RentalOrderBadge config={settlementStatusConfig[financialSummary.badgeStatus]} label={financialSummary.label} />
      </CardHeader>
      <CardContent className="grid gap-5">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <DetailMetric
            label="Tổng nghĩa vụ"
            value={formatCurrency(financials.totalCustomerObligation)}
            valueClassName="text-primary"
          />
          <DetailMetric label="Đã thu" value={formatCurrency(financials.paidTotal)} valueClassName="text-primary" />
          <DetailMetric
            label="Tài chính cần xử lý"
            value={financialSummary.amount > 0 ? formatCurrency(financialSummary.amount) : 'Không cần xử lý'}
            valueClassName={financialSummary.isActionRequired ? 'text-destructive' : undefined}
            helper={`${financialSummary.label} · ${financialSummary.description}`}
          />
          <DetailMetric
            label="Đã thu / Tổng nghĩa vụ"
            value={`${formatCurrency(financials.paidTotal)} / ${formatCurrency(financials.totalCustomerObligation)}`}
            helper="Chỉ giao máy khi đủ khoản phải thu theo chính sách."
          />
        </div>

        <div className="grid gap-3 border-t border-accent/60 pt-4">
          <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Cấu phần nghĩa vụ</div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <DetailMetric label="Tiền thuê" value={formatCurrency(financials.rentalFeeTotal)} />
            <DetailMetric label="Phí giao máy" value={formatCurrency(financials.deliveryFeeTotal)} />
            <DetailMetric label="Giữ lịch" value={formatCurrency(financials.bookingHoldTotal)} />
            <DetailMetric label="Tiền cọc" value={formatCurrency(financials.securityDepositTotal)} />
          </div>
        </div>

        <div className="grid gap-3 border-t border-accent/60 pt-4">
          <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Khoản phát sinh</div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <DetailMetric label="Phí trễ hạn" value={formatCurrency(financials.lateFeeTotal)} />
            <DetailMetric label="Bồi thường hư hỏng" value={formatCurrency(financials.damageCompensationTotal)} />
            <DetailMetric label="Phí hủy" value={formatCurrency(financials.cancellationFeeTotal)} />
            <DetailMetric label="Phí khác" value={formatCurrency(otherChargeTotal)} />
          </div>
        </div>

        <div className="grid gap-3 border-t border-accent/60 pt-4">
          <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Đối soát thu và hoàn</div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <DetailMetric label="Còn cần thu khi đặt lịch" value={formatCurrency(financials.amountDueAtBooking)} />
            <DetailMetric
              label="Cần thu thêm"
              value={formatCurrency(financials.additionalChargeDue)}
              valueClassName={financials.additionalChargeDue > 0 ? 'text-destructive' : undefined}
              helper="Sau kiểm tra trả máy"
            />
            <DetailMetric
              label="Còn phải hoàn"
              value={formatCurrency(financials.refundDue)}
              valueClassName={financials.refundDue > 0 ? 'text-chart-5' : undefined}
              helper="Khoản còn phải chuyển cho khách"
            />
            <DetailMetric
              label="Đang chờ hoàn"
              value={formatCurrency(financialSummary.pendingRefundTotal)}
              valueClassName={financialSummary.pendingRefundTotal > 0 ? 'text-chart-5' : undefined}
              helper="Đã tạo yêu cầu, chưa xác nhận đã chuyển"
            />
            <DetailMetric
              label="Đã hoàn thực tế"
              value={formatCurrency(financials.actualRefundTotal)}
              valueClassName={financials.actualRefundTotal > 0 ? 'text-primary' : undefined}
              helper="Đã xác nhận hoàn cho khách"
            />
          </div>
        </div>

        <RentalChargeBreakdown charges={order.charges} />
      </CardContent>
    </Card>
  );
}

function RentalOrderNotesCard({ order }: { order: RentalOrderDetail }) {
  const hasCancellation = order.status === 'CANCELLED' || Boolean(order.notes.cancelReason);

  return (
    <Card className={detailSurfaceClass}>
      <CardHeader>
        <CardTitle>{hasCancellation ? 'Ghi chú và thông tin hủy' : 'Ghi chú đơn thuê'}</CardTitle>
        <CardDescription>
          {hasCancellation ? 'Lý do hủy và các ghi chú được lưu cùng đơn.' : 'Thông tin trao đổi và ghi chú vận hành của đơn.'}
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-3">
        <DetailField label="Ghi chú khách hàng">
          <p className="whitespace-pre-wrap break-words text-sm font-normal">{order.notes.customerNote || 'Chưa có ghi chú'}</p>
        </DetailField>
        <DetailField label="Ghi chú nội bộ">
          <p className="whitespace-pre-wrap break-words text-sm font-normal">{order.notes.internalNote || 'Chưa có ghi chú'}</p>
        </DetailField>
        <DetailField label="Lý do hủy">
          <p className={cn('whitespace-pre-wrap break-words text-sm font-normal', order.notes.cancelReason && 'text-destructive')}>
            {order.notes.cancelReason || 'Đơn chưa bị hủy'}
          </p>
        </DetailField>
      </CardContent>
    </Card>
  );
}

function DetailLoading() {
  return (
    <div className="grid gap-4 px-6 py-5">
      <div className="grid gap-4 lg:grid-cols-3">
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
      </div>
      <Skeleton className="h-48" />
      <Skeleton className="h-40" />
    </div>
  );
}

function OverviewTab({ order }: { order: RentalOrderDetail }) {
  const totalDevices = order.lines.reduce((sum, line) => sum + line.quantity, 0);
  const totalAllocations = order.lines.reduce((sum, line) => sum + line.allocations.length, 0);

  return (
    <div className="grid gap-4">
      <div className="grid gap-4 lg:grid-cols-3">
        <Card size="sm" className={detailSurfaceClass}>
          <CardHeader>
            <CardTitle>Khách hàng</CardTitle>
            <CardDescription>Thông tin tại thời điểm tạo đơn</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            <DetailField label="Họ tên">{order.customerSnapshot.name}</DetailField>
            <DetailField label="Số điện thoại">{order.customerSnapshot.phone ?? '—'}</DetailField>
            <DetailField label="Email">{order.customerSnapshot.email ?? '—'}</DetailField>
            <DetailField label="Liên hệ mạng xã hội">
              <SocialContactValue value={order.customerSnapshot.socialContact} />
            </DetailField>
            <DetailField label="CCCD/Giấy tờ">{order.customerSnapshot.identityNumber ?? '—'}</DetailField>
          </CardContent>
        </Card>

        <Card size="sm" className={detailSurfaceClass}>
          <CardHeader>
            <CardTitle>Lịch thuê</CardTitle>
            <CardDescription>Thời gian kế hoạch và thực tế</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            <DetailField label="Bắt đầu">{formatDate(order.rentalPeriod.startDate, 'shortDateTime')}</DetailField>
            <DetailField label="Kết thúc">{formatDate(order.rentalPeriod.endDate, 'shortDateTime')}</DetailField>
            <DetailField label="Nhận máy thực tế">
              {order.rentalPeriod.actualPickupDate
                ? formatDate(order.rentalPeriod.actualPickupDate, 'shortDateTime')
                : 'Chưa nhận'}
            </DetailField>
            <DetailField label="Trả máy thực tế">
              {order.rentalPeriod.actualReturnDate
                ? formatDate(order.rentalPeriod.actualReturnDate, 'shortDateTime')
                : 'Chưa trả'}
            </DetailField>
          </CardContent>
        </Card>

        <Card size="sm" className={detailSurfaceClass}>
          <CardHeader>
            <CardTitle>Vận hành</CardTitle>
            <CardDescription>
              {sourceLabel[order.source]} · {totalDevices} sản phẩm
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            <DetailField label="Trạng thái đơn">
              <RentalOrderBadge config={orderStatusConfig[order.status]} />
            </DetailField>
            <DetailField label="Bước vận hành">
              <div className="flex flex-wrap gap-1.5">
                {getRentalOrderOperationalBadges(order).map((badge) => (
                  <DetailOperationalBadge key={badge.kind} badge={badge} />
                ))}
              </div>
            </DetailField>
            <DetailField label="Hình thức">
              {order.fulfillment.pickupMethod === 'DELIVERY' ? 'Giao máy' : 'Nhận tại cửa hàng'}
            </DetailField>
          </CardContent>
        </Card>
      </div>

      {order.fulfillment.pickupMethod === 'DELIVERY' && order.fulfillment.deliveryAddress ? (
        <Alert>
          <AlertTitle>Địa chỉ giao máy</AlertTitle>
          <AlertDescription>{order.fulfillment.deliveryAddress}</AlertDescription>
        </Alert>
      ) : null}

      <RentalOrderNotesCard order={order} />

      <RentalOrderFinancialSummary order={order} />

      <Card className={detailSurfaceClass}>
        <CardHeader>
          <CardTitle>Thiết bị cho thuê</CardTitle>
          <CardDescription>
            {order.lines.length} loại sản phẩm · {totalAllocations} allocation
          </CardDescription>
        </CardHeader>
        <CardContent>
          {order.lines.length ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Sản phẩm</TableHead>
                  <TableHead>Số lượng</TableHead>
                  <TableHead>Tiền thuê</TableHead>
                  <TableHead>Máy được chọn</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {order.lines.map((line) => (
                  <TableRow key={line.id}>
                    <TableCell className="whitespace-normal">
                      <div className="grid gap-1">
                        <span className="font-medium">{line.productName}</span>
                        <span className="text-xs text-muted-foreground">{line.sku}</span>
                      </div>
                    </TableCell>
                    <TableCell>{line.quantity}</TableCell>
                    <TableCell>{formatCurrency(line.lineRentalTotal)}</TableCell>
                    <TableCell className="whitespace-normal">
                      <div className="flex flex-wrap gap-1">
                        {line.allocations.length ? (
                          line.allocations.map((allocation) => (
                            <RentalOrderBadge
                              key={allocation.id}
                              config={rentalOrderAllocationStatusConfig[allocation.status]}
                              label={`${allocation.serialNumber} · ${rentalOrderAllocationStatusConfig[allocation.status].label}`}
                            />
                          ))
                        ) : (
                          <span className="text-xs text-muted-foreground">Chưa tự chọn máy</span>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <Empty>
              <EmptyHeader>
                <EmptyTitle>Chưa có dòng thuê</EmptyTitle>
                <EmptyDescription>Đơn chưa có sản phẩm được ghi nhận.</EmptyDescription>
              </EmptyHeader>
            </Empty>
          )}
        </CardContent>
      </Card>

      <Card className={detailSurfaceClass}>
        <CardHeader>
          <CardTitle>Biên bản kiểm tra</CardTitle>
          <CardDescription>Thông tin kiểm tra khi bàn giao và nhận trả máy</CardDescription>
        </CardHeader>
        <CardContent>
          {order.inspections.length ? (
            <div className="grid gap-3">
              {order.inspections.map((inspection) => (
                <div key={inspection.id} className="grid gap-2 rounded-lg bg-muted/20 p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="font-medium">
                      {inspection.type === 'HANDOVER' ? 'Kiểm tra bàn giao' : 'Kiểm tra khi trả'}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(inspection.inspectedAt, 'shortDateTime')}
                    </span>
                  </div>
                  {inspection.note ? <p className="text-sm text-muted-foreground">{inspection.note}</p> : null}
                  <div className="grid gap-2 sm:grid-cols-2">
                    {inspection.items.map((item) => (
                      <div key={item.allocationId} className="rounded-md bg-muted/30 p-2 text-sm">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span>{item.allocationId}</span>
                          <RentalOrderBadge config={rentalInspectionConditionConfig[item.condition]} />
                        </div>
                        {item.note ? <div className="mt-1 text-xs text-muted-foreground">{item.note}</div> : null}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Empty>
              <EmptyHeader>
                <EmptyTitle>Chưa có biên bản kiểm tra</EmptyTitle>
                <EmptyDescription>Biên bản sẽ xuất hiện sau khi bàn giao hoặc nhận trả máy.</EmptyDescription>
              </EmptyHeader>
            </Empty>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function PaymentsTab({ order }: { order: RentalOrderDetail }) {
  return (
    <div className="grid gap-4">
      <Card className={detailSurfaceClass}>
        <CardHeader>
          <CardTitle>Lịch sử thanh toán</CardTitle>
          <CardDescription>{order.payments.length} giao dịch</CardDescription>
        </CardHeader>
        <CardContent>
          {order.payments.length ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Thời gian</TableHead>
                  <TableHead>Loại</TableHead>
                  <TableHead>Phương thức</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="text-right">Số tiền</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {order.payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>{formatDate(payment.createdAt, 'shortDateTime')}</TableCell>
                    <TableCell>{payment.direction === 'INBOUND' ? 'Thu vào' : 'Chi ra'}</TableCell>
                    <TableCell>{paymentMethodLabel(payment.method)}</TableCell>
                    <TableCell>
                      <RentalOrderBadge config={rentalOrderPaymentStatusConfig[payment.status]} />
                    </TableCell>
                    <TableCell className="text-right font-medium">{formatCurrency(payment.amount)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <Empty>
              <EmptyHeader>
                <EmptyTitle>Chưa có thanh toán</EmptyTitle>
                <EmptyDescription>Giao dịch của đơn sẽ hiển thị ở đây.</EmptyDescription>
              </EmptyHeader>
            </Empty>
          )}
        </CardContent>
      </Card>

      <Card className={detailSurfaceClass}>
        <CardHeader>
          <CardTitle>Lịch sử hoàn tiền</CardTitle>
          <CardDescription>{order.refunds.length} yêu cầu hoàn</CardDescription>
        </CardHeader>
        <CardContent>
          {order.refunds.length ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Thời gian</TableHead>
                  <TableHead>Phương thức</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="text-right">Số tiền</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {order.refunds.map((refund) => (
                  <TableRow key={refund.id}>
                    <TableCell>{formatDate(refund.createdAt, 'shortDateTime')}</TableCell>
                    <TableCell>{paymentMethodLabel(refund.method)}</TableCell>
                    <TableCell>
                      <RentalOrderBadge config={rentalOrderRefundStatusConfig[refund.status]} />
                    </TableCell>
                    <TableCell className="text-right font-medium">{formatCurrency(refund.amount)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <Empty>
              <EmptyHeader>
                <EmptyTitle>Chưa có yêu cầu hoàn tiền</EmptyTitle>
                <EmptyDescription>Không có khoản hoàn tiền nào được ghi nhận.</EmptyDescription>
              </EmptyHeader>
            </Empty>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function TimelineTab({ order }: { order: RentalOrderDetail }) {
  return (
    <Card className={detailSurfaceClass}>
      <CardHeader>
        <CardTitle>Lịch sử trạng thái</CardTitle>
        <CardDescription>Theo dõi các lần chuyển trạng thái của đơn</CardDescription>
      </CardHeader>
      <CardContent>
        {order.statusHistories.length ? (
          <Timeline defaultValue={order.statusHistories.length} orientation="vertical" className="px-2 py-1">
            {order.statusHistories.map((history, index) => (
              <TimelineItem key={history.id} step={index + 1}>
                <TimelineIndicator></TimelineIndicator>
                <TimelineSeparator />
                <TimelineHeader>
                  <TimelineDate dateTime={history.createdAt}>
                    {formatDate(history.createdAt, 'shortDateTime')}
                  </TimelineDate>
                  <TimelineTitle>
                    {history.fromStatus ? `${orderStatusConfig[history.fromStatus].label} → ` : ''}
                    {orderStatusConfig[history.toStatus].label}
                  </TimelineTitle>
                </TimelineHeader>
                <TimelineContent>{history.note || 'Không có ghi chú cho lần chuyển trạng thái này.'}</TimelineContent>
              </TimelineItem>
            ))}
          </Timeline>
        ) : (
          <Empty>
            <EmptyHeader>
              <EmptyTitle>Chưa có lịch sử trạng thái</EmptyTitle>
              <EmptyDescription>Các thay đổi workflow sẽ được ghi nhận ở đây.</EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
      </CardContent>
    </Card>
  );
}

function RentalOrderDetailFooterSummary({ order }: { order?: RentalOrderDetail }) {
  if (!order) {
    return <div className="min-w-0 flex-1 text-xs text-muted-foreground">Đang tải trạng thái đơn thuê…</div>;
  }

  const pendingRefunds = order.refunds.filter((refund) => refund.status === 'PENDING' || refund.status === 'PROCESSING');
  const pendingRefundTotal = pendingRefunds.reduce((total, refund) => total + refund.amount, 0);
  const nextAction = getRentalOrderNextAction(order);
  const message =
    order.status === 'CANCELLED' && order.notes.cancelReason
      ? `Lý do hủy: ${order.notes.cancelReason}`
      : nextAction.financial.amount > 0
        ? `${nextAction.financial.label}: ${formatCurrency(nextAction.financial.amount)}`
        : nextAction.description;

  return (
    <div className="min-w-0 flex-1 text-xs text-muted-foreground">
      <span className="font-medium text-foreground">Bước tiếp theo: {nextAction.label}</span>
      <span className="mt-0.5 block truncate">{message}</span>
    </div>
  );
}

export function RentalOrderDetailDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { currentRow, setOpen } = useRentalOrders();
  const detailQuery = useGetRentalOrderById(currentRow?.id ?? null, open);
  const order = detailQuery.data;
  const financialSummary = order ? getRentalOrderFinancialSummary(order) : null;
  const orderCode = order?.code ?? currentRow?.code;
  const actions = useRentalOrderActions();
  const pendingRefunds = order?.refunds.filter((refund) => refund.status === 'PENDING' || refund.status === 'PROCESSING') ?? [];
  const pendingRefund = pendingRefunds[0];
  const pendingRefundTotal = pendingRefunds.reduce((total, refund) => total + refund.amount, 0);
  const pendingPayments = order?.payments.filter((payment) => payment.direction === 'INBOUND' && payment.status === 'PENDING') ?? [];
  const remainingRefundDue = order ? Math.max(0, order.financials.refundDue - pendingRefundTotal) : 0;
  const openAction = (action: Parameters<typeof setOpen>[0]) => setOpen(action);

  const canRecordPayment = Boolean(
    order &&
    pendingPayments.length === 0 &&
    order.status !== 'DONE' &&
    order.status !== 'CANCELLED' &&
    (order.settlementStatus === 'PAYMENT_DUE' ||
      order.financials.amountDueBeforeHandover > 0 ||
      order.financials.additionalChargeDue > 0),
  );
  const canHandover = order?.status === 'CONFIRMED';
  const canInspect = order?.status === 'RETURNED' && order.returnStatus === 'RETURNED';
  const canSettle =
    order?.status === 'RETURNED' && order.returnStatus === 'INSPECTED' && order.settlementStatus === 'SETTLED';

  return (
    <Dialog open={open} onOpenChange={onOpenChange} >
      <DialogContent className="sm:max-w-7xl">
        <DialogHeader>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="grid gap-1">
              <DialogTitle>
                {orderCode ? (
                  <CopyText text={String(orderCode)} className="py-1 font-bold text-primary underline">
                    <span>#{orderCode}</span>
                  </CopyText>
                ) : (
                  'Chi tiết đơn thuê'
                )}
              </DialogTitle>
              <DialogDescription>
                {order
                  ? `${order.customerSnapshot.name} · tạo lúc ${formatDate(order.createdAt, 'shortDateTime')}`
                  : 'Đang tải dữ liệu đơn thuê…'}
              </DialogDescription>
            </div>
            {order ? (
              <div className="flex flex-wrap gap-2 mr-4">
                <RentalOrderBadge config={orderStatusConfig[order.status]} />
                {financialSummary ? (
                  <RentalOrderBadge config={settlementStatusConfig[financialSummary.badgeStatus]} label={financialSummary.label} />
                ) : null}
              </div>
            ) : null}
          </div>
        </DialogHeader>
        <ScrollArea className="max-h-[calc(83dvh-204px)]">
          <div className="p-1">
            {detailQuery.isError ? (
              <Alert variant="destructive" className="mt-5 w-full">
                <AlertTitle>Không tải được chi tiết đơn</AlertTitle>
                <AlertDescription>Vui lòng đóng dialog và thử mở lại.</AlertDescription>
              </Alert>
            ) : order ? (
              <>
                <Tabs defaultValue="overview" className="gap-4">
                  <TabsList className="w-full sm:w-fit">
                    <TabsTrigger value="overview">Tổng quan</TabsTrigger>
                    <TabsTrigger value="payments">Thanh toán</TabsTrigger>
                    <TabsTrigger value="timeline">Lịch sử</TabsTrigger>
                  </TabsList>
                  <TabsContent value="overview">
                    <OverviewTab order={order} />
                  </TabsContent>
                  <TabsContent value="payments">
                    <PaymentsTab order={order} />
                  </TabsContent>
                  <TabsContent value="timeline">
                    <TimelineTab order={order} />
                  </TabsContent>
                </Tabs>
              </>
            ) : detailQuery.isLoading ? (
              <DetailLoading />
            ) : (
              <Empty className="mx-6 my-5">
                <EmptyHeader>
                  <EmptyTitle>Không tìm thấy đơn thuê</EmptyTitle>
                  <EmptyDescription>Đơn có thể đã bị xoá hoặc không còn quyền truy cập.</EmptyDescription>
                </EmptyHeader>
              </Empty>
            )}
          </div>
        </ScrollArea>

        <DialogFooter className="flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
          <RentalOrderDetailFooterSummary order={order} />
          <div className="flex flex-wrap justify-end gap-2">
            <div className="flex flex-wrap justify-end gap-2">
            {order?.status === 'CREATED' ? (
              <ProtectedAction permission={PermissionCode.OrdersUpdate}>
                <Button variant="outline" onClick={() => openAction('update')}>
                  <IconEdit data-icon="inline-start" />
                  Sửa đơn
                </Button>
              </ProtectedAction>
            ) : null}
            {order
              ? pendingPayments.map((payment) => (
              <ProtectedAction key={payment.id} permission={PermissionCode.OrdersRecordPayment}>
                <div className="flex flex-wrap gap-1">
                  <Button
                    disabled={actions.confirmPayment.isPending || actions.rejectPayment.isPending}
                    onClick={() => actions.confirmPayment.mutate({ id: order.id, paymentId: payment.id })}
                  >
                    <IconWallet data-icon="inline-start" />
                    Xác nhận thu {formatCurrency(payment.amount)}
                  </Button>
                  <Button
                    variant="ghost"
                    disabled={actions.confirmPayment.isPending || actions.rejectPayment.isPending}
                    onClick={() => {
                      if (!window.confirm('Từ chối giao dịch đang chờ xác nhận này?')) return;
                      actions.rejectPayment.mutate({ id: order.id, paymentId: payment.id });
                    }}
                  >
                    <IconX data-icon="inline-start" />
                    Từ chối
                  </Button>
                </div>
              </ProtectedAction>
              ))
              : null}
            {canRecordPayment ? (
              <ProtectedAction permission={PermissionCode.OrdersRecordPayment}>
                <Button variant="outline" onClick={() => openAction('payment')}>
                  <IconWallet data-icon="inline-start" />
                  Ghi nhận thu
                </Button>
              </ProtectedAction>
            ) : null}
            {canHandover ? (
              <ProtectedAction permission={PermissionCode.OrdersUpdateStatus} actionType="disable">
                <Button
                  disabled={order?.handoverStatus !== 'READY'}
                  onClick={() => openAction('handover')}
                  title={order?.handoverStatus !== 'READY' ? 'Cần thanh toán đủ trước khi bàn giao' : undefined}
                >
                  <IconPackageExport data-icon="inline-start" />
                  Bàn giao
                </Button>
              </ProtectedAction>
            ) : null}
            {order?.status === 'RENTING' ? (
              <ProtectedAction permission={PermissionCode.OrdersUpdateStatus}>
                <Button onClick={() => openAction('return')}>
                  <IconPackageImport data-icon="inline-start" />
                  Nhận trả
                </Button>
              </ProtectedAction>
            ) : null}
            {canInspect ? (
              <ProtectedAction permission={PermissionCode.OrdersUpdateStatus}>
                <Button onClick={() => openAction('inspection')}>
                  <IconTool data-icon="inline-start" />
                  Kiểm tra
                </Button>
              </ProtectedAction>
            ) : null}
            {canSettle ? (
              <ProtectedAction permission={PermissionCode.OrdersUpdateStatus}>
                <Button onClick={() => openAction('settle')}>
                  <IconReceipt data-icon="inline-start" />
                  Đóng đơn
                </Button>
              </ProtectedAction>
            ) : null}
            {order && remainingRefundDue > 0 ? (
              <ProtectedAction permission={PermissionCode.OrdersRefund}>
                <Button variant="outline" onClick={() => openAction('refund')}>
                  <IconRotateClockwise data-icon="inline-start" />
                  Hoàn thêm {formatCurrency(remainingRefundDue)}
                </Button>
              </ProtectedAction>
            ) : null}
            {pendingRefund ? (
              <ProtectedAction permission={PermissionCode.OrdersRefund}>
                <Button
                  variant="outline"
                  disabled={actions.confirmRefund.isPending}
                  onClick={() =>
                    currentRow && actions.confirmRefund.mutate({ id: currentRow.id, refundId: pendingRefund.id })
                  }
                >
                  <IconRotateClockwise data-icon="inline-start" />
                  Xác nhận đã hoàn {formatCurrency(pendingRefund.amount)}
                </Button>
              </ProtectedAction>
            ) : null}
            {order?.status === 'CREATED' || order?.status === 'CONFIRMED' ? (
              <ProtectedAction permission={PermissionCode.OrdersCancel}>
                <Button variant="destructive" onClick={() => openAction('cancel')}>
                  <IconX data-icon="inline-start" />
                  Hủy đơn
                </Button>
              </ProtectedAction>
            ) : null}
            </div>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Đóng
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
