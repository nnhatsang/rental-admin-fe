'use client';

import type { RowData } from '@tanstack/react-table';
import type * as React from 'react';

import type { DataTableInstance } from '../../core/types';
import { DataTableExportMenu } from '../menus/data-table-export-menu';
import { DataTableFilterPanel } from '../menus/data-table-filter-panel';
import {
  DataTableAdvancedFilterToggle,
  DataTableDensityToggle,
  DataTableFilterToggle,
  DataTableFullscreenToggle,
} from './controls';
import { DataTableFacetedFilter } from './data-table-faceted-filter';
import { DataTableGlobalFilter } from './data-table-global-filter';
import { DataTableViewOptions } from './data-table-view-options';
import { Button } from '@/components/ui/button';
import { IconX } from '@tabler/icons-react';

function hasFilterValue(value: unknown) {
  if (Array.isArray(value)) return value.some(hasFilterValue);
  if (value == null) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  return true;
}

/**
 * Top toolbar. Left region: title slot + consumer toolbar actions. Right
 * region: the MRT-ordered icon cluster (global search → filters funnel →
 * column visibility → density → full screen).
 */
export function DataTableToolbar<TData extends RowData>({
  table,
  toolbarRef,
  searchInputRef,
}: {
  table: DataTableInstance<TData>;
  /** Optional ref forwarded to the toolbar root. Defaults to the instance's
   *  `topToolbarRef` when rendered by `DataTable`. */
  toolbarRef?: React.Ref<HTMLDivElement>;
  /** Optional ref forwarded to the global-search input. Defaults to the
   *  instance's `searchInputRef` when rendered by `DataTable`. */
  searchInputRef?: React.RefObject<HTMLInputElement | null>;
}) {
  const {
    renderToolbarActions,
    renderToolbarInternalActions,
    enableToolbarInternalActions,
    enableGlobalFilter,
    positionGlobalFilter,
    enableColumnFilters,
    columnFilterDisplayMode,
    enableAdvancedFilter,
    enableColumnActions,
    enableExport,
    enableDensityToggle,
    enableFullscreenToggle,
    exportFileName,
    positionToolbarActions,
    readOnly,
    localization,
  } = table.cnTable;

  const anyFilterable = table.getAllColumns().some((column) => column.getCanFilter());
  const facetedFilterColumns = table.getAllLeafColumns().filter((column) => column.getCanFilter());

  const showGlobalFilter = enableGlobalFilter && positionGlobalFilter !== 'none';
  const isFiltered = table.getState().columnFilters.some((filter) => hasFilterValue(filter.value));

  return (
    <>
      <div
        ref={toolbarRef}
        data-slot="data-table-toolbar"
        className="grid min-w-0 gap-3 px-4 py-1 md:grid-cols-[minmax(0,1fr)_auto]"
      >
        <div className="flex min-h-9 min-w-0 flex-wrap items-center gap-2">
          {showGlobalFilter && positionGlobalFilter === 'left' && (
            <DataTableGlobalFilter table={table} searchInputRef={searchInputRef} />
          )}
          {enableColumnFilters &&
            columnFilterDisplayMode === 'custom' &&
            facetedFilterColumns.map((column) => (
              <DataTableFacetedFilter key={column.id} column={column} table={table} />
            ))}
          {isFiltered && (
            <Button
              variant="ghost"
              onClick={() => {
                table.resetColumnFilters();
              }}
              className="h-8 px-2 lg:px-3"
            >
              {localization.clearFilter}
              <IconX className="ms-2 h-4 w-4" />
            </Button>
          )}
          {positionToolbarActions === 'left' && renderToolbarActions && !readOnly && renderToolbarActions({ table })}
        </div>

        {enableToolbarInternalActions && (
          <div
            data-slot="data-table-toolbar-actions"
            className="flex min-w-0 flex-wrap items-center justify-start gap-1.5 md:justify-end"
          >
            {renderToolbarInternalActions ? (
              renderToolbarInternalActions({ table })
            ) : (
              <>
                {showGlobalFilter && positionGlobalFilter === 'right' && (
                  <DataTableGlobalFilter table={table} searchInputRef={searchInputRef} />
                )}
                {enableColumnFilters && anyFilterable && columnFilterDisplayMode === 'subheader' && (
                  <DataTableFilterToggle table={table} />
                )}
                {enableAdvancedFilter && <DataTableAdvancedFilterToggle table={table} />}
                {enableColumnActions && <DataTableViewOptions table={table} />}
                {enableExport && <DataTableExportMenu table={table} fileName={exportFileName} />}
                {enableDensityToggle && <DataTableDensityToggle table={table} />}
                {enableFullscreenToggle && <DataTableFullscreenToggle table={table} />}
              </>
            )}
          </div>
        )}
      </div>
      {enableAdvancedFilter && <DataTableFilterPanel table={table} />}
    </>
  );
}
