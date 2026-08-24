import { getDirtyValues, type DirtyFieldsType } from '@/lib/dirty-filed';
import type { RentalOrderUpdateFormValues } from './schema';
import type {
  IRentalOrderOut,
  IUpdateRentalOrderReq,
  RentalOrderEditableLine,
  RentalOrderEditableLineState,
} from './type';
import { normalizeOptional } from './utils';

export type RentalOrderEditableLineInitialSnapshot = {
  lineIds: Set<string>;
  noteById: Map<string, string>;
};

export const createEmptyEditableLineInitialSnapshot = (): RentalOrderEditableLineInitialSnapshot => ({
  lineIds: new Set(),
  noteById: new Map(),
});

export const createEditableLineInitialSnapshot = (
  lines: RentalOrderEditableLine[],
): RentalOrderEditableLineInitialSnapshot => ({
  lineIds: new Set(lines.map((line) => line.id)),
  noteById: new Map(lines.map((line) => [line.id, line.note ?? ''])),
});

export const getActiveEditableLines = (lines: RentalOrderEditableLine[]) => lines.filter((line) => !line.removed);

export const getEditableLineState = (
  line: RentalOrderEditableLine,
  initialSnapshot: RentalOrderEditableLineInitialSnapshot,
): RentalOrderEditableLineState => {
  if (line.removed) return 'REMOVED';
  if (!initialSnapshot.lineIds.has(line.id)) return 'ADDED';

  const initialNote = initialSnapshot.noteById.get(line.id) ?? '';
  if ((line.note ?? '') !== initialNote) return 'CHANGED';

  return 'UNCHANGED';
};

export const getEditableLineStateCounts = (
  lines: RentalOrderEditableLine[],
  initialSnapshot: RentalOrderEditableLineInitialSnapshot,
) =>
  lines.reduce<Record<RentalOrderEditableLineState, number>>(
    (result, line) => {
      result[getEditableLineState(line, initialSnapshot)] += 1;
      return result;
    },
    { UNCHANGED: 0, ADDED: 0, REMOVED: 0, CHANGED: 0 },
  );

export const hasEditableLineChanges = (
  lines: RentalOrderEditableLine[],
  initialSnapshot: RentalOrderEditableLineInitialSnapshot,
) => lines.some((line) => getEditableLineState(line, initialSnapshot) !== 'UNCHANGED');

export const orderToEditableLines = (order: IRentalOrderOut): RentalOrderEditableLine[] =>
  order.items
    .filter((item) => item.assetUnit)
    .map((item) => {
      const productSnapshot = item.productSnapshot ?? item.snapshot?.product;
      const pricing = item.pricing;
      const appliedTier = pricing.appliedTier
        ? [
            {
              id: pricing.appliedTier.id,
              minDays: pricing.appliedTier.minDays,
              maxDays: pricing.appliedTier.maxDays,
              dailyPrice: pricing.appliedTier.dailyPrice,
              name: pricing.appliedTier.name,
            },
          ]
        : [];

      return {
        id: item.id,
        productId: item.productId,
        productName: item.productSnapshot?.name ?? item.product.name,
        sku: item.productSnapshot?.sku ?? item.product.sku ?? '',
        assetUnitId: item.assetUnitId,
        serialNumber: item.assetUnitSnapshot?.serialNumber ?? item.assetUnit.serialNumber,
        status: item.status,
        dailyPrice: productSnapshot?.dailyPrice ?? pricing.unitPrice,
        halfDayPrice: productSnapshot?.halfDayPrice ?? pricing.unitPrice,
        hourlyOveragePrice: productSnapshot?.hourlyOveragePrice ?? 0,
        depositAmount: productSnapshot?.depositAmount ?? pricing.depositAmount,
        rentalPriceTiers: productSnapshot?.rentalPriceTiers ?? appliedTier,
        bookingHoldAmount: pricing.bookingHoldAmount,
        note: item.note ?? '',
      };
    });

