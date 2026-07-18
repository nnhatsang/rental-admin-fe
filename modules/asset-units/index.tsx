'use client';

import { DataTable } from '@/components/ui/data-table';
import { useSearchParams } from 'next/navigation';
import { AssetUnitsProvider } from './asset-units-provider';
import { BulkActions } from './bulk-action';
import { AssetUnitDialogs } from './dialog';
import { useAssetUnitsLogic } from './hooks/asset-unit-logic';

function Content() {
  const { table } = useAssetUnitsLogic();
  const searchParams = useSearchParams();
  const productId = searchParams.get('productId') || undefined;

  return (
    <>
      <DataTable table={table} />
      <BulkActions table={table} />
      <AssetUnitDialogs table={table} defaultProductId={productId} />
    </>
  );
}

export default function AssetUnits() {
  return (
    <AssetUnitsProvider>
      <Content />
    </AssetUnitsProvider>
  );
}
