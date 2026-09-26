'use client';

import {
  NumberField,
  NumberFieldDecrement,
  NumberFieldGroup,
  NumberFieldIncrement,
  NumberFieldInput,
} from '@/components/reui/number-field';
import { Button } from '@/components/ui/button';
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from '@/components/ui/field';
import { ProductCombobox, type ProductOption } from '@/modules/asset-units/product-combobox';
import { IconTrash } from '@tabler/icons-react';
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
    () => initialProducts.map((product) => `${product.id}:${product.name}:${product.sku}`).join('|'),
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
    const nextItems = value.some((item) => item.productId === product.id)
      ? value.map((item) => (item.productId === product.id ? { ...item, quantity: item.quantity + 1 } : item))
      : [...value, { productId: product.id, quantity: 1 }];

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
    <FieldSet data-invalid={Boolean(error)}>
      <FieldLegend variant="label">Sản phẩm thuê</FieldLegend>
      <FieldDescription>
        Chọn sản phẩm hoặc nhấn Enter để thêm. Số lượng được chỉnh ngay trên từng sản phẩm; hệ thống sẽ tự chọn các máy
        còn trống theo khoảng thời gian.
      </FieldDescription>

      <div className="grid gap-2">
        <Field>
          <FieldLabel htmlFor="rental-order-product-search">Tìm sản phẩm</FieldLabel>
          <ProductCombobox
            value={draftProductId}
            selectedProduct={draftProduct}
            onProductChange={handleProductChange}
            ariaInvalid={Boolean(error)}
            placeholder="Tìm theo tên hoặc SKU"
            fetchEnabled
            portalContainer={portalContainer}
          />
        </Field>
      </div>

      <FieldGroup className="gap-2">
        {value.length === 0 ? (
          <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
            Chưa có sản phẩm nào được thêm.
          </div>
        ) : (
          value.map((item) => {
            const product = selectedProducts[item.productId];
            const productName = product?.name ?? item.productId;
            const productSku = product?.sku ?? 'Đang tải thông tin sản phẩm';

            return (
              <Field key={item.productId} orientation="horizontal" className="items-start p-3">
                <FieldContent className="gap-1">
                  <FieldLabel className="font-medium">{productName}</FieldLabel>
                  <FieldDescription>
                    {productSku} · Product ID: {item.productId}
                  </FieldDescription>
                </FieldContent>
                <div className="flex items-center gap-2">
                  <NumberField
                    id={`rental-order-quantity-${item.productId}`}
                    aria-label={`Số lượng ${productName}`}
                    min={1}
                    step={1}
                    value={item.quantity}
                    onValueChange={(nextValue) => updateQuantity(item.productId, nextValue)}
                    className="w-32"
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
