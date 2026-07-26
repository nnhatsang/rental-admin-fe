'use client';

import { DateTimeRange, DateTimeRangePicker } from '@/components/shared/date-time-range-picker';
import {
  Stepper,
  StepperContent,
  StepperIndicator,
  StepperItem,
  StepperNav,
  StepperPanel,
  StepperSeparator,
  StepperTitle,
  StepperTrigger,
} from '@/components/reui/stepper';
import { DebouncedSearchInput } from '@/components/shared/debounced-search-input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select';
import { Textarea } from '@/components/ui/textarea';
import { formatCurrency, formatDate } from '@/lib/utils';
import { useGetAvailabilityAssets } from '@/modules/availability/hooks/use-get-availability-assets';
import { useGetAvailabilityProducts } from '@/modules/availability/hooks/use-get-availability-products';
import {
  IconArrowLeft,
  IconCheck,
  IconChevronLeft,
  IconChevronRight,
  IconPlus,
  IconRefresh,
  IconTrash,
} from '@tabler/icons-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { toast } from 'sonner';
import { useCheckRentalOrderAvailability } from './hooks/use-check-rental-order-availability';
import { useCreateCustomer } from './hooks/use-create-customer';
import { useCreateRentalOrder } from './hooks/use-create-rental-order';
import { useGetCustomers } from './hooks/use-get-customers';
import type { ICreateCustomerReq, ICustomerOut, OrderLineDraft, PickupMethod } from './type';

const steps = [
  { key: 'schedule', label: 'Lịch & thiết bị' },
  { key: 'customer', label: 'Thông tin khách hàng' },
  { key: 'payment', label: 'Thanh toán' },
] as const;

type StepKey = (typeof steps)[number]['key'];

type RentalOrderWizardForm = {
  range: DateTimeRange;
  pickupMethod: PickupMethod;
  deliveryAddress: string;
  deliveryFeeTotal: number;
  discountTotal: number;
  note: string;
  internalNote: string;
};

const createLineId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `${Date.now()}-${Math.random()}`;
};

const toInputDateTime = (date: Date | undefined) => (date ? date.toISOString() : '');
const normalizeOptional = (value: string) => value.trim() || undefined;

const pickupMethodLabels: Record<PickupMethod, string> = {
  PICKUP_AT_STORE: 'Nhận tại cửa hàng',
  DELIVERY: 'Giao tận nơi',
};

