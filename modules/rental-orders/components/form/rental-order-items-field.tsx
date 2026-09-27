'use client';

import {
  NumberField,
  NumberFieldDecrement,
  NumberFieldGroup,
  NumberFieldIncrement,
  NumberFieldInput,
} from '@/components/reui/number-field';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
  FieldTitle,
} from '@/components/ui/field';
import { formatCurrency } from '@/lib/utils';
import { ProductCombobox, type ProductOption } from '@/modules/asset-units/product-combobox';
import { IconPackage, IconTrash } from '@tabler/icons-react';
import { useEffect, useMemo, useState } from 'react';

export type RentalOrderItemValue = {
  productId: string;
  quantity: number;
  note?: string;
};

type RentalOrderItemError = {
  message?: string;
};

type RentalOrderItemsFieldProps = {
  value: RentalOrderItemValue[];
  onChange: (value: RentalOrderItemValue[]) => void;
  error?: RentalOrderItemError;
  initialProducts?: ProductOption[];
  portalContainer?: HTMLElement | null;
};

export function RentalOrderItemsField({
  value,
  onChange,
  error,
  initialProducts = [],
  portalContainer,
}: RentalOrderItemsFieldProps) {
  const [draftProductId, setDraftProductId] = useState('');
  const [draftProduct, setDraftProduct] = useState<ProductOption | null>(null);
  const initialProductsKey = useMemo(
    () =>
      initialProducts
        .map(
          (product) =>
            `${product.id}:${product.name}:${product.sku}:${product.rentalPrice ?? ''}:${product.dailyPrice ?? ''}:${product.halfDayPrice ?? ''}`,
        )
        .join('|'),
    [initialProducts],
  );
  const initialProductMap = useMemo<Record<string, ProductOption>>(
    () => Object.fromEntries(initialProducts.map((product) => [product.id, product])),
    [initialProductsKey],
  );
  const [selectedProducts, setSelectedProducts] = useState<Record<string, ProductOption>>(initialProductMap);

  useEffect(() => {
    setSelectedProducts(initialProductMap);
  }, [initialProductMap]);

  const addProduct = (product: ProductOption) => {
    const existingItem = value.find((item) => item.productId === product.id);
    const nextQuantity = (existingItem?.quantity ?? 0) + 1;

    if (product.assetUnitCount !== undefined && nextQuantity > product.assetUnitCount) {
      setDraftProductId('');
      setDraftProduct(null);
      return;
    }

    const nextItems = existingItem
      ? value.map((item) => (item.productId === product.id ? { ...item, quantity: nextQuantity } : item))
      : [...value, { productId: product.id, quantity: nextQuantity }];

    onChange(nextItems);
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
    setSelectedProducts((current) => {
      const next = { ...current };
      delete next[productId];
      return next;
    });
  };

  return (
    <FieldSet data-invalid={Boolean(error)} className="gap-4">
      <Field>
        <FieldLabel htmlFor="rental-order-product-search">Thiết bị thuê</FieldLabel>
        <ProductCombobox
          value={draftProductId}
          selectedProduct={draftProduct}
          onProductChange={handleProductChange}
          ariaInvalid={Boolean(error)}
          placeholder="Tìm theo tên hoặc SKU"
          fetchEnabled
          portalContainer={portalContainer}
        />
        <FieldDescription>
          Chọn thiết bị thuê. Số lượng được chỉnh ngay trong danh sách; hệ thống sẽ tự tìm máy trống theo thời gian thuê.
        </FieldDescription>
      </Field>

      <FieldGroup className="gap-0 divide-y divide-border/60 rounded-xl bg-muted/20 px-4">
        {value.length === 0 ? (
          <Empty className="min-h-32 py-8">
            <EmptyMedia variant="icon">
              <IconPackage aria-hidden="true" />
            </EmptyMedia>
            <EmptyHeader>
              <EmptyTitle>Chưa có thiết bị</EmptyTitle>
              <EmptyDescription>Tìm và chọn sản phẩm ở phía trên để thêm vào đơn thuê.</EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          value.map((item) => {
            const product = selectedProducts[item.productId];
            const productName = product?.name ?? item.productId;
            const productSku = product?.sku ?? 'Đang tải thông tin sản phẩm';
            const priceDescription =
              product?.rentalPrice != null
                ? `Đơn giá: ${formatCurrency(product.rentalPrice, { noDecimals: true })}`
                : product?.dailyPrice != null || product?.halfDayPrice != null
                  ? `Ngày: ${product.dailyPrice != null ? formatCurrency(product.dailyPrice, { noDecimals: true }) : '-'} · Buổi: ${product.halfDayPrice != null ? formatCurrency(product.halfDayPrice, { noDecimals: true }) : '-'}`
                  : 'Giá sẽ được tính theo thời gian thuê';

            return (
              <Field key={item.productId} orientation="responsive" className="gap-4 py-4 first:pt-4 last:pb-4">
                <FieldContent className="gap-1">
                  <FieldTitle className="text-sm font-semibold">{productName}</FieldTitle>
                  <FieldDescription className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <Badge variant="secondary" className="font-mono text-[11px]">
                      SKU {productSku}
                    </Badge>
                    <span>{priceDescription}</span>
                    {product?.assetUnitCount !== undefined ? <span>Tổng máy: {product.assetUnitCount}</span> : null}
                    <span className="text-xs text-muted-foreground/70">ID {item.productId}</span>
                  </FieldDescription>
                </FieldContent>

                <div className="flex items-center justify-between gap-2 sm:shrink-0">
                  <span className="text-xs text-muted-foreground">Số lượng</span>
                  <NumberField
                    id={`rental-order-quantity-${item.productId}`}
                    aria-label={`Số lượng ${productName}`}
                    min={1}
                    max={product?.assetUnitCount}
                    step={1}
                    value={item.quantity}
                    onValueChange={(nextValue) => updateQuantity(item.productId, nextValue)}
                    className="w-28"
                  >
                    <NumberFieldGroup size="sm">
                      <NumberFieldDecrement aria-label={`Giảm số lượng ${productName}`} />
                      <NumberFieldInput aria-label={`Số lượng ${productName}`} />
                      <NumberFieldIncrement aria-label={`Tăng số lượng ${productName}`} />
                    </NumberFieldGroup>
                  </NumberField>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label={`Xóa ${productName}`}
                    title="Xóa sản phẩm"
                    onClick={() => removeProduct(item.productId)}
                  >
                    <IconTrash aria-hidden="true" data-icon="inline-start" />
                  </Button>
                </div>
              </Field>
            );
          })
        )}
      </FieldGroup>
      <FieldError errors={error ? [error] : []} />
    </FieldSet>
  );
}
