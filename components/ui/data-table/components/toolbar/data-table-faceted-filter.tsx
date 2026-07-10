'use client';

import type { ComponentType } from 'react';
import type { Column, RowData } from '@tanstack/react-table';
import { CheckIcon, ChevronDownIcon, PlusCircleIcon, XIcon } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

import type { DataTableFilterOption, DataTableInstance } from '../../core/types';
import { getColumnLabel } from '../../helpers/column-label';
import { DataTableFilterModeMenu } from '../menus/data-table-filter-mode-menu';
import {
  CheckboxFilterField,
  DateFilterField,
  DateRangeFilterField,
  MultiSelectFilterField,
  NumberFilterField,
  RangeSliderFilterField,
  SelectFilterField,
  TextFilterField,
  type FilterFieldProps,
} from '../head/filter-variants';
import { useSelectOptions } from '../head/filter-variants/shared';

type FacetedOption = DataTableFilterOption & {
  icon?: ComponentType<{ className?: string }>;
};

function hasFilterValue(value: unknown) {
  if (Array.isArray(value)) return value.length > 0;
  if (value == null || value === '') return false;
  return true;
}

function formatFilterValue(value: unknown) {
  if (Array.isArray(value)) {
    const filled = value.filter((item) => item != null && item !== '');
    return filled.length > 0 ? filled.map(String).join(' - ') : undefined;
  }

  if (value instanceof Date) return value.toLocaleDateString();
  if (typeof value === 'boolean') return value ? 'Có' : undefined;
  if (value === 'true') return 'Có';
  if (value == null || value === '') return undefined;

  return String(value);
}

function getSelectedValues(value: unknown) {
  if (Array.isArray(value)) return new Set(value.map(String));
  if (value == null || value === '') return new Set<string>();
  return new Set([String(value)]);
}

function getNextFilterValue({
  column,
  optionValue,
  selectedValues,
}: {
  column: Column<unknown, unknown>;
  optionValue: string;
  selectedValues: Set<string>;
}) {
  const variant = column.columnDef.meta?.variant;

  if (variant === 'multi-select') {
    const next = new Set(selectedValues);
    if (next.has(optionValue)) {
      next.delete(optionValue);
    } else {
      next.add(optionValue);
    }

    return next.size > 0 ? Array.from(next) : undefined;
  }

  return selectedValues.has(optionValue) ? undefined : optionValue;
}

export function DataTableFacetedFilter<TData extends RowData, TValue>({
  column,
  table,
}: {
  column: Column<TData, TValue>;
  table: DataTableInstance<TData>;
}) {
  const custom = column.columnDef.meta?.renderColumnFilter;
  if (custom) {
    return <>{custom({ column, table })}</>;
  }

  const variant = column.columnDef.meta?.variant ?? 'text';

  if (variant === 'select' || variant === 'multi-select') {
    return <SelectFacetedFilter column={column} table={table} />;
  }

  return <ToolbarColumnFilter column={column} table={table} />;
}

function FilterField<TData extends RowData, TValue>({ column, table }: FilterFieldProps<TData, TValue>) {
  const variant = column.columnDef.meta?.variant ?? 'text';

  switch (variant) {
    case 'select':
      return <SelectFilterField column={column} table={table} />;
    case 'multi-select':
      return <MultiSelectFilterField column={column} table={table} />;
    case 'checkbox':
      return <CheckboxFilterField column={column} table={table} />;
    case 'range':
      return <NumberFilterField column={column} table={table} />;
    case 'range-slider':
      return <RangeSliderFilterField column={column} table={table} />;
    case 'date':
      return <DateFilterField column={column} table={table} />;
    case 'date-range':
      return <DateRangeFilterField column={column} table={table} />;
    default:
      return <TextFilterField column={column} table={table} />;
  }
}