function CustomerCreateDialog({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (customer: ICustomerOut) => void;
}) {
  const createCustomer = useCreateCustomer();
  const [form, setForm] = useState<ICreateCustomerReq>({ name: '' });

  const update = (key: keyof ICreateCustomerReq, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      toast.error('Vui lòng nhập tên khách hàng');
      return;
    }

    const customer = await createCustomer.mutateAsync({
      name: form.name.trim(),
      phone: normalizeOptional(form.phone ?? ''),
      email: normalizeOptional(form.email ?? ''),
      address: normalizeOptional(form.address ?? ''),
      identityNumber: normalizeOptional(form.identityNumber ?? ''),
      socialContact: normalizeOptional(form.socialContact ?? ''),
      notes: normalizeOptional(form.notes ?? ''),
    });

    onCreated(customer);
    setForm({ name: '' });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Tạo nhanh khách hàng</DialogTitle>
        </DialogHeader>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5 sm:col-span-2">
            <Label>Tên khách hàng</Label>
            <Input
              value={form.name}
              onChange={(event) => update('name', event.target.value)}
              placeholder="Nguyễn Văn A"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Số điện thoại</Label>
            <Input
              value={form.phone ?? ''}
              onChange={(event) => update('phone', event.target.value)}
              placeholder="0901234567"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Email</Label>
            <Input
              value={form.email ?? ''}
              onChange={(event) => update('email', event.target.value)}
              placeholder="name@example.com"
            />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label>Địa chỉ</Label>
            <Input value={form.address ?? ''} onChange={(event) => update('address', event.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>CCCD/CMND</Label>
            <Input
              value={form.identityNumber ?? ''}
              onChange={(event) => update('identityNumber', event.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Liên hệ MXH</Label>
            <Input value={form.socialContact ?? ''} onChange={(event) => update('socialContact', event.target.value)} />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label>Ghi chú</Label>
            <Textarea value={form.notes ?? ''} onChange={(event) => update('notes', event.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={createCustomer.isPending}>
            Hủy
          </Button>
          <Button onClick={handleSubmit} disabled={createCustomer.isPending}>
            Tạo khách hàng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function AssetUnitSelector({
  line,
  startDate,
  endDate,
  disabled,
  onChange,
}: {
  line: OrderLineDraft;
  startDate: string;
  endDate: string;
  disabled: boolean;
  onChange: (assetUnitIds: string[]) => void;
}) {
  const query = useGetAvailabilityAssets(
    {
      productId: line.productId,
      startDate,
      endDate,
      page: 1,
      perPage: 100,
      availability: 'AVAILABLE',
    },
    !disabled && Boolean(startDate && endDate && line.productId),
  );
  const assets = query.data?.items ?? [];

  const toggleAsset = (assetUnitId: string, checked: boolean) => {
    if (checked) {
      if (line.assetUnitIds.length >= line.quantity) {
        toast.error('Số serial đã chọn không được vượt quá số lượng thuê');
        return;
      }
      onChange([...line.assetUnitIds, assetUnitId]);
      return;
    }

    onChange(line.assetUnitIds.filter((id) => id !== assetUnitId));
  };

  return (
    <div className="rounded-lg border p-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <div className="font-medium">{line.productName}</div>
          <div className="text-xs text-muted-foreground">
            {line.sku} · cần {line.quantity} máy · đã chọn {line.assetUnitIds.length}
          </div>
        </div>
        <Badge variant={line.assetUnitIds.length ? 'default' : 'outline'}>
          {line.assetUnitIds.length ? 'Có gán serial' : 'Chưa gán serial'}
        </Badge>
      </div>
      <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {disabled ? <p className="text-sm text-muted-foreground">Chọn thời gian thuê để tải serial rảnh.</p> : null}
        {!disabled && query.isLoading ? <p className="text-sm text-muted-foreground">Đang tải serial...</p> : null}
        {!disabled && !query.isLoading && assets.length === 0 ? (
          <p className="text-sm text-muted-foreground">Không có serial rảnh để gán trước.</p>
        ) : null}
        {assets.map((asset) => {
          const checked = line.assetUnitIds.includes(asset.assetUnitId);
          return (
            <label
              key={asset.assetUnitId}
              className="flex cursor-pointer items-center gap-2 rounded-md border p-2 text-sm"
            >
              <Checkbox checked={checked} onCheckedChange={(value) => toggleAsset(asset.assetUnitId, value === true)} />
              <span className="min-w-0 truncate">{asset.serialNumber}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
}

type RentalOrderCreateWizardProps = {
  mode?: 'page' | 'dialog';
  onCreated?: () => void;
};

export function RentalOrderCreateWizard({ mode = 'page', onCreated }: RentalOrderCreateWizardProps) {
  const router = useRouter();
  const [step, setStep] = useState<StepKey>('schedule');
  const [customerSearch, setCustomerSearch] = useState('');
  const [productSearch, setProductSearch] = useState('');
  const [customerDialogOpen, setCustomerDialogOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<ICustomerOut | null>(null);
  const [rangeOpen, setRangeOpen] = useState(false);
  const [lines, setLines] = useState<OrderLineDraft[]>([]);
  const checkAvailability = useCheckRentalOrderAvailability();
  const createOrder = useCreateRentalOrder();
  const form = useForm<RentalOrderWizardForm>({
    defaultValues: {
      range: { from: undefined, to: undefined },
      pickupMethod: 'PICKUP_AT_STORE',
      deliveryAddress: '',
      deliveryFeeTotal: 0,
      discountTotal: 0,
      note: '',
      internalNote: '',
    },
  });

  const stepIndex = steps.findIndex((item) => item.key === step);
  const range = useWatch({ control: form.control, name: 'range' });
  const pickupMethod = useWatch({ control: form.control, name: 'pickupMethod' });
  const deliveryAddress = useWatch({ control: form.control, name: 'deliveryAddress' });
  const deliveryFeeTotal = useWatch({ control: form.control, name: 'deliveryFeeTotal' });
  const discountTotal = useWatch({ control: form.control, name: 'discountTotal' });
  const note = useWatch({ control: form.control, name: 'note' });
  const internalNote = useWatch({ control: form.control, name: 'internalNote' });
  const startDate = toInputDateTime(range.from);
  const endDate = toInputDateTime(range.to);
  const hasValidRange = Boolean(range.from && range.to && range.from < range.to);
  const needsDeliveryAddress = pickupMethod === 'DELIVERY';
  const hasPickupInfo = pickupMethod === 'PICKUP_AT_STORE' || Boolean(deliveryAddress.trim());

  const customersQuery = useGetCustomers({
    page: 1,
    perPage: 10,
    search: customerSearch || undefined,
    status: 'ACTIVE',
  });
  const productsQuery = useGetAvailabilityProducts(
    {
      page: 1,
      perPage: 20,
      search: productSearch || undefined,
      availability: 'AVAILABLE',
      startDate,
      endDate,
    },
    hasValidRange,
  );

  const availabilityPayload = useMemo(
    () => ({
      startDate,
      endDate,
      items: lines.map((line) => ({
        productId: line.productId,
        quantity: line.quantity,
        assetUnitIds: line.assetUnitIds.length ? line.assetUnitIds : undefined,
      })),
    }),
    [endDate, lines, startDate],
  );

  const selectedQuantity = lines.reduce((total, line) => total + line.quantity, 0);
  const selectedSerialCount = lines.reduce((total, line) => total + line.assetUnitIds.length, 0);
  const unavailableProductIds = new Set(checkAvailability.data?.unavailableItems.map((item) => item.productId) ?? []);
  const scheduleReady = hasValidRange && hasPickupInfo && lines.length > 0;
  const scheduleChecked = scheduleReady && checkAvailability.data?.isAvailable === true;
  const canCreate =
    scheduleChecked && Boolean(selectedCustomer) && !checkAvailability.isPending && !createOrder.isPending;

  const resetAvailability = () => {
    checkAvailability.reset();
  };

  const addOrIncrementLine = (product: NonNullable<typeof productsQuery.data>['items'][number]) => {
    if (product.inventory.available <= 0) return;

    setLines((current) => {
      const existing = current.find((line) => line.productId === product.productId);
      if (existing) {
        return current.map((line) =>
          line.productId === product.productId
            ? { ...line, quantity: Math.min(line.quantity + 1, product.inventory.available) }
            : line,
        );
      }

      return [
        ...current,
        {
          id: createLineId(),
          productId: product.productId,
          productName: product.name,
          sku: product.sku,
          quantity: 1,
          available: product.inventory.available,
          reserved: product.inventory.reserved,
          total: product.inventory.total,
          assetUnitIds: [],
        },
      ];
    });
    resetAvailability();
  };

  const updateLine = (lineId: string, patch: Partial<OrderLineDraft>) => {
    setLines((current) =>
      current.map((line) => {
        if (line.id !== lineId) return line;
        const nextQuantity = patch.quantity ?? line.quantity;
        const nextAssetUnitIds = (patch.assetUnitIds ?? line.assetUnitIds).slice(0, nextQuantity);
        return { ...line, ...patch, assetUnitIds: nextAssetUnitIds };
      }),
    );
    resetAvailability();
  };

  const removeLine = (lineId: string) => {
    setLines((current) => current.filter((line) => line.id !== lineId));
    resetAvailability();
  };

  const validateScheduleStep = async () => {
    if (!hasValidRange) {
      toast.error('Vui lòng chọn thời gian thuê hợp lệ');
      return false;
    }

    if (needsDeliveryAddress && !deliveryAddress.trim()) {
      toast.error('Vui lòng nhập địa chỉ giao thiết bị');
      return false;
    }

    if (!lines.length) {
      toast.error('Vui lòng thêm ít nhất một sản phẩm thuê');
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
      setStep('customer');
      return;
    }

    if (step === 'customer') {
      if (!selectedCustomer) {
        toast.error('Vui lòng chọn hoặc tạo khách hàng');
        return;
      }
      setStep('payment');
    }
  };

  const handleBack = () => {
    setStep(steps[Math.max(stepIndex - 1, 0)].key);
  };

  const handleCreate = async () => {
    if (!selectedCustomer || !canCreate) return;

    const items = lines.flatMap((line) =>
      Array.from({ length: line.quantity }, (_, index) => ({
        productId: line.productId,
        assetUnitId: line.assetUnitIds[index],
        note: normalizeOptional(line.note ?? ''),
      })),
    );

    await createOrder.mutateAsync({
      customerId: selectedCustomer.id,
      startDate,
      endDate,
      pickupMethod,
      deliveryAddress: pickupMethod === 'DELIVERY' ? deliveryAddress.trim() : '',
      deliveryFeeTotal: pickupMethod === 'DELIVERY' ? deliveryFeeTotal : 0,
      discountTotal,
      note: normalizeOptional(note),
      internalNote: normalizeOptional(internalNote),
      items,
    });

    if (onCreated) {
      onCreated();
      return;
    }

    router.push('/rental-orders');
  };

  return (
    <div className="space-y-4">
      {mode === 'page' ? (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Button variant="ghost" size="sm" asChild className="-ml-2">
              <Link href="/rental-orders">
                <IconArrowLeft className="mr-1.5 size-4" />
                Danh sách đơn thuê
              </Link>
            </Button>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight">Tạo đơn thuê</h1>
            <p className="text-sm text-muted-foreground">
              Kiểm tra lịch trống, chọn khách hàng và tạo đơn nháp trong một luồng.
            </p>
          </div>
        </div>
      ) : null}

      <Stepper
        className="w-full space-y-5"
        value={stepIndex + 1}
        onValueChange={(value) => setStep(steps[value - 1].key)}
        indicators={{ completed: <IconCheck className="size-3.5" /> }}
      >
        <StepperNav>
          {steps.map((item, index) => (
            <StepperItem
              key={item.key}
              step={index + 1}
              disabled={index > stepIndex}
              className="relative flex-1 items-start"
            >
              <StepperTrigger className="flex flex-col gap-2.5">
                <StepperIndicator className="size-10">{index + 1}</StepperIndicator>
                <StepperTitle className="text-center text-[10px] font-medium uppercase leading-tight tracking-widest text-primary sm:text-xs">
                  {item.label}
                </StepperTitle>
              </StepperTrigger>
              {steps.length > index + 1 ? (
                <StepperSeparator className="group-data-[state=completed]/step:bg-primary absolute inset-x-0 top-3 left-[calc(50%+1.975rem)] m-0 group-data-[orientation=horizontal]/stepper-nav:w-[calc(100%-4rem+0.225rem)] group-data-[orientation=horizontal]/stepper-nav:flex-none" />
              ) : null}
            </StepperItem>
          ))}
        </StepperNav>

        <StepperPanel>
          <Card>
            <CardHeader>
              {TitleSection({
                title: steps[stepIndex].label,
                desc:
                  step === 'schedule'
                    ? 'Chọn khung giờ, hình thức nhận máy, sản phẩm và serial nếu muốn gán trước.'
                    : step === 'customer'
                      ? 'Chọn khách hàng cũ hoặc tạo nhanh hồ sơ mới.'
                      : 'Kiểm tra lại thông tin, nhập giảm giá và ghi chú trước khi tạo đơn nháp.',
              })}
            </CardHeader>
            <CardContent className="space-y-5">
              <StepperContent value={1} className="space-y-5">
                <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <Label>Thời gian thuê</Label>
                      <Controller
                        control={form.control}
                        name="range"
                        render={({ field }) => (
                          <DateTimeRangePicker
                            value={field.value}
                            onUpdate={({ range: nextRange }) => {
                              field.onChange(nextRange);
                              resetAvailability();
                            }}
                            open={rangeOpen}
                            setOpen={setRangeOpen}
                            enableTime
                          />
                        )}
                      />
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <Label>Hình thức nhận</Label>
                        <Controller
                          control={form.control}
                          name="pickupMethod"
                          render={({ field }) => (
                            <NativeSelect
                              className="w-full"
                              value={field.value}
                              onChange={(event) => {
                                field.onChange(event.target.value as PickupMethod);
                                resetAvailability();
                              }}
                            >
                              <NativeSelectOption value="PICKUP_AT_STORE">Nhận tại cửa hàng</NativeSelectOption>
                              <NativeSelectOption value="DELIVERY">Giao tận nơi</NativeSelectOption>
                            </NativeSelect>
                          )}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label>Phí giao</Label>
                        <Controller
                          control={form.control}
                          name="deliveryFeeTotal"
                          render={({ field }) => (
                            <Input
                              type="number"
                              min={0}
                              value={field.value}
                              disabled={pickupMethod !== 'DELIVERY'}
                              onChange={(event) => field.onChange(Math.max(Number(event.target.value), 0))}
                            />
                          )}
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label>Địa chỉ giao</Label>
                      <Controller
                        control={form.control}
                        name="deliveryAddress"
                        render={({ field }) => (
                          <Input
                            value={field.value}
                            disabled={pickupMethod !== 'DELIVERY'}
                            onChange={(event) => {
                              field.onChange(event.target.value);
                              resetAvailability();
                            }}
                            placeholder="Bắt buộc nếu chọn giao tận nơi"
                          />
                        )}
                      />
                    </div>
                  </div>

                  <div className="rounded-lg border p-4 text-sm">
                    <div className="font-medium">Tóm tắt lịch</div>
                    <div className="mt-3 space-y-2 text-muted-foreground">
                      <div>Nhận: {range.from ? formatDate(range.from) : '-'}</div>
                      <div>Trả: {range.to ? formatDate(range.to) : '-'}</div>
                      <div>Hình thức: {pickupMethodLabels[pickupMethod]}</div>
                      {pickupMethod === 'DELIVERY' ? <div>Địa chỉ: {deliveryAddress || '-'}</div> : null}
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 border-t pt-5 lg:grid-cols-[minmax(0,1fr)_minmax(360px,0.75fr)]">
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <Label>Sản phẩm khả dụng</Label>
                      <DebouncedSearchInput
                        value={productSearch}
                        onDebouncedChange={(value) => setProductSearch(value ?? '')}
                        placeholder="Tìm sản phẩm, SKU..."
                      />
                    </div>

                    {!hasValidRange ? (
                      <p className="rounded-lg border p-4 text-sm text-muted-foreground">
                        Chọn thời gian thuê hợp lệ để xem tồn kho khả dụng.
                      </p>
                    ) : null}
                    {hasValidRange && productsQuery.isLoading ? (
                      <p className="rounded-lg border p-4 text-sm text-muted-foreground">
                        Đang tải sản phẩm khả dụng...
                      </p>
                    ) : null}
                    <div className="grid gap-2">
                      {productsQuery.data?.items.map((product) => (
                        <div
                          key={product.productId}
                          className="flex items-center justify-between gap-3 rounded-lg border p-3"
                        >
                          <div className="min-w-0">
                            <div className="truncate font-medium">{product.name}</div>
                            <div className="truncate text-xs text-muted-foreground">
                              {product.sku} · rảnh {product.inventory.available}/{product.inventory.total} · đã giữ{' '}
                              {product.inventory.reserved} ·{' '}
                              {formatCurrency(Number(product.dailyPrice), { noDecimals: true })}/ngày
                            </div>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => addOrIncrementLine(product)}
                            disabled={product.inventory.available <= 0}
                          >
                            Thêm
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <h2 className="text-sm font-semibold">Thiết bị đã chọn</h2>
                      <Badge variant="outline">{selectedQuantity} máy</Badge>
                    </div>
                    {lines.length === 0 ? (
                      <p className="rounded-lg border p-4 text-sm text-muted-foreground">Chưa có sản phẩm.</p>
                    ) : null}
                    {lines.map((line) => (
                      <div key={line.id} className="space-y-3 rounded-lg border p-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <div className="truncate font-medium">{line.productName}</div>
                            <div className="text-xs text-muted-foreground">
                              {line.sku} · rảnh {line.available}/{line.total}
                            </div>
                          </div>
                          <Button size="icon" variant="ghost" onClick={() => removeLine(line.id)}>
                            <IconTrash className="size-4" />
                          </Button>
                        </div>
                        <div className="grid gap-2 sm:grid-cols-[120px_minmax(0,1fr)]">
                          <div className="space-y-1.5">
                            <Label>Số lượng</Label>
                            <Input
                              type="number"
                              min={1}
                              max={line.available}
                              value={line.quantity}
                              onChange={(event) =>
                                updateLine(line.id, {
                                  quantity: Math.min(Math.max(Number(event.target.value), 1), line.available),
                                })
                              }
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label>Ghi chú dòng</Label>
                            <Input
                              value={line.note ?? ''}
                              onChange={(event) => updateLine(line.id, { note: event.target.value })}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-3 border-t pt-5">
                  <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border p-3">
                    <div>
                      <div className="text-sm font-medium">Kiểm tra lịch trống</div>
                      <div className="text-xs text-muted-foreground">
                        {checkAvailability.data
                          ? checkAvailability.data.isAvailable
                            ? `Khả dụng, blocked đến ${formatDate(checkAvailability.data.blockedEndDate)}`
                            : 'Có dòng bị trùng lịch hoặc không đủ số lượng.'
                          : 'Gán serial là tùy chọn trong V1, phần còn lại kho có thể xử lý sau.'}
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => checkAvailability.mutate(availabilityPayload)}
                      disabled={!scheduleReady || checkAvailability.isPending}
                    >
                      <IconRefresh className="mr-1.5 size-4" />
                      Kiểm tra lại
                    </Button>
                  </div>
                  {checkAvailability.data && !checkAvailability.data.isAvailable ? (
                    <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
                      {checkAvailability.data.unavailableItems.map((item, index) => (
                        <div key={`${item.productId}-${item.assetUnitId ?? index}`}>{item.reason}</div>
                      ))}
                    </div>
                  ) : null}
                  {lines.map((line) => (
                    <div
                      key={line.id}
                      className={
                        unavailableProductIds.has(line.productId) ? 'rounded-lg ring-1 ring-destructive' : undefined
                      }
                    >
                      <AssetUnitSelector
                        line={line}
                        startDate={startDate}
                        endDate={endDate}
                        disabled={!hasValidRange}
                        onChange={(assetUnitIds) => updateLine(line.id, { assetUnitIds })}
                      />
                    </div>
                  ))}
                </div>
              </StepperContent>

              <StepperContent value={2}>
                <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <Label>Khách hàng</Label>
                      <Button size="sm" variant="outline" onClick={() => setCustomerDialogOpen(true)}>
                        <IconPlus className="mr-1.5 size-4" />
                        Tạo nhanh
                      </Button>
                    </div>
                    <DebouncedSearchInput
                      value={customerSearch}
                      onDebouncedChange={(value) => setCustomerSearch(value ?? '')}
                      placeholder="Tìm tên, SĐT, email khách hàng..."
                    />
                    <div className="grid max-h-80 gap-2 overflow-auto rounded-lg border p-2">
                      {customersQuery.data?.items.map((customer) => {
                        const selected = selectedCustomer?.id === customer.id;
                        return (
                          <button
                            key={customer.id}
                            type="button"
                            onClick={() => setSelectedCustomer(customer)}
                            className="rounded-md border p-3 text-left text-sm transition-colors hover:bg-muted data-[selected=true]:border-primary data-[selected=true]:bg-primary/5"
                            data-selected={selected}
                          >
                            <div className="font-medium">{customer.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {[customer.phone, customer.email].filter(Boolean).join(' · ') ||
                                'Chưa có thông tin liên hệ'}
                            </div>
                          </button>
                        );
                      })}
                      {customersQuery.isLoading ? (
                        <p className="p-3 text-sm text-muted-foreground">Đang tải khách hàng...</p>
                      ) : null}
                      {!customersQuery.isLoading && !customersQuery.data?.items.length ? (
                        <p className="p-3 text-sm text-muted-foreground">Không tìm thấy khách hàng.</p>
                      ) : null}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="rounded-lg border p-4">
                      <div className="text-sm font-medium">Đang thuê</div>
                      <div className="mt-3 space-y-2 text-sm text-muted-foreground">
                        <div>{selectedQuantity} máy</div>
                        <div>Serial đã gán: {selectedSerialCount}</div>
                        <div>Nhận: {range.from ? formatDate(range.from) : '-'}</div>
                        <div>Trả: {range.to ? formatDate(range.to) : '-'}</div>
                      </div>
                    </div>
                    {selectedCustomer ? (
                      <div className="rounded-lg border p-4">
                        <div className="font-medium">{selectedCustomer.name}</div>
                        <div className="mt-2 text-sm text-muted-foreground">
                          <div>{selectedCustomer.phone ?? '-'}</div>
                          <div>{selectedCustomer.email ?? '-'}</div>
                          <div>{selectedCustomer.address ?? '-'}</div>
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>
              </StepperContent>

              <StepperContent value={3}>
                <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
                  <div className="space-y-3">
                    <div className="rounded-lg border p-3">
                      <div className="font-medium">{selectedCustomer?.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {selectedCustomer?.phone ?? '-'} · {selectedCustomer?.email ?? '-'}
                      </div>
                    </div>
                    <div className="rounded-lg border p-3 text-sm">
                      <div>Nhận: {range.from ? formatDate(range.from) : '-'}</div>
                      <div>Trả: {range.to ? formatDate(range.to) : '-'}</div>
                      <div>Hình thức: {pickupMethodLabels[pickupMethod]}</div>
                      {pickupMethod === 'DELIVERY' ? <div>Phí giao: {formatCurrency(deliveryFeeTotal)}</div> : null}
                    </div>
                    <div className="space-y-2">
                      {lines.map((line) => (
                        <div key={line.id} className="rounded-lg border p-3">
                          <div className="font-medium">
                            {line.productName} x {line.quantity}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Serial đã chọn: {line.assetUnitIds.length ? line.assetUnitIds.length : 'chưa gán'}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <Label>Giảm giá</Label>
                      <Controller
                        control={form.control}
                        name="discountTotal"
                        render={({ field }) => (
                          <Input
                            type="number"
                            min={0}
                            value={field.value}
                            onChange={(event) => field.onChange(Math.max(Number(event.target.value), 0))}
                          />
                        )}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Ghi chú khách</Label>
                      <Controller control={form.control} name="note" render={({ field }) => <Textarea {...field} />} />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Ghi chú nội bộ</Label>
                      <Controller
                        control={form.control}
                        name="internalNote"
                        render={({ field }) => <Textarea {...field} />}
                      />
                    </div>
                  </div>
                </div>
              </StepperContent>

              <div className="flex flex-col-reverse gap-2 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
                <Button variant="outline" disabled={stepIndex === 0 || createOrder.isPending} onClick={handleBack}>
                  <IconChevronLeft className="mr-1.5 size-4" />
                  Quay lại
                </Button>
                <div className="flex gap-2">
                  {step !== 'payment' ? (
                    <Button onClick={handleNext} disabled={checkAvailability.isPending}>
                      Tiếp tục
                      <IconChevronRight className="ml-1.5 size-4" />
                    </Button>
                  ) : (
                    <Button onClick={handleCreate} disabled={!canCreate}>
                      Tạo đơn nháp
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </StepperPanel>
      </Stepper>

      <CustomerCreateDialog
        open={customerDialogOpen}
        onOpenChange={setCustomerDialogOpen}
        onCreated={(customer) => {
          setSelectedCustomer(customer);
          setCustomerSearch(customer.name);
        }}
      />
    </div>
  );
}

export default function RentalOrderCreate() {
  return <RentalOrderCreateWizard mode="page" />;
}
function TitleSection({ title, index, desc }: { title: string; index?: number; desc?: string }) {
  return (
    <>
      <h2 className="text-base font-bold text-primary uppercase leading-tight flex items-center gap-3">
        {index && (
          <span className="flex items-center justify-center size-8 rounded-full bg-primary/20 text-primary text-sm">
            {index}
          </span>
        )}
        {title}
      </h2>
      {desc && <span className="pt-1">{desc}</span>}
    </>
  );
}
