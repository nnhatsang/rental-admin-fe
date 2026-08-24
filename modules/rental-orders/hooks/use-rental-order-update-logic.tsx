'use client';

import type { IAvailabilityAsset } from '@/modules/availability/type';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { type Resolver, useFieldArray, useForm, useWatch } from 'react-hook-form';
import { toast } from 'sonner';
import {
  buildRentalOrderUpdatePayload,
  createEditableLineInitialSnapshot,
  createEmptyEditableLineInitialSnapshot,
  getActiveEditableLines,
  getEditableLineState,
  getEditableLineStateCounts,
  hasEditableLineChanges,
  orderToEditableLines,
  type RentalOrderEditableLineInitialSnapshot,
} from '../rental-order-update-helpers';
import { rentalOrderUpdateFormSchema, type RentalOrderUpdateFormValues } from '../schema';
import type { IRentalOrderOut, RentalOrderEditableLine, RentalOrderEditableLineFilter } from '../type';
import { createOrderLineDraft, toInputDateTime } from '../utils';
import { useGetRentalOrderById } from './use-get-rental-order-by-id';
import { useRentalOrderCreateSelectionLogic } from './use-rental-order-create-selection-logic';
import { useRentalOrderUpdateAvailability } from './use-rental-order-update-availability';
import { useRentalOrderUpdatePricing } from './use-rental-order-update-pricing';
import { useUpdateRentalOrder } from './use-update-rental-order';

type UseRentalOrderUpdateLogicProps = {
  orderId?: string;
  open: boolean;
  onClose: () => void;
};

const emptyUpdateFormValues = (): RentalOrderUpdateFormValues => ({
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
  items: [],
});

const orderToUpdateFormValues = (
  order: IRentalOrderOut,
  items: RentalOrderEditableLine[],
): RentalOrderUpdateFormValues => ({
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
  items,
});

