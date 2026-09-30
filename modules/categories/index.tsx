'use client';

import { DataTable } from '@/components/ui/data-table';
import { BulkActions } from './bulk-action';
import { CategoriesProvider } from './category-provider';
import { CategoryDialogs } from './dialog';
import { useCategoriesLogic } from './hooks/category-logic';

function Content() {
  const { table } = useCategoriesLogic();
  return (
    <>
      <DataTable table={table} />
      <BulkActions table={table} />
      <CategoryDialogs table={table} />
    </>
  );
}

export default function Categories() {
  return (
    <CategoriesProvider>
      <Content />
    </CategoriesProvider>
  );
}
