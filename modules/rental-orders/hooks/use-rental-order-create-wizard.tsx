'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useMemo, useState } from 'react';
import { type Resolver, useFieldArray, useForm, useWatch } from 'react-hook-form';
import { toast } from 'sonner';
import { createRentalOrderSchema, type ICreateRentalOrderInput } from '../schema';
import {
  buildAvailabilityPayload,
  buildCreateRentalOrderPayload,
  getEstimatedPricingLines,
  getRentalOrderPricingTotals,
  toInputDateTime,
  type EstimatedPricingLine,
} from '../utils';
import { useCheckRentalOrderAvailability } from './use-check-rental-order-availability';
import { useCreateRentalOrder } from './use-create-rental-order';
import { useRentalOrderCreateAssetSelection } from './use-rental-order-create-asset-selection';
import { useRentalOrderCreateCustomerSelection } from './use-rental-order-create-customer-selection';

export const rentalOrderCreateSteps = [
  { key: 'schedule', label: 'Lịch & nhận máy' },
  { key: 'products', label: 'Chọn thiết bị' },
  { key: 'customer', label: 'Thông tin khách hàng' },
  { key: 'payment', label: 'Thanh toán' },
] as const;

export type RentalOrderCreateStepKey = (typeof rentalOrderCreateSteps)[number]['key'];

type UseRentalOrderCreateWizardProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: () => void;
};

