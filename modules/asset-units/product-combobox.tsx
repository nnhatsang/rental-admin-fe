'use client';

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '@/components/ui/combobox';
import { Item, ItemContent, ItemDescription, ItemTitle } from '@/components/ui/item';
import { cn, formatCurrency } from '@/lib/utils';
import type { IProductOut } from '@/modules/products/type';
import { TITLE_PAGE } from '@/utils/consts/title-page.const';
import { useCallback } from 'react';
import { useGetProductsLogic, type ProductOption } from './hooks/use-get-products-logic';

export type ProductComboboxProps = {
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  ariaInvalid?: boolean;
  className?: string;
  placeholder?: string;
  selectedProduct?: ProductOption | null;
  syncToUrl?: boolean;
  portalContainer?: HTMLElement | null;
  fetchEnabled?: boolean;
};

const productLabel = (product: Pick<IProductOut, 'name' | 'sku'>) => product.name || product.sku;

export function ProductCombobox({
  value,
  onChange,
  disabled,
  ariaInvalid,
  className,
  placeholder,
  selectedProduct,
  syncToUrl = false,
  portalContainer,
  fetchEnabled,
}: ProductComboboxProps) {
  const text = TITLE_PAGE.ASSET_UNITS;
  const shouldFetchProducts = fetchEnabled ?? (!disabled || syncToUrl);
  const {
    productById,
    productIds,
    productId,
    onSearchChange,
    clearSearchAfterSelect,
    updateProductId,
    rememberSelectedProduct,
  } = useGetProductsLogic({
    selectedProduct,
    syncToUrl,
    enabled: shouldFetchProducts,
  });
  const currentValue = syncToUrl ? productId : value;
  const selectedValue = currentValue && productById.has(currentValue) ? currentValue : null;
  const itemToStringLabel = useCallback(
    (productId: string) => {
      const product = productById.get(productId);
      return product ? productLabel(product) : '';
    },
    [productById],
  );

  return (
    <Combobox
      items={productIds}
      value={selectedValue}
      onValueChange={(nextValue) => {
        rememberSelectedProduct(nextValue);
        clearSearchAfterSelect();

        if (syncToUrl) {
          updateProductId(nextValue ?? undefined);
          return;
        }

        onChange?.(nextValue ?? '');
      }}
      onInputValueChange={onSearchChange}
      itemToStringLabel={itemToStringLabel}
      itemToStringValue={(productId) => productId}
      disabled={disabled}
      autoHighlight
    >
      <ComboboxInput
        className={cn('w-full', className)}
        placeholder={placeholder ?? text.FORM.PRODUCT_ID_PLACEHOLDER}
        disabled={disabled}
        showClear={!disabled && !!currentValue}
        aria-invalid={ariaInvalid}
      />
      <ComboboxContent portalContainer={portalContainer}>
        <ComboboxEmpty>{text.FORM.FILTER_PRODUCT_EMPTY}</ComboboxEmpty>
        <ComboboxList>
          {(productId: string) => {
            const product = productById.get(productId);

            if (!product) return null;

            return (
              <ComboboxItem key={product.id} value={product.id}>
                <Item size="xs" className="p-0">
                  <ItemContent>
                    <ItemTitle className="truncate text-sm font-medium">{product.name}</ItemTitle>

                    <ItemDescription className="text-muted-foreground mt-1 space-y-0.5 text-xs">
                      {/* <div>SKU: {product.sku}</div> */}
                      <div>Ngày: {formatCurrency(Number(product.dailyPrice))}</div>
                      <div>Buổi: {formatCurrency(Number(product.halfDayPrice))}</div>
                    </ItemDescription>
                  </ItemContent>
                </Item>
              </ComboboxItem>
            );
          }}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}
