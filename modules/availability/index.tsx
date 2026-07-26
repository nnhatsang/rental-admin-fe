'use client';

import { DataTable } from '@/components/ui/data-table';
import { AvailabilityProvider } from './availability-provider';
import { AssetSelectionDrawer } from './components/asset-selection-drawer';
import { AvailabilityShell } from './components/availability-shell';
import { useAvailabilityProductsLogic } from './hooks/use-availability-products-logic';

function Content() {
  const logic = useAvailabilityProductsLogic();

  return (
    <AvailabilityShell>
      <DataTable table={logic.table} />
      <AssetSelectionDrawer />
    </AvailabilityShell>
  );
}

export default function Availability() {
  return (
    <AvailabilityProvider>
      <Content />
    </AvailabilityProvider>
  );
}
