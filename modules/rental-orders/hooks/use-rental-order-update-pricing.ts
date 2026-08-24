import { useMemo } from 'react';
import type { DateTimeRange } from '@/components/shared/date-time-range-picker';
import type { IRentalOrderOut, PickupMethod, RentalOrderEditableLine } from '../type';
import {
  calculateHandoverRequiredTotal,
  calculateProtectedDepositTotal,
  getEstimatedPricingLines,
} from '../utils';

export function useRentalOrderUpdatePricing({
  activeLines,
  displayLines,
  range,
  pickupMethod,
  deliveryFeeTotal,
  discountTotal,
  order,
}: {
  activeLines: RentalOrderEditableLine[];
  displayLines: RentalOrderEditableLine[];
  range: DateTimeRange;
  pickupMethod: PickupMethod;
  deliveryFeeTotal: number;
  discountTotal: number;
  order?: IRentalOrderOut | null;
}) {
  const estimatedLines = useMemo(() => getEstimatedPricingLines(activeLines, range), [activeLines, range]);
  const displayEstimatedLines = useMemo(() => getEstimatedPricingLines(displayLines, range), [displayLines, range]);
  const displayEstimatedLineById = useMemo(
    () => new Map(displayEstimatedLines.map((line) => [line.id, line])),
    [displayEstimatedLines],
  );
  const currentRentalTotal = estimatedLines.reduce((total, line) => total + line.rentalSubtotal, 0);
  const currentOriginalDepositTotal = estimatedLines.reduce((total, line) => total + line.depositAmount, 0);
  const currentBookingHoldTotal = activeLines.reduce((total, line) => total + (line.bookingHoldAmount ?? 0), 0);
  const currentDeliveryFeeTotal = pickupMethod === 'DELIVERY' ? Number(deliveryFeeTotal) : 0;
  const currentNetRental = Math.max(currentRentalTotal + currentDeliveryFeeTotal - Number(discountTotal), 0);
  const currentDepositTotal = calculateProtectedDepositTotal(currentOriginalDepositTotal, currentNetRental);
  const currentHandoverTotals = calculateHandoverRequiredTotal(currentDepositTotal, currentNetRental);
  const currentEstimatedRefund = currentHandoverTotals.estimatedRefund;
  const originalBookingHoldTotal = order?.financials.bookingHoldTotal ?? 0;
  const successfulBookingHoldPaidTotal =
    order?.payments.reduce(
      (total, payment) =>
        payment.kind === 'BOOKING_HOLD' && payment.status === 'SUCCESS' ? total + payment.amount : total,
      0,
    ) ?? 0;
  const bookingHoldPaidTotal =
    successfulBookingHoldPaidTotal > 0
      ? successfulBookingHoldPaidTotal
      : Math.min(order?.financials.paidTotal ?? 0, originalBookingHoldTotal);
  const currentForfeitedBookingHoldTotal = Math.min(
    bookingHoldPaidTotal,
    Math.max(originalBookingHoldTotal - currentBookingHoldTotal, 0),
  );
  const currentPaidCreditTotal = Math.max((order?.financials.paidTotal ?? 0) - currentForfeitedBookingHoldTotal, 0);
  const currentAmountDueAtHandover = Math.max(currentHandoverTotals.handoverRequiredTotal - currentPaidCreditTotal, 0);

  return {
    currentAmountDueAtHandover,
    currentBookingHoldTotal,
    currentDeliveryFeeTotal,
    currentDepositTotal,
    currentEstimatedRefund,
    currentForfeitedBookingHoldTotal,
    currentHandoverRequiredTotal: currentHandoverTotals.handoverRequiredTotal,
    currentNetRental,
    currentOriginalDepositTotal,
    currentPaidCreditTotal,
    currentRentalTotal,
    displayEstimatedLineById,
  };
}
