'use client';

import { getDirtyValues, type DirtyFieldsType } from '@/lib/dirty-filed';
import type { IAvailabilityAsset } from '@/modules/availability/type';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { type Resolver, useForm, useWatch } from 'react-hook-form';
import { toast } from 'sonner';
import { rentalOrderUpdateFormSchema, type RentalOrderUpdateFormValues } from '../schema';
import type {
  IRentalOrderOut,
  IUpdateRentalOrderReq,
  RentalOrderEditableLine,
  RentalOrderEditableLineFilter,
  RentalOrderEditableLineState,
} from '../type';
import {
  buildAvailabilityPayload,
  calculateProtectedDepositTotal,
  createOrderLineDraft,
  getEstimatedPricingLines,
  normalizeOptional,
  toInputDateTime,
} from '../utils';
import { useCheckRentalOrderAvailability } from './use-check-rental-order-availability';
import { useGetRentalOrderById } from './use-get-rental-order-by-id';
import { useRentalOrderCreateSelectionLogic } from './use-rental-order-create-selection-logic';
import { useUpdateRentalOrder } from './use-update-rental-order';

export const getLineState = (
  line: RentalOrderEditableLine,
  initialLineIds: Set<string>,
  initialLineNoteById: Map<string, string>,
): RentalOrderEditableLineState => {
  if (line.removed) return 'REMOVED';
  if (!initialLineIds.has(line.id)) return 'ADDED';

  const initialNote = initialLineNoteById.get(line.id) ?? '';
  if ((line.note ?? '') !== initialNote) return 'CHANGED';

  return 'UNCHANGED';
};

const getLineStateCounts = (
  lines: RentalOrderEditableLine[],
  initialLineIds: Set<string>,
  initialLineNoteById: Map<string, string>,
) =>
  lines.reduce<Record<RentalOrderEditableLineState, number>>(
    (result, line) => {
      result[getLineState(line, initialLineIds, initialLineNoteById)] += 1;
      return result;
    },
    { UNCHANGED: 0, ADDED: 0, REMOVED: 0, CHANGED: 0 },
  );

const orderToLines = (order: IRentalOrderOut): RentalOrderEditableLine[] =>
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

