'use client';

import { DataTable } from '@/components/ui/data-table';
import { AssetUnitsProvider } from './asset-units-provider';
import { BulkActions } from './bulk-action';
import { AssetUnitDialogs } from './dialog';
import { useAssetUnitsLogic } from './hooks/asset-unit-logic';

function Content() {
  const { table } = useAssetUnitsLogic();

  return (
    <>
      <DataTable table={table} />
      <BulkActions table={table} />
      <AssetUnitDialogs table={table} />
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