export function useRentalOrderCreateWizard({ open, onOpenChange, onCreated }: UseRentalOrderCreateWizardProps) {
  const [step, setStep] = useState<RentalOrderCreateStepKey>('schedule');
  const [rangeOpen, setRangeOpen] = useState(false);
  const checkAvailability = useCheckRentalOrderAvailability();
  const { mutate: checkSelectedAvailability, reset: resetSelectedAvailability } = checkAvailability;
  const createOrder = useCreateRentalOrder();
  const form = useForm<ICreateRentalOrderInput>({
    resolver: zodResolver(createRentalOrderSchema) as unknown as Resolver<ICreateRentalOrderInput>,
    defaultValues: {
      customerId: '',
      items: [],
      range: { from: undefined, to: undefined },
      pickupMethod: 'PICKUP_AT_STORE',
      deliveryAddress: '',
      deliveryFeeTotal: 0,
      discountTotal: 0,
      note: '',
      internalNote: '',
    },
  });
  const itemsFieldArray = useFieldArray({
    control: form.control,
    name: 'items',
    keyName: 'fieldId',
  });

  const stepIndex = rentalOrderCreateSteps.findIndex((item) => item.key === step);
  const range = useWatch({ control: form.control, name: 'range' });
  const watchedItems = useWatch({ control: form.control, name: 'items' });
  const items = useMemo(() => watchedItems ?? [], [watchedItems]);
  const customerId = useWatch({ control: form.control, name: 'customerId' });
  const pickupMethod = useWatch({ control: form.control, name: 'pickupMethod' });
  const deliveryAddress = useWatch({ control: form.control, name: 'deliveryAddress' });
  const deliveryFeeTotal = useWatch({ control: form.control, name: 'deliveryFeeTotal' });
  const discountTotal = useWatch({ control: form.control, name: 'discountTotal' });
  const startDate = toInputDateTime(range.from);
  const endDate = toInputDateTime(range.to);
  const hasValidRange = Boolean(range.from && range.to && range.from < range.to);
  const hasPickupInfo = pickupMethod === 'PICKUP_AT_STORE' || Boolean(deliveryAddress.trim());

  const resetAvailability = () => {
    resetSelectedAvailability();
  };

  const assetSelection = useRentalOrderCreateAssetSelection({
    open,
    startDate,
    endDate,
    hasValidRange,
    items,
    append: itemsFieldArray.append,
    remove: itemsFieldArray.remove,
    resetAvailability,
  });
  const customerSelection = useRentalOrderCreateCustomerSelection({
    open,
    hasValidRange,
    form,
  });

  const availabilityPayload = useMemo(
    () => buildAvailabilityPayload(items, startDate, endDate),
    [endDate, items, startDate],
  );

  useEffect(() => {
    if (!open || !hasValidRange || !items.length) {
      resetSelectedAvailability();
      return;
    }

    checkSelectedAvailability(availabilityPayload);
  }, [availabilityPayload, checkSelectedAvailability, hasValidRange, items.length, open, resetSelectedAvailability]);

  const pricingLines = useMemo<EstimatedPricingLine[]>(() => getEstimatedPricingLines(items, range), [items, range]);
  const { rentalSubtotal, originalDepositTotal, depositTotal, netRental, estimatedRefund, bookingHoldTotal } = useMemo(
    () =>
      getRentalOrderPricingTotals(
        pricingLines,
        discountTotal,
        assetSelection.bookingHoldAmountPerUnit,
        pickupMethod === 'DELIVERY' ? deliveryFeeTotal : 0,
      ),
    [assetSelection.bookingHoldAmountPerUnit, deliveryFeeTotal, discountTotal, pickupMethod, pricingLines],
  );
  const scheduleReady = hasValidRange && hasPickupInfo && items.length > 0;
  const scheduleChecked = scheduleReady && checkAvailability.data?.isAvailable === true;
  const hasAvailabilityConflict = checkAvailability.data?.isAvailable === false;
  const canCreate = scheduleChecked && Boolean(customerId) && !checkAvailability.isPending && !createOrder.isPending;

  const validateScheduleStep = async () => {
    return form.trigger(['range', 'pickupMethod', 'deliveryAddress', 'deliveryFeeTotal']);
  };

  const validateProductsStep = async () => {
    if (!items.length) {
      toast.error('Vui lòng thêm ít nhất một sản phẩm thuê');
      return false;
    }

    if (items.some((line) => !line.assetUnitId)) {
      toast.error('Vui lòng chọn đủ serial cho từng thiết bị thuê');
      return false;
    }

    const result = await checkAvailability.mutateAsync(availabilityPayload);
    if (!result.isAvailable) {
      toast.error('Một số thiết bị không còn khả dụng trong khoảng thời gian này');
      return false;
    }

    return true;
  };

  const handleNext = async () => {
    if (step === 'schedule') {
      const ok = await validateScheduleStep();
      if (!ok) return;
      setStep('products');
      return;
    }

    if (step === 'products') {
      const ok = await validateProductsStep();
      if (!ok) return;
      setStep('customer');
      return;
    }

    if (step === 'customer') {
      if (!form.getValues('customerId')) {
        toast.error('Vui lòng chọn hoặc tạo khách hàng');
        return;
      }
      setStep('payment');
    }
  };

  const handleBack = () => {
    setStep(rentalOrderCreateSteps[Math.max(stepIndex - 1, 0)].key);
  };

  const handleClose = () => {
    form.reset();
    resetSelectedAvailability();
    setStep('schedule');
    setRangeOpen(false);
    assetSelection.resetAssetTable();
    customerSelection.resetCustomerSelection();
    onOpenChange(false);
  };

  const handleCreate = async (values: ICreateRentalOrderInput) => {
    if (!canCreate) return;

    await createOrder.mutateAsync(
      buildCreateRentalOrderPayload({
        values,
        startDate,
        endDate,
      }),
    );

    onCreated?.();
    handleClose();
  };

  return {
    assetTable: assetSelection.assetTable,
    canCreate,
    checkAvailability,
    customerDialogOpen: customerSelection.customerDialogOpen,
    customerTable: customerSelection.customerTable,
    depositTotal,
    discountTotal,
    endDate,
    estimatedRefund,
    form,
    handleBack,
    handleClose,
    handleCreate,
    handleCustomerCreated: customerSelection.handleCustomerCreated,
    handleNext,
    hasAvailabilityConflict,
    items,
    netRental,
    originalDepositTotal,
    pickupMethod,
    pricingLines,
    range,
    rangeOpen,
    removeAssetByLineId: assetSelection.removeAssetByLineId,
    rentalSubtotal,
    resetAvailability,
    selectedCustomer: customerSelection.selectedCustomer,
    setCustomerDialogOpen: customerSelection.setCustomerDialogOpen,
    setRangeOpen,
    setStep,
    startDate,
    step,
    stepIndex,
    bookingHoldTotal,
    deliveryFeeTotal,
  };
}