const buildUpdatePayload = ({
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
    payload.startDate = dirtyValues.range.from?.toISOString();
    payload.endDate = dirtyValues.range.to?.toISOString();
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

type UseRentalOrderUpdateLogicProps = {
  orderId?: string;
  open: boolean;
  onClose: () => void;
};

export function useRentalOrderUpdateLogic({ orderId, open, onClose }: UseRentalOrderUpdateLogicProps) {
  const orderQuery = useGetRentalOrderById(open ? orderId : undefined);
  const updateOrder = useUpdateRentalOrder();
  const checkAvailability = useCheckRentalOrderAvailability();
  const { mutate: checkSelectedAvailability, reset: resetSelectedAvailability } = checkAvailability;
  const [rangeOpen, setRangeOpen] = useState(false);
  const [lines, setLines] = useState<RentalOrderEditableLine[]>([]);
  const [lineFilter, setLineFilter] = useState<RentalOrderEditableLineFilter>('ALL');
  const [initialLineIds, setInitialLineIds] = useState<Set<string>>(() => new Set());
  const [initialLineNoteById, setInitialLineNoteById] = useState<Map<string, string>>(() => new Map());
  const order = orderQuery.data;

  const form = useForm<RentalOrderUpdateFormValues>({
    resolver: zodResolver(rentalOrderUpdateFormSchema) as Resolver<RentalOrderUpdateFormValues>,
    defaultValues: {
      customerSnapshot: {
        name: '',
        phone: '',
        email: '',
        address: '',
        identityNumber: '',
        socialContact: '',
      },
      range: { from: undefined, to: undefined },
      pickupMethod: 'PICKUP_AT_STORE',
      deliveryAddress: '',
      deliveryFeeTotal: 0,
      discountTotal: 0,
      note: '',
      internalNote: '',
    },
  });

  const range = useWatch({ control: form.control, name: 'range' });
  const pickupMethod = useWatch({ control: form.control, name: 'pickupMethod' });
  const deliveryFeeTotal = useWatch({ control: form.control, name: 'deliveryFeeTotal' });
  const discountTotal = useWatch({ control: form.control, name: 'discountTotal' });
  const startDate = toInputDateTime(range.from);
  const endDate = toInputDateTime(range.to);
  const hasValidRange = Boolean(range.from && range.to && range.from < range.to);
  const activeLines = useMemo(() => lines.filter((line) => !line.removed), [lines]);
  const selectedAssetUnitIds = useMemo(() => lines.filter((line) => !line.removed).map((line) => line.assetUnitId), [lines]);
  const canEdit = order ? ['CREATED', 'CONFIRMED'].includes(order.status) : false;
  const hasAvailabilityConflict = checkAvailability.data?.isAvailable === false;
  const canSubmit = canEdit && !updateOrder.isPending && !checkAvailability.isPending && !hasAvailabilityConflict;

  const addAssetLines = useCallback((assets: IAvailabilityAsset[]) => {
    setLines((current) => {
      const existingAssetUnitIds = new Set(current.filter((line) => !line.removed).map((line) => line.assetUnitId));
      const nextLines = [...current];

      assets.forEach((asset) => {
        if (asset.availability !== 'AVAILABLE') return;

        if (existingAssetUnitIds.has(asset.assetUnitId)) {
          toast.error('Serial này đã có trong đơn');
          return;
        }

        existingAssetUnitIds.add(asset.assetUnitId);
        nextLines.push({ ...createOrderLineDraft(asset), bookingHoldAmount: 0 });
      });

      return nextLines;
    });
  }, []);

  const removeAssetLineByAssetUnitId = useCallback((assetUnitId: string) => {
    setLines((current) =>
      current.map((line) => (line.assetUnitId === assetUnitId && !line.removed ? { ...line, removed: true } : line)),
    );
  }, []);

  const { assetTable } = useRentalOrderCreateSelectionLogic({
    open,
    startDate,
    endDate,
    hasValidRange,
    selectedAssetUnitIds,
    excludeOrderId: order?.id,
    onAddAssets: addAssetLines,
    onRemoveAsset: removeAssetLineByAssetUnitId,
    enableCustomerTable: false,
  });
  

  const availabilityPayload = useMemo(
    () =>
      order
        ? {
            ...buildAvailabilityPayload(activeLines, startDate, endDate),
            excludeOrderId: order.id,
          }
        : null,
    [activeLines, endDate, order, startDate],
  );

  useEffect(() => {
    if (!open || !canEdit || !hasValidRange || !activeLines.length || !availabilityPayload) {
      resetSelectedAvailability();
      return;
    }

    checkSelectedAvailability(availabilityPayload);
  }, [
    activeLines.length,
    availabilityPayload,
    canEdit,
    checkSelectedAvailability,
    hasValidRange,
    open,
    resetSelectedAvailability,
  ]);

  const estimatedLines = useMemo(() => getEstimatedPricingLines(activeLines, range), [activeLines, range]);
  const displayEstimatedLines = useMemo(() => getEstimatedPricingLines(lines, range), [lines, range]);
  const displayEstimatedLineById = useMemo(
    () => new Map(displayEstimatedLines.map((line) => [line.id, line])),
    [displayEstimatedLines],
  );
  const lineStateCounts = useMemo(
    () => getLineStateCounts(lines, initialLineIds, initialLineNoteById),
    [initialLineIds, initialLineNoteById, lines],
  );
  const getLineStateForLine = useCallback(
    (line: RentalOrderEditableLine) => getLineState(line, initialLineIds, initialLineNoteById),
    [initialLineIds, initialLineNoteById],
  );
  const hasLineChanges = useMemo(
    () => lines.some((line) => getLineStateForLine(line) !== 'UNCHANGED'),
    [getLineStateForLine, lines],
  );
  const filteredLines = useMemo(
    () =>
      lineFilter === 'ALL'
        ? lines
        : lines.filter((line) => getLineStateForLine(line) === lineFilter),
    [getLineStateForLine, lineFilter, lines],
  );
  const currentRentalTotal = estimatedLines.reduce((total, line) => total + line.rentalSubtotal, 0);
  const currentOriginalDepositTotal = estimatedLines.reduce((total, line) => total + line.depositAmount, 0);
  const currentBookingHoldTotal = activeLines.reduce((total, line) => total + (line.bookingHoldAmount ?? 0), 0);
  const currentDeliveryFeeTotal = pickupMethod === 'DELIVERY' ? Number(deliveryFeeTotal) : 0;
  const currentNetRental = Math.max(currentRentalTotal + currentDeliveryFeeTotal - Number(discountTotal), 0);
  const currentDepositTotal = calculateProtectedDepositTotal(currentOriginalDepositTotal, currentNetRental);
  const currentEstimatedRefund = Math.max(currentDepositTotal - currentNetRental, 0);
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
  const currentAmountDueAtHandover = Math.max(currentDepositTotal - currentPaidCreditTotal, 0);

  const resetState = () => {
    form.reset();
    setLines([]);
    setInitialLineIds(new Set());
    setInitialLineNoteById(new Map());
    setLineFilter('ALL');
    resetSelectedAvailability();
    setRangeOpen(false);
  };

  useEffect(() => {
    if (!open || !order) return;

    form.reset({
      customerSnapshot: {
        name: order.customerSnapshot.name ?? '',
        phone: order.customerSnapshot.phone ?? '',
        email: order.customerSnapshot.email ?? '',
        address: order.customerSnapshot.address ?? '',
        identityNumber: order.customerSnapshot.identityNumber ?? '',
        socialContact: order.customerSnapshot.socialContact ?? '',
      },
      range: { from: new Date(order.startDate), to: new Date(order.endDate) },
      pickupMethod: order.pickupMethod,
      deliveryAddress: order.deliveryAddress ?? '',
      deliveryFeeTotal: order.deliveryFeeTotal,
      discountTotal: order.discountTotal,
      note: order.note ?? '',
      internalNote: order.internalNote ?? '',
    });

    queueMicrotask(() => {
      const nextLines = orderToLines(order);
      setRangeOpen(false);
      setLineFilter('ALL');
      setLines(nextLines);
      setInitialLineIds(new Set(nextLines.map((line) => line.id)));
      setInitialLineNoteById(new Map(nextLines.map((line) => [line.id, line.note ?? ''])));
    });
  }, [form, open, order]);

  const handleClose = () => {
    resetState();
    onClose();
  };

  const updateLineNote = (lineId: string, note: string) => {
    setLines((current) => current.map((line) => (line.id === lineId ? { ...line, note } : line)));
  };

  const removeLine = (lineId: string) => {
    setLines((current) =>
      initialLineIds.has(lineId)
        ? current.map((line) => (line.id === lineId ? { ...line, removed: true } : line))
        : current.filter((line) => line.id !== lineId),
    );
  };

  const restoreLine = (lineId: string) => {
    setLines((current) => current.map((line) => (line.id === lineId ? { ...line, removed: false } : line)));
  };

  const onSubmit = async (values: RentalOrderUpdateFormValues) => {
    if (!order) return;
    if (!canEdit) {
      toast.error('Chỉ có thể cập nhật đơn mới tạo hoặc đã xác nhận');
      return;
    }
    if (!activeLines.length) {
      toast.error('Vui lòng chọn ít nhất một thiết bị');
      return;
    }
    if (!values.range.from || !values.range.to) {
      toast.error('Vui lòng chọn thời gian thuê hợp lệ');
      return;
    }

    if (!availabilityPayload) return;

    const availability = await checkAvailability.mutateAsync(availabilityPayload);
    if (!availability.isAvailable) {
      toast.error('Một số thiết bị không còn khả dụng trong khoảng thời gian này');
      return;
    }

    const payload = buildUpdatePayload({
      values,
      dirtyFields: form.formState.dirtyFields,
      activeLines,
      shouldSendItems: hasLineChanges,
    });

    if (Object.keys(payload).length === 0) {
      handleClose();
      return;
    }

    updateOrder.mutate({ id: order.id, data: payload }, { onSuccess: handleClose });
  };

  return {
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
    currentNetRental,
    currentOriginalDepositTotal,
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
  };
}

