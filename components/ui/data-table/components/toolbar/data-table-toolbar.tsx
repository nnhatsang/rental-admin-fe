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
  } = table.cnTable;

  const anyFilterable = table.getAllColumns().some((column) => column.getCanFilter());
  const facetedFilterColumns = table.getAllLeafColumns().filter((column) => {
    const variant = column.columnDef.meta?.variant;
    return column.getCanFilter() && (variant === 'select' || variant === 'multi-select');
  });

  const showGlobalFilter = enableGlobalFilter && positionGlobalFilter !== 'none';

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
          {positionToolbarActions === 'left' && renderToolbarActions && renderToolbarActions({ table })}
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
