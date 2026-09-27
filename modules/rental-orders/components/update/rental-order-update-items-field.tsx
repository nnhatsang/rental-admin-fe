'use client';

import {
  NumberField,
  NumberFieldDecrement,
  NumberFieldGroup,
  NumberFieldIncrement,
  NumberFieldInput,
} from '@/components/reui/number-field';
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Field, FieldDescription, FieldError, FieldLabel, FieldSet } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { cn, formatCurrency } from '@/lib/utils';
import { ProductCombobox, type ProductOption } from '@/modules/asset-units/product-combobox';
import { IconPackage, IconRefresh, IconTrash } from '@tabler/icons-react';
import { useEffect, useMemo, useState } from 'react';
import { RentalOrderBadge } from '../status-badge';
import {
  rentalOrderItemChangeStateConfig,
  type RentalOrderItemChangeState,
} from '../../display-config';
import type { RentalOrderItemValue } from '../form/rental-order-items-field';

type RentalOrderItemError = {
  message?: string;
};

type UpdateItemFilter = 'all' | 'changed' | 'unchanged';

type UpdateItemRow = {
  productId: string;
  product?: ProductOption;
  currentItem?: RentalOrderItemValue;
  initialItem?: RentalOrderItemValue;
  currentQuantity: number;
  initialQuantity: number;
  state: RentalOrderItemChangeState;
};

type RentalOrderUpdateItemsFieldProps = {
  value: RentalOrderItemValue[];
  onChange: (value: RentalOrderItemValue[]) => void;
  error?: RentalOrderItemError;
  initialItems: RentalOrderItemValue[];
  initialProducts?: ProductOption[];
  portalContainer?: HTMLElement | null;
  disabled?: boolean;
};

function getChangeState({
  hasInitial,
  hasCurrent,
  initialQuantity,
  currentQuantity,
}: {
  hasInitial: boolean;
  hasCurrent: boolean;
  initialQuantity: number;
  currentQuantity: number;
}): RentalOrderItemChangeState {
  if (!hasCurrent) return 'REMOVED';
  if (!hasInitial) return 'ADDED';
  if (currentQuantity > initialQuantity) return 'INCREASED';
  if (currentQuantity < initialQuantity) return 'DECREASED';
  return 'UNCHANGED';
}

function getPriceDescription(product?: ProductOption) {
  if (product?.rentalPrice != null) {
    return formatCurrency(product.rentalPrice, { noDecimals: true });
  }

  if (product?.dailyPrice != null || product?.halfDayPrice != null) {
    return `Ngày ${product.dailyPrice != null ? formatCurrency(product.dailyPrice, { noDecimals: true }) : '-'} · Buổi ${product.halfDayPrice != null ? formatCurrency(product.halfDayPrice, { noDecimals: true }) : '-'}`;
  }

  return 'Quote sẽ tính theo lịch';
}

