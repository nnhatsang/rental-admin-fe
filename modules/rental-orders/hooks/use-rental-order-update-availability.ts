import { useEffect, useMemo } from 'react';
import type { DateTimeRange } from '@/components/shared/date-time-range-picker';
import { buildAvailabilityPayload, toInputDateTime } from '../utils';
import type { IRentalOrderOut, RentalOrderEditableLine } from '../type';
import { useCheckRentalOrderAvailability } from './use-check-rental-order-availability';

export function useRentalOrderUpdateAvailability({
  activeLines,
  canEdit,
  hasItemChanges,
  hasValidRange,
  isRangeDirty,
  open,
  order,
  range,
}: {
  activeLines: RentalOrderEditableLine[];
  canEdit: boolean;
  hasItemChanges: boolean;
  hasValidRange: boolean;
  isRangeDirty: boolean;
  open: boolean;
  order?: IRentalOrderOut | null;
  range: DateTimeRange;
}) {
  const checkAvailability = useCheckRentalOrderAvailability();
  const { mutate: checkSelectedAvailability, reset: resetSelectedAvailability } = checkAvailability;
  const startDate = toInputDateTime(range.from);
  const endDate = toInputDateTime(range.to);

  const shouldCheckAvailability = canEdit && hasValidRange && activeLines.length > 0 && (isRangeDirty || hasItemChanges);
  const availabilityPayload = useMemo(() => {
    if (!order) return null;

    return {
      ...buildAvailabilityPayload(activeLines, startDate, endDate),
      excludeOrderId: order.id,
    };
  }, [activeLines, endDate, order, startDate]);

  useEffect(() => {
    if (!open || !shouldCheckAvailability || !availabilityPayload) {
      resetSelectedAvailability();
      return;
    }

    checkSelectedAvailability(availabilityPayload);
  }, [
    availabilityPayload,
    checkSelectedAvailability,
    open,
    resetSelectedAvailability,
    shouldCheckAvailability,
  ]);

  return {
    availabilityPayload,
    checkAvailability,
    hasAvailabilityConflict: shouldCheckAvailability && checkAvailability.data?.isAvailable === false,
    shouldCheckAvailability,
  };
}
