'use client';

import { DataTable } from '@/components/ui/data-table';
import { BulkActions } from './bulk-action';
import { ProductDialogs } from './dialog';
import { useProductsLogic } from './hooks/product-logic';
import { ProductsProvider } from './products-provider';

function Content() {
  const { table } = useProductsLogic();

  return (
    <>
      <DataTable table={table} />
      <BulkActions table={table} />
      <ProductDialogs table={table} />
    </>
  );
}

export default function Products() {
  return (
    <ProductsProvider>
      <Content />
    </ProductsProvider>
  );
}
