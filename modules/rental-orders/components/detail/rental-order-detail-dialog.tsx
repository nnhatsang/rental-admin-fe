'use client';

import { ProtectedAction } from '@/components/shared/protected-action';
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
    <div className="grid gap-1 rounded-md border bg-muted/20 p-3">
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
        <Card size="sm">
          <CardHeader>
            <CardTitle>Khách hàng</CardTitle>
            <CardDescription>Thông tin tại thời điểm tạo đơn</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            <DetailField label="Họ tên">{order.customerSnapshot.name}</DetailField>
            <DetailField label="Số điện thoại">{order.customerSnapshot.phone ?? '—'}</DetailField>
            <DetailField label="Email">{order.customerSnapshot.email ?? '—'}</DetailField>
            <DetailField label="CCCD/Giấy tờ">{order.customerSnapshot.identityNumber ?? '—'}</DetailField>
          </CardContent>
        </Card>

        <Card size="sm">
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

        <Card size="sm">
          <CardHeader>
            <CardTitle>Vận hành</CardTitle>
            <CardDescription>
              {sourceLabel[order.source]} · {totalDevices} sản phẩm
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            <DetailField label="Trạng thái">
              <RentalOrderBadge config={orderStatusConfig[order.status]} />
            </DetailField>
            <DetailField label="Bàn giao">
              <RentalOrderBadge config={handoverStatusConfig[order.handoverStatus]} />
            </DetailField>
            <DetailField label="Trả máy">
              <RentalOrderBadge config={returnStatusConfig[order.returnStatus]} />
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

      <Card>
        <CardHeader>
          <CardTitle>Tài chính</CardTitle>
          <CardDescription>Snapshot tài chính và các khoản cần xử lý hiện tại</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <DetailMetric label="Tiền thuê" value={formatCurrency(order.financials.rentalFeeTotal)} />
          <DetailMetric label="Phí giao máy" value={formatCurrency(order.financials.deliveryFeeTotal)} />
          <DetailMetric label="Giữ lịch" value={formatCurrency(order.financials.bookingHoldTotal)} />
          <DetailMetric label="Tiền cọc" value={formatCurrency(order.financials.securityDepositTotal)} />
          <DetailMetric label="Tổng nghĩa vụ" value={formatCurrency(order.financials.totalCustomerObligation)} />
          <DetailMetric
            label="Đã thu"
            value={formatCurrency(order.financials.paidTotal)}
            valueClassName="text-primary"
          />
          <DetailMetric
            label="Còn trước giao"
            value={formatCurrency(order.financials.amountDueBeforeHandover)}
            valueClassName={order.financials.amountDueBeforeHandover > 0 ? 'text-destructive' : undefined}
          />
          <DetailMetric
            label="Quyết toán"
            value={settlementStatusConfig[order.settlementStatus].label}
            helper={
              order.financials.additionalChargeDue > 0
                ? `Cần thu thêm ${formatCurrency(order.financials.additionalChargeDue)}`
                : order.financials.refundDue > 0
                  ? `Cần hoàn ${formatCurrency(order.financials.refundDue)}`
                  : 'Không còn khoản cần xử lý'
            }
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Dòng thuê và allocation</CardTitle>
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
            <Empty className="border">
              <EmptyHeader>
                <EmptyTitle>Chưa có dòng thuê</EmptyTitle>
                <EmptyDescription>Đơn chưa có sản phẩm được ghi nhận.</EmptyDescription>
              </EmptyHeader>
            </Empty>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Biên bản kiểm tra</CardTitle>
          <CardDescription>Thông tin kiểm tra khi bàn giao và nhận trả máy</CardDescription>
        </CardHeader>
        <CardContent>
          {order.inspections.length ? (
            <div className="grid gap-3">
              {order.inspections.map((inspection) => (
                <div key={inspection.id} className="grid gap-2 rounded-lg border p-3">
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
            <Empty className="border">
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
      <Card>
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
            <Empty className="border">
              <EmptyHeader>
                <EmptyTitle>Chưa có thanh toán</EmptyTitle>
                <EmptyDescription>Giao dịch của đơn sẽ hiển thị ở đây.</EmptyDescription>
              </EmptyHeader>
            </Empty>
          )}
        </CardContent>
      </Card>

      <Card>
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
            <Empty className="border">
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
    <Card>
      <CardHeader>
        <CardTitle>Lịch sử trạng thái</CardTitle>
        <CardDescription>Theo dõi các lần chuyển trạng thái của đơn</CardDescription>
      </CardHeader>
      <CardContent>
        {order.statusHistories.length ? (
          <Timeline defaultValue={order.statusHistories.length} orientation="vertical" className="px-2 py-1">
            {order.statusHistories.map((history, index) => (
              <TimelineItem key={history.id} step={index + 1}>
                <TimelineIndicator>{index + 1}</TimelineIndicator>
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
          <Empty className="border">
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
  const actions = useRentalOrderActions();
  const pendingRefund = order?.refunds.find((refund) => refund.status === 'PENDING' || refund.status === 'PROCESSING');
  const openAction = (action: Parameters<typeof setOpen>[0]) => setOpen(action);

  const canRecordPayment = Boolean(
    order &&
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-7xl">
        <DialogHeader className="border-b py-2">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="grid gap-1">
              <DialogTitle>{order?.code ?? currentRow?.code ?? 'Chi tiết đơn thuê'}</DialogTitle>
              <DialogDescription>
                {order
                  ? `${order.customerSnapshot.name} · tạo lúc ${formatDate(order.createdAt, 'shortDateTime')}`
                  : 'Đang tải dữ liệu đơn thuê…'}
              </DialogDescription>
            </div>
            {order ? (
              <div className="flex flex-wrap gap-2 mr-4">
                <RentalOrderBadge config={orderStatusConfig[order.status]} />
                <RentalOrderBadge config={settlementStatusConfig[order.settlementStatus]} />
              </div>
            ) : null}
          </div>
        </DialogHeader>
        <ScrollArea className="max-h-[calc(83dvh-204px)]">
          <div className="p-1">
            {detailQuery.isError ? (
              <Alert variant="destructive" className="mx-6 mt-5">
                <AlertTitle>Không tải được chi tiết đơn</AlertTitle>
                <AlertDescription>Vui lòng đóng dialog và thử mở lại.</AlertDescription>
              </Alert>
            ) : order ? (
              <>
                <Tabs defaultValue="overview" className="gap-4 p">
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
              <Empty className="mx-6 my-5 border">
                <EmptyHeader>
                  <EmptyTitle>Không tìm thấy đơn thuê</EmptyTitle>
                  <EmptyDescription>Đơn có thể đã bị xoá hoặc không còn quyền truy cập.</EmptyDescription>
                </EmptyHeader>
              </Empty>
            )}
          </div>
        </ScrollArea>

        <DialogFooter className="flex-wrap items-center justify-between gap-2 border-t sm:flex-row">
          <div className="flex flex-wrap gap-2">
            {order?.status === 'CREATED' ? (
              <ProtectedAction permission={PermissionCode.OrdersUpdate}>
                <Button variant="outline" onClick={() => openAction('update')}>
                  <IconEdit data-icon="inline-start" />
                  Sửa đơn
                </Button>
              </ProtectedAction>
            ) : null}
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
            {order && order.financials.refundDue > 0 ? (
              <ProtectedAction permission={PermissionCode.OrdersRefund}>
                <Button variant="outline" onClick={() => openAction('refund')}>
                  <IconRotateClockwise data-icon="inline-start" />
                  Hoàn tiền
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
                  Xác nhận hoàn {formatCurrency(pendingRefund.amount)}
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
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
