'use client';

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '@/components/ui/combobox';
import { Badge } from '@/components/ui/badge';
import { Item, ItemContent, ItemDescription, ItemMedia, ItemTitle } from '@/components/ui/item';
import { cn, formatCurrency } from '@/lib/utils';
import type { IProductOut } from '@/modules/products/type';
import { productActiveConfig } from '@/modules/products/display-config';
import { TITLE_PAGE } from '@/utils/consts/title-page.const';
import { IconPackage } from '@tabler/icons-react';
import { useCallback } from 'react';
import { useGetProductsLogic, type ProductOption } from './hooks/use-get-products-logic';

export type ProductComboboxProps = {
  value?: string;
  onChange?: (value: string) => void;
  onProductChange?: (product: ProductOption | null) => void;
  disabled?: boolean;
  ariaInvalid?: boolean;
  className?: string;
  placeholder?: string;
  selectedProduct?: ProductOption | null;
  syncToUrl?: boolean;
  portalContainer?: HTMLElement | null;
  fetchEnabled?: boolean;
  classNameContent?: string;
  /** Keep inactive products visible for context, but prevent selecting them. */
  disableInactive?: boolean;
};

export type { ProductOption } from './hooks/use-get-products-logic';

const productLabel = (product: Pick<IProductOut, 'name' | 'sku'>) => product.name || product.sku;

export function ProductCombobox({
  value,
  onChange,
  onProductChange,
  disabled,
  ariaInvalid,
  className,
  placeholder,
  selectedProduct,
  syncToUrl = false,
  portalContainer,
  fetchEnabled,
  classNameContent,
  disableInactive = false,
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
        const nextProduct = nextValue ? (productById.get(nextValue) ?? null) : null;
        rememberSelectedProduct(nextValue);
        clearSearchAfterSelect();
        onProductChange?.(nextProduct);

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
            const activeConfig =
              product.isActive !== undefined
                ? productActiveConfig[String(product.isActive) as 'true' | 'false']
                : null;

            return (
              <ComboboxItem key={product.id} value={product.id} disabled={disableInactive && product.isActive === false}>
                <Item size="xs" className="min-w-0 p-0">
                  <ItemMedia variant="icon" className="mt-0.5 size-8 rounded-md bg-muted text-muted-foreground">
                    <IconPackage aria-hidden="true" />
                  </ItemMedia>
                  <ItemContent className={cn('min-w-0 gap-1', classNameContent)}>
                    <div className="flex min-w-0 items-center gap-2">
                      <ItemTitle className="min-w-0 flex-1 truncate text-sm font-medium">{product.name}</ItemTitle>
                      {activeConfig ? (
                        <Badge
                          variant="outline"
                          className={cn('shrink-0 text-[10px]', activeConfig.className)}
                        >
                          {activeConfig.label}
                        </Badge>
                      ) : null}
                    </div>
                    <ItemDescription className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-0.5 text-xs">
                      <span className="font-mono">SKU {product.sku}</span>
                      <span>
                        · {product.assetUnitCount != null ? `${product.assetUnitCount} máy` : 'Chưa có số máy'}
                      </span>
                    </ItemDescription>
                    <ItemDescription className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px]">
                      <span>
                        Ngày:{' '}
                        {product.dailyPrice != null ? formatCurrency(Number(product.dailyPrice)) : 'Chưa có giá'}
                      </span>
                      <span>
                        Buổi:{' '}
                        {product.halfDayPrice != null ? formatCurrency(Number(product.halfDayPrice)) : 'Chưa có giá'}
                      </span>
                    </ItemDescription>
                    {disableInactive && product.isActive === false ? (
                      <p className="text-[11px] text-destructive">Sản phẩm đang ngưng hoạt động</p>
                    ) : null}
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
