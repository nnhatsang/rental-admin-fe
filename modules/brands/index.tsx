'use client';

import { DataTable } from '@/components/ui/data-table';
import { BrandsProvider } from './brand-provider';
import { BulkActions } from './bulk-action';
import { BrandDialogs } from './dialog';
import { useBrandsLogic } from './hooks/brand-logic';

function Content() {
  const { table } = useBrandsLogic();
  return (
    <>
      <DataTable table={table} />
      <BulkActions table={table} />
      <BrandDialogs table={table} />
    </>
  );
}

export default function Brands() {
  return (
    <BrandsProvider>
      <Content />
    </BrandsProvider>
  );
}