export function useRentalOrderUpdateLogic({ orderId, open, onClose }: UseRentalOrderUpdateLogicProps) {
  const orderQuery = useGetRentalOrderById(open ? orderId : undefined);
  const updateOrder = useUpdateRentalOrder();
  const [rangeOpen, setRangeOpen] = useState(false);
  const [lineFilter, setLineFilter] = useState<RentalOrderEditableLineFilter>('ALL');
  const [initialLineSnapshot, setInitialLineSnapshot] = useState<RentalOrderEditableLineInitialSnapshot>(() =>
    createEmptyEditableLineInitialSnapshot(),
  );
  const order = orderQuery.data;

  const form = useForm<RentalOrderUpdateFormValues>({
    resolver: zodResolver(rentalOrderUpdateFormSchema) as Resolver<RentalOrderUpdateFormValues>,
    defaultValues: emptyUpdateFormValues(),
  });
  const { append, remove, replace } = useFieldArray({
    control: form.control,
    name: 'items',
    keyName: 'fieldId',
  });

  const range = useWatch({ control: form.control, name: 'range' });
  const pickupMethod = useWatch({ control: form.control, name: 'pickupMethod' });
  const deliveryFeeTotal = useWatch({ control: form.control, name: 'deliveryFeeTotal' });
  const discountTotal = useWatch({ control: form.control, name: 'discountTotal' });
  const lines = useWatch({ control: form.control, name: 'items' }) ?? [];
  const dirtyFields = form.formState.dirtyFields;
  const isRangeDirty = Boolean(dirtyFields.range);
  const hasRegularDirtyFields = Object.keys(dirtyFields).some((field) => field !== 'items');
  const hasValidRange = Boolean(range.from && range.to && range.from < range.to);
  const startDate = toInputDateTime(range.from);
  const endDate = toInputDateTime(range.to);
  const activeLines = useMemo(() => getActiveEditableLines(lines), [lines]);
  const selectedAssetUnitIds = useMemo(() => activeLines.map((line) => line.assetUnitId), [activeLines]);
  const hiddenAssetUnitIds = useMemo(() => lines.map((line) => line.assetUnitId), [lines]);
  const canEdit = order ? ['CREATED', 'CONFIRMED'].includes(order.status) : false;
  const getLineStateForLine = useCallback(
    (line: RentalOrderEditableLine) => getEditableLineState(line, initialLineSnapshot),
    [initialLineSnapshot],
  );
  const hasLineChanges = useMemo(
    () => hasEditableLineChanges(lines, initialLineSnapshot),
    [initialLineSnapshot, lines],
  );

  const {
    availabilityPayload,
    checkAvailability,
    hasAvailabilityConflict,
    shouldCheckAvailability,
  } = useRentalOrderUpdateAvailability({
    activeLines,
    canEdit,
    hasItemChanges: hasLineChanges,
    hasValidRange,
    isRangeDirty,
    open,
    order,
    range,
  });

  const canSubmit =
    canEdit &&
    !updateOrder.isPending &&
    !checkAvailability.isPending &&
    !hasAvailabilityConflict &&
    (hasRegularDirtyFields || hasLineChanges);

  const addAssetLines = useCallback(
    (assets: IAvailabilityAsset[]) => {
      const currentLines = form.getValues('items');
      const seenAssetUnitIds = new Set(currentLines.map((line) => line.assetUnitId));
      const nextLines: RentalOrderEditableLine[] = [];

      assets.forEach((asset) => {
        if (asset.availability !== 'AVAILABLE') return;

        if (nextLines.some((line) => line.assetUnitId === asset.assetUnitId)) return;

        const existingIndex = currentLines.findIndex((line) => line.assetUnitId === asset.assetUnitId);
        const existingLine = existingIndex >= 0 ? currentLines[existingIndex] : undefined;

        if (existingLine) {
          if (existingLine.removed) {
            form.setValue(`items.${existingIndex}.removed`, false, { shouldDirty: true, shouldValidate: true });
            currentLines[existingIndex] = { ...existingLine, removed: false };
            return;
          }

          toast.error('Serial này đã có trong đơn');
          return;
        }

        if (seenAssetUnitIds.has(asset.assetUnitId)) return;

        seenAssetUnitIds.add(asset.assetUnitId);
        nextLines.push({ ...createOrderLineDraft(asset), bookingHoldAmount: 0 });
      });

      if (nextLines.length) append(nextLines, { shouldFocus: false });
    },
    [append, form],
  );

  const removeLineAtIndex = useCallback(
    (index: number) => {
      const line = form.getValues(`items.${index}`);
      if (!line) return;

      if (initialLineSnapshot.lineIds.has(line.id)) {
        form.setValue(`items.${index}.removed`, true, { shouldDirty: true, shouldValidate: true });
        return;
      }

      remove(index);
    },
    [form, initialLineSnapshot.lineIds, remove],
  );

  const removeAssetLineByAssetUnitId = useCallback(
    (assetUnitId: string) => {
      const index = form.getValues('items').findIndex((line) => line.assetUnitId === assetUnitId && !line.removed);
      if (index >= 0) removeLineAtIndex(index);
    },
    [form, removeLineAtIndex],
  );

  const { assetTable } = useRentalOrderCreateSelectionLogic({
    open,
    startDate,
    endDate,
    hasValidRange,
    selectedAssetUnitIds,
    hiddenAssetUnitIds,
    excludeOrderId: order?.id,
    onAddAssets: addAssetLines,
    onRemoveAsset: removeAssetLineByAssetUnitId,
    enableCustomerTable: false,
  });

  const {
    currentAmountDueAtHandover,
    currentBookingHoldTotal,
    currentDeliveryFeeTotal,
    currentDepositTotal,
    currentEstimatedRefund,
    currentForfeitedBookingHoldTotal,
    currentHandoverRequiredTotal,
    currentNetRental,
    currentOriginalDepositTotal,
    currentPaidCreditTotal,
    currentRentalTotal,
    displayEstimatedLineById,
  } = useRentalOrderUpdatePricing({
    activeLines,
    displayLines: lines,
    range,
    pickupMethod,
    deliveryFeeTotal,
    discountTotal,
    order,
  });

  const lineStateCounts = useMemo(
    () => getEditableLineStateCounts(lines, initialLineSnapshot),
    [initialLineSnapshot, lines],
  );
  const filteredLines = useMemo(
    () =>
      lineFilter === 'ALL'
        ? lines
        : lines.filter((line) => getLineStateForLine(line) === lineFilter),
    [getLineStateForLine, lineFilter, lines],
  );

  const resetState = () => {
    form.reset(emptyUpdateFormValues());
    replace([]);
    setInitialLineSnapshot(createEmptyEditableLineInitialSnapshot());
    setLineFilter('ALL');
    checkAvailability.reset();
    setRangeOpen(false);
  };

  useEffect(() => {
    if (!open || !order) return;

    const nextLines = orderToEditableLines(order);
    form.reset(orderToUpdateFormValues(order, nextLines));
    setRangeOpen(false);
    setLineFilter('ALL');
    setInitialLineSnapshot(createEditableLineInitialSnapshot(nextLines));
  }, [form, open, order]);

  const handleClose = () => {
    resetState();
    onClose();
  };

  const updateLineNote = (lineId: string, note: string) => {
    const index = form.getValues('items').findIndex((line) => line.id === lineId);
    if (index < 0) return;

    form.setValue(`items.${index}.note`, note, { shouldDirty: true, shouldValidate: true });
  };

  const removeLine = (lineId: string) => {
    const index = form.getValues('items').findIndex((line) => line.id === lineId);
    if (index >= 0) removeLineAtIndex(index);
  };

  const restoreLine = (lineId: string) => {
    const index = form.getValues('items').findIndex((line) => line.id === lineId);
    if (index < 0) return;

    form.setValue(`items.${index}.removed`, false, { shouldDirty: true, shouldValidate: true });
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
    if (!values.range.from || !values.range.to || values.range.from >= values.range.to) {
      toast.error('Vui lòng chọn thời gian thuê hợp lệ');
      return;
    }

    if (shouldCheckAvailability) {
      if (!availabilityPayload) return;

      const availability = await checkAvailability.mutateAsync(availabilityPayload);
      if (!availability.isAvailable) {
        toast.error('Một số thiết bị không còn khả dụng trong khoảng thời gian này');
        return;
      }
    }

    const payload = buildRentalOrderUpdatePayload({
      values,
      dirtyFields,
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
    currentHandoverRequiredTotal,
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