export function RentalOrderUpdateItemsField({
  value,
  onChange,
  error,
  initialItems,
  initialProducts = [],
  portalContainer,
  disabled = false,
}: RentalOrderUpdateItemsFieldProps) {
  const [draftProductId, setDraftProductId] = useState('');
  const [draftProduct, setDraftProduct] = useState<ProductOption | null>(null);
  const [search, setSearch] = useState('');
  const [changeFilter, setChangeFilter] = useState<UpdateItemFilter>('all');
  const initialProductMap = useMemo<Record<string, ProductOption>>(
    () => Object.fromEntries(initialProducts.map((product) => [product.id, product])),
    [initialProducts],
  );
  const [selectedProducts, setSelectedProducts] = useState<Record<string, ProductOption>>(initialProductMap);
  const initialItemsById = useMemo(() => new Map(initialItems.map((item) => [item.productId, item])), [initialItems]);

  useEffect(() => {
    setSelectedProducts(initialProductMap);
    setDraftProductId('');
    setDraftProduct(null);
  }, [initialProductMap]);

  const rows = useMemo<UpdateItemRow[]>(() => {
    const currentItemsById = new Map(value.map((item) => [item.productId, item]));
    const productIds = Array.from(new Set([...initialItems.map((item) => item.productId), ...value.map((item) => item.productId)]));

    return productIds.map((productId) => {
      const initialItem = initialItemsById.get(productId);
      const currentItem = currentItemsById.get(productId);
      const initialQuantity = initialItem?.quantity ?? 0;
      const currentQuantity = currentItem?.quantity ?? 0;

      return {
        productId,
        product: selectedProducts[productId],
        currentItem,
        initialItem,
        currentQuantity,
        initialQuantity,
        state: getChangeState({
          hasInitial: Boolean(initialItem),
          hasCurrent: Boolean(currentItem),
          initialQuantity,
          currentQuantity,
        }),
      };
    });
  }, [initialItems, initialItemsById, selectedProducts, value]);

  const filteredRows = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase();

    return rows.filter((row) => {
      const productName = row.product?.name ?? row.productId;
      const productSku = row.product?.sku ?? '';
      const matchesSearch = !normalizedSearch || `${productName} ${productSku} ${row.productId}`.toLocaleLowerCase().includes(normalizedSearch);
      const matchesFilter = changeFilter === 'all' || (changeFilter === 'changed' ? row.state !== 'UNCHANGED' : row.state === 'UNCHANGED');

      return matchesSearch && matchesFilter;
    });
  }, [changeFilter, rows, search]);

  const changedCount = rows.filter((row) => row.state !== 'UNCHANGED').length;
  const removedCount = rows.filter((row) => row.state === 'REMOVED').length;

  const addProduct = (product: ProductOption) => {
    const existingItem = value.find((item) => item.productId === product.id);
    const initialItem = initialItemsById.get(product.id);
    const nextQuantity = existingItem ? existingItem.quantity + 1 : (initialItem?.quantity ?? 1);

    if (product.assetUnitCount !== undefined && nextQuantity > product.assetUnitCount) {
      setDraftProductId('');
      setDraftProduct(null);
      return;
    }

    const nextItem = existingItem
      ? { ...existingItem, quantity: nextQuantity }
      : {
          productId: product.id,
          quantity: initialItem?.quantity ?? 1,
          note: initialItem?.note,
        };

    onChange(existingItem ? value.map((item) => (item.productId === product.id ? nextItem : item)) : [...value, nextItem]);
    setSelectedProducts((current) => ({ ...current, [product.id]: product }));
    setDraftProductId('');
    setDraftProduct(null);
  };

  const handleProductChange = (product: ProductOption | null) => {
    setDraftProductId(product?.id ?? '');
    setDraftProduct(product);
    if (product) addProduct(product);
  };

  const updateQuantity = (productId: string, nextValue: number | null) => {
    if (nextValue === null || !Number.isInteger(nextValue) || nextValue < 1) return;
    const maxQuantity = selectedProducts[productId]?.assetUnitCount;
    if (maxQuantity !== undefined && nextValue > maxQuantity) return;
    onChange(value.map((item) => (item.productId === productId ? { ...item, quantity: nextValue } : item)));
  };

  const removeProduct = (productId: string) => {
    onChange(value.filter((item) => item.productId !== productId));
  };

  const restoreProduct = (productId: string) => {
    const initialItem = initialItemsById.get(productId);
    if (!initialItem || value.some((item) => item.productId === productId)) return;
    onChange([...value, { ...initialItem }]);
  };

  return (
    <FieldSet data-invalid={Boolean(error)} className="gap-3">
      <Field>
        <FieldLabel htmlFor="rental-order-update-product-search">Thêm sản phẩm</FieldLabel>
        <ProductCombobox
          value={draftProductId}
          selectedProduct={draftProduct}
          onProductChange={handleProductChange}
          disabled={disabled}
          ariaInvalid={Boolean(error)}
          placeholder="Tìm theo tên hoặc SKU để thêm"
          fetchEnabled
          portalContainer={portalContainer}
        />
        <FieldDescription>
          Chỉnh số lượng theo sản phẩm. Backend sẽ tự phân bổ asset unit còn trống sau khi quote được xác nhận.
        </FieldDescription>
      </Field>

      <div className="grid gap-3 rounded-xl border border-accent/60 bg-background/50 p-3">
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <Field>
            <FieldLabel htmlFor="rental-order-update-items-filter">Lọc thiết bị</FieldLabel>
            <Input
              id="rental-order-update-items-filter"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Tên sản phẩm, SKU hoặc Product ID"
              disabled={!rows.length}
            />
          </Field>
          <div className="grid gap-1.5">
            <span className="text-sm font-medium">Trạng thái thay đổi</span>
            <ToggleGroup
              type="single"
              value={changeFilter}
              onValueChange={(nextValue) => {
                if (nextValue) setChangeFilter(nextValue as UpdateItemFilter);
              }}
              variant="outline"
              size="sm"
              spacing={0}
              aria-label="Lọc thiết bị theo trạng thái thay đổi"
              className="flex-wrap justify-start"
            >
              <ToggleGroupItem value="all" aria-label="Hiển thị tất cả thiết bị">
                Tất cả
              </ToggleGroupItem>
              <ToggleGroupItem value="changed" aria-label="Chỉ hiển thị thiết bị thay đổi">
                Có thay đổi
              </ToggleGroupItem>
              <ToggleGroupItem value="unchanged" aria-label="Chỉ hiển thị thiết bị giữ nguyên">
                Giữ nguyên
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        </div>

        <Separator />

        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
          <span>
            {value.length} loại sản phẩm · {changedCount} thay đổi{removedCount ? ` · ${removedCount} sẽ xóa` : ''}
          </span>
          <Badge variant="outline" className="border-accent bg-accent/30 text-accent-foreground">
            {filteredRows.length}/{rows.length} đang hiển thị
          </Badge>
        </div>

        {rows.length ? (
          filteredRows.length ? (
            <div className="overflow-hidden rounded-lg border border-accent/50">
              <Table className="min-w-[820px] [&_tr]:border-accent/40">
                <TableHeader>
                  <TableRow className="bg-muted/30 hover:bg-muted/30">
                    <TableHead className="px-4">Thiết bị thuê</TableHead>
                    <TableHead>Thay đổi</TableHead>
                    <TableHead className="text-right">Số lượng</TableHead>
                    <TableHead>Đơn giá tham chiếu</TableHead>
                    <TableHead className="pr-4 text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRows.map((row) => {
                    const productName = row.product?.name ?? row.productId;
                    const productSku = row.product?.sku ?? 'Đang tải thông tin sản phẩm';
                    const stateConfig = rentalOrderItemChangeStateConfig[row.state];
                    const quantityDelta = row.currentQuantity - row.initialQuantity;

                    return (
                      <TableRow key={row.productId} className={cn(row.state === 'REMOVED' && 'bg-muted/30')}>
                        <TableCell className="max-w-[300px] px-4 align-top">
                          <div className={cn('truncate font-medium', row.state === 'REMOVED' && 'line-through')}>
                            {productName}
                          </div>
                          <div className="truncate text-xs text-muted-foreground">SKU: {productSku}</div>
                          <div className="truncate text-xs text-muted-foreground/70">Product ID: {row.productId}</div>
                        </TableCell>
                        <TableCell className="align-top">
                          <div className="grid justify-items-start gap-1">
                            <RentalOrderBadge config={stateConfig} />
                            {row.initialItem ? (
                              <span className="text-xs tabular-nums text-muted-foreground">
                                {quantityDelta > 0 ? '+' : ''}
                                {quantityDelta} so với {row.initialQuantity}
                              </span>
                            ) : null}
                          </div>
                        </TableCell>
                        <TableCell className="text-right align-top">
                          {row.state === 'REMOVED' ? (
                            <span className="text-sm tabular-nums text-muted-foreground">0 / {row.initialQuantity}</span>
                          ) : (
                            <NumberField
                              id={`rental-order-update-quantity-${row.productId}`}
                              aria-label={`Số lượng ${productName}`}
                              min={1}
                              max={row.product?.assetUnitCount}
                              step={1}
                              value={row.currentQuantity}
                              disabled={disabled}
                              onValueChange={(nextValue) => updateQuantity(row.productId, nextValue)}
                              className="ml-auto w-28"
                            >
                              <NumberFieldGroup size="sm">
                                <NumberFieldDecrement aria-label={`Giảm số lượng ${productName}`} />
                                <NumberFieldInput aria-label={`Số lượng ${productName}`} />
                                <NumberFieldIncrement aria-label={`Tăng số lượng ${productName}`} />
                              </NumberFieldGroup>
                            </NumberField>
                          )}
                        </TableCell>
                        <TableCell className="align-top text-sm text-muted-foreground">
                          {getPriceDescription(row.product)}
                        </TableCell>
                        <TableCell className="pr-4 text-right align-top">
                          {row.state === 'REMOVED' ? (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              disabled={disabled}
                              onClick={() => restoreProduct(row.productId)}
                            >
                              <IconRefresh aria-hidden="true" data-icon="inline-start" />
                              Khôi phục
                            </Button>
                          ) : (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              aria-label={`Xóa ${productName}`}
                              title="Xóa sản phẩm khỏi quote"
                              disabled={disabled}
                              onClick={() => removeProduct(row.productId)}
                            >
                              <IconTrash aria-hidden="true" data-icon="inline-start" />
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <Empty className="min-h-28 py-6">
              <EmptyMedia variant="icon">
                <IconPackage aria-hidden="true" />
              </EmptyMedia>
              <EmptyHeader>
                <EmptyTitle>Không có thiết bị phù hợp</EmptyTitle>
                <EmptyDescription>Thử đổi từ khóa hoặc bộ lọc trạng thái thay đổi.</EmptyDescription>
              </EmptyHeader>
            </Empty>
          )
        ) : (
          <Empty className="min-h-28 py-6">
            <EmptyMedia variant="icon">
              <IconPackage aria-hidden="true" />
            </EmptyMedia>
            <EmptyHeader>
              <EmptyTitle>Chưa có thiết bị trong đơn</EmptyTitle>
              <EmptyDescription>Tìm và chọn sản phẩm ở phía trên để thêm vào quote.</EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
      </div>

      <FieldError errors={error ? [error] : []} />
    </FieldSet>
  );
}