function ToolbarColumnFilter<TData extends RowData, TValue>({
  column,
  table,
}: {
  column: Column<TData, TValue>;
  table: DataTableInstance<TData>;
}) {
  const { localization } = table.cnTable;
  const label = getColumnLabel(column);
  const value = column.getFilterValue();
  const active = hasFilterValue(value);
  const summary = formatFilterValue(value);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            'h-8 max-w-full border-dashed px-2.5 font-normal transition-colors',
            active && 'border-solid border-primary/35 bg-accent/60 text-accent-foreground',
          )}
          aria-label={localization.filterByColumn(label)}
        >
          <PlusCircleIcon className={cn('size-4 shrink-0 text-muted-foreground', active && 'text-primary')} />
          <span className="max-w-32 truncate">{label}</span>
          {summary && (
            <>
              <Separator orientation="vertical" className="mx-1 h-4" />
              <Badge variant="secondary" className="h-5 max-w-32 rounded-sm px-1.5 font-normal">
                <span className="truncate">{summary}</span>
              </Badge>
            </>
          )}
          <ChevronDownIcon className="ml-0.5 size-3.5 shrink-0 text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-3" align="start">
        <div className="space-y-3">
          <div className="flex min-w-0 items-center justify-between gap-2">
            <div className="min-w-0">
              <div className="truncate text-sm font-medium">{label}</div>
              <div className="text-xs text-muted-foreground">{localization.filterByColumn(label)}</div>
            </div>
            {active && (
              <Button
                variant="ghost"
                size="icon"
                className="size-7 shrink-0"
                aria-label={localization.clearFilter}
                onClick={() => column.setFilterValue(undefined)}
              >
                <XIcon className="size-3.5" />
              </Button>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            <DataTableFilterModeMenu column={column} table={table} />
            <div className="min-w-0 flex-1">
              <FilterField column={column} table={table} />
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function SelectFacetedFilter<TData extends RowData, TValue>({
  column,
  table,
}: {
  column: Column<TData, TValue>;
  table: DataTableInstance<TData>;
}) {
  const { localization } = table.cnTable;
  const { options, counts } = useSelectOptions(column);
  const selectedValues = getSelectedValues(column.getFilterValue());
  const selectedOptions = options.filter((option) => selectedValues.has(option.value));
  const hasSelectedValues = selectedValues.size > 0;
  const label = getColumnLabel(column);

  if (options.length === 0) return null;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            'h-8 max-w-full border-dashed px-2.5 font-normal transition-colors',
            hasSelectedValues && 'border-solid border-primary/35 bg-accent/50 text-accent-foreground',
          )}
          aria-label={localization.filterByColumn(label)}
        >
          <PlusCircleIcon
            className={cn('size-4 shrink-0 text-muted-foreground', hasSelectedValues && 'text-primary')}
          />
          <span className="max-w-32 truncate">{label}</span>
          {hasSelectedValues && (
            <>
              <Separator orientation="vertical" className="mx-1 h-4" />
              <Badge variant="secondary" className="h-5 rounded-sm px-1.5 font-mono text-[11px] font-normal lg:hidden">
                {selectedValues.size}
              </Badge>
              <div className="hidden min-w-0 items-center gap-1 lg:flex">
                {selectedValues.size > 2 ? (
                  <Badge variant="secondary" className="h-5 rounded-sm px-1.5 font-normal">
                    {selectedValues.size} đã chọn
                  </Badge>
                ) : (
                  selectedOptions.map((option) => (
                    <Badge
                      variant="secondary"
                      key={option.value}
                      className="h-5 max-w-28 rounded-sm px-1.5 font-normal"
                    >
                      <span className="truncate">{option.label}</span>
                    </Badge>
                  ))
                )}
              </div>
            </>
          )}
          <ChevronDownIcon className="ml-0.5 size-3.5 shrink-0 text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 overflow-hidden p-0" align="start">
        <Command>
          <div className="border-b pb-1">
            <CommandInput placeholder={localization.filterPlaceholder(label)} className="h-8" />
          </div>
          <CommandList className="max-h-72">
            <CommandEmpty>{localization.noRecordsToDisplay}</CommandEmpty>
            <CommandGroup className="p-1">
              {options.map((option) => {
                const facetedOption = option as FacetedOption;
                const isSelected = selectedValues.has(option.value);
                const OptionIcon = facetedOption.icon;

                return (
                  <CommandItem
                    key={option.value}
                    value={option.value}
                    keywords={[option.label, option.value]}
                    className="gap-2 rounded-sm px-2"
                    onSelect={() =>
                      column.setFilterValue(
                        getNextFilterValue({
                          column: column as Column<unknown, unknown>,
                          optionValue: option.value,
                          selectedValues,
                        }),
                      )
                    }
                  >
                    <div
                      className={cn(
                        'flex size-4 shrink-0 items-center justify-center rounded-sm border',
                        isSelected
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-muted-foreground/35 text-transparent',
                      )}
                    >
                      <CheckIcon className="size-3" />
                    </div>
                    {OptionIcon && <OptionIcon className="size-4 text-muted-foreground" />}
                    <span className="flex-1 truncate">{option.label}</span>
                    {counts.has(option.value) && (
                      <span className="min-w-6 rounded-sm bg-muted px-1.5 py-0.5 text-center font-mono text-[11px] tabular-nums text-muted-foreground">
                        {counts.get(option.value)}
                      </span>
                    )}
                  </CommandItem>
                );
              })}
            </CommandGroup>
            {hasSelectedValues && (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem
                    onSelect={() => column.setFilterValue(undefined)}
                    className="justify-center gap-2 text-center text-muted-foreground"
                  >
                    <XIcon className="size-3.5" />
                    {localization.clearFilter}
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
