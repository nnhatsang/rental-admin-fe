import { BadgeCustom } from '@/components/shared/badge-custom';
import { CopyText } from '@/components/shared/copy-text';
import { Badge } from '@/components/ui/badge';
import { DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { formatDate } from '@/lib/utils';
import { orderStatusConfig, paymentStatusConfig, refundStatusConfig } from '../display-config';
import type { IRentalOrderOut } from '../type';
import { formatRentalDuration } from '../utils';

type RentalOrderDialogHeaderProps = {
  description: string;
  order?: IRentalOrderOut | null;
  title: string;
};

export function RentalOrderDialogHeader({ description, order, title }: RentalOrderDialogHeaderProps) {
  const startDate = order?.rentalPeriod.startDate;
  const endDate = order?.rentalPeriod.endDate;
  const periodLabel =
    startDate && endDate
      ? [formatDate(startDate, 'shortDateTime'), formatDate(endDate, 'shortDateTime')].filter(Boolean).join(' - ')
      : '';
  const durationLabel =
    startDate && endDate ? formatRentalDuration({ from: new Date(startDate), to: new Date(endDate) }) : '';

  return (
    <DialogHeader className="min-w-0">
      <DialogTitle className="flex flex-wrap items-center gap-x-2 gap-y-1 leading-6">
        {title}
        {order ? (
          <>
            <CopyText text={String(order.code)} className="py-1 font-bold text-primary underline">
              <span>#{order.code}</span>
            </CopyText>
            <BadgeCustom status={order.status} config={orderStatusConfig} />
            <BadgeCustom status={order.paymentStatus} config={paymentStatusConfig} />
            <BadgeCustom status={order.refundStatus} config={refundStatusConfig} />
          </>
        ) : null}
      </DialogTitle>
      <DialogDescription className="mt-1 space-y-1">
        <span className="block">{description}</span>
        {periodLabel ? (
          <span className="flex flex-wrap items-center gap-1 font-medium">
            {periodLabel}
            {durationLabel ? (
              <Badge variant="outline" className="shrink-0">
                {durationLabel}
              </Badge>
            ) : null}
          </span>
        ) : null}
      </DialogDescription>
    </DialogHeader>
  );
}