export const buildRentalOrderUpdatePayload = ({
  values,
  dirtyFields,
  activeLines,
  shouldSendItems,
}: {
  values: RentalOrderUpdateFormValues;
  dirtyFields: Partial<Record<keyof RentalOrderUpdateFormValues, DirtyFieldsType>>;
  activeLines: RentalOrderEditableLine[];
  shouldSendItems: boolean;
}): IUpdateRentalOrderReq => {
  const payload: IUpdateRentalOrderReq = {};
  const dirtyValues = getDirtyValues<RentalOrderUpdateFormValues>(dirtyFields, values);
  const dirtyCustomerSnapshot = dirtyValues.customerSnapshot;

  if (dirtyCustomerSnapshot) {
    const customerSnapshot: NonNullable<IUpdateRentalOrderReq['customerSnapshot']> = {};

    if (Object.prototype.hasOwnProperty.call(dirtyCustomerSnapshot, 'name')) customerSnapshot.name = dirtyCustomerSnapshot.name.trim();
    if (Object.prototype.hasOwnProperty.call(dirtyCustomerSnapshot, 'phone')) customerSnapshot.phone = dirtyCustomerSnapshot.phone.trim();
    if (Object.prototype.hasOwnProperty.call(dirtyCustomerSnapshot, 'email')) customerSnapshot.email = dirtyCustomerSnapshot.email.trim();
    if (Object.prototype.hasOwnProperty.call(dirtyCustomerSnapshot, 'address')) customerSnapshot.address = dirtyCustomerSnapshot.address.trim();
    if (Object.prototype.hasOwnProperty.call(dirtyCustomerSnapshot, 'identityNumber')) {
      customerSnapshot.identityNumber = dirtyCustomerSnapshot.identityNumber.trim();
    }
    if (Object.prototype.hasOwnProperty.call(dirtyCustomerSnapshot, 'socialContact')) {
      customerSnapshot.socialContact = dirtyCustomerSnapshot.socialContact.trim();
    }

    if (Object.keys(customerSnapshot).length > 0) payload.customerSnapshot = customerSnapshot;
  }

  if (dirtyValues.range) {
    payload.startDate = values.range.from?.toISOString();
    payload.endDate = values.range.to?.toISOString();
  }

  if (dirtyValues.pickupMethod) {
    payload.pickupMethod = dirtyValues.pickupMethod;
    payload.deliveryAddress = values.pickupMethod === 'DELIVERY' ? values.deliveryAddress.trim() : '';
    payload.deliveryFeeTotal = values.pickupMethod === 'DELIVERY' ? Number(values.deliveryFeeTotal) : 0;
  } else {
    if (Object.prototype.hasOwnProperty.call(dirtyValues, 'deliveryAddress')) {
      payload.deliveryAddress = values.pickupMethod === 'DELIVERY' ? values.deliveryAddress.trim() : '';
    }
    if (Object.prototype.hasOwnProperty.call(dirtyValues, 'deliveryFeeTotal')) {
      payload.deliveryFeeTotal = values.pickupMethod === 'DELIVERY' ? Number(values.deliveryFeeTotal) : 0;
    }
  }

  if (Object.prototype.hasOwnProperty.call(dirtyValues, 'discountTotal')) payload.discountTotal = Number(dirtyValues.discountTotal);
  if (Object.prototype.hasOwnProperty.call(dirtyValues, 'note')) payload.note = normalizeOptional(dirtyValues.note ?? '');
  if (Object.prototype.hasOwnProperty.call(dirtyValues, 'internalNote')) {
    payload.internalNote = normalizeOptional(dirtyValues.internalNote ?? '');
  }

  if (shouldSendItems) {
    payload.items = activeLines.map((line) => ({
      productId: line.productId,
      assetUnitId: line.assetUnitId,
      note: normalizeOptional(line.note ?? ''),
    }));
  }

  return payload;
};
