'use client';

import { DataTable, type DataTableInstance } from '@/components/ui/data-table';
import type { IAvailabilityAsset } from '@/modules/availability/type';

type RentalOrderAssetSelectionTableProps = {
  assetTable: DataTableInstance<IAvailabilityAsset>;
  className?: string;
};

export function RentalOrderAssetSelectionTable({ assetTable, className }: RentalOrderAssetSelectionTableProps) {
  return <DataTable table={assetTable} surfaceClassName={className ?? 'h-[320px]'} />;
}
