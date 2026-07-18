'use client';

import { useGetProducts } from '@/modules/products/hooks/use-get-products';
import type { IProductOut } from '@/modules/products/type';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useMemo, useRef, useState } from 'react';

export type ProductOption = Pick<IProductOut, 'id' | 'name' | 'sku'>;

type UseGetProductsLogicProps = {
  selectedProduct?: ProductOption | null;
  syncToUrl?: boolean;
  enabled?: boolean;
};

export const useGetProductsLogic = ({
  selectedProduct,
  syncToUrl = false,
  enabled = true,
}: UseGetProductsLogicProps = {}) => {
  const ignoreNextInputChangeRef = useRef(false);
  const [search, setSearch] = useState('');
  const [localSelectedProduct, setLocalSelectedProduct] = useState<ProductOption | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const { data, isLoading, isFetching } = useGetProducts(
    {
      page: 1,
      perPage: 20,
      search: search || undefined,
    },
    { enabled },
  );

  const products = useMemo(() => {
    const items = data?.items.filter((item) => item.name.trim() !== '') ?? [];
    const visibleSelectedProduct = selectedProduct ?? localSelectedProduct;

    if (!visibleSelectedProduct || items.some((item) => item.id === visibleSelectedProduct.id)) {
      return items;
    }

    return [visibleSelectedProduct as IProductOut, ...items];
  }, [data?.items, localSelectedProduct, selectedProduct]);

  const productById = useMemo(() => new Map(products.map((product) => [product.id, product])), [products]);
  const productIds = useMemo(() => products.map((product) => product.id), [products]);

  const rememberSelectedProduct = useCallback(
    (productId?: string | null) => {
      setLocalSelectedProduct(productId ? productById.get(productId) ?? null : null);
    },
    [productById],
  );

  const onSearchChange = useCallback((nextSearch: string | undefined) => {
    if (ignoreNextInputChangeRef.current) {
      return;
    }

    setSearch((nextSearch ?? '').trim());
  }, []);

  const clearSearchAfterSelect = useCallback(() => {
    ignoreNextInputChangeRef.current = true;
    setSearch('');

    window.setTimeout(() => {
      ignoreNextInputChangeRef.current = false;
    }, 0);
  }, []);

  const productId = syncToUrl ? searchParams.get('productId') || undefined : undefined;

  const updateProductId = useCallback(
    (nextProductId?: string) => {
      if (!syncToUrl) return;

      const params = new URLSearchParams(searchParams.toString());
      params.delete('page');

      if (nextProductId) {
        params.set('productId', nextProductId);
      } else {
        params.delete('productId');
      }

      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams, syncToUrl],
  );

  return {
    products,
    productById,
    productIds,
    productId,
    isLoading,
    isFetching,
    onSearchChange,
    clearSearchAfterSelect,
    updateProductId,
    rememberSelectedProduct,
  };
};
