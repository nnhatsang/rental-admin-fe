"use client"

import type { ComponentType } from "react"
import type { Column, RowData } from "@tanstack/react-table"
import { CheckIcon, PlusCircleIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

import { getColumnLabel } from "../../helpers/column-label"
import type { DataTableFilterOption, DataTableInstance } from "../../core/types"
import { useSelectOptions } from "../head/filter-variants/shared"

type FacetedOption = DataTableFilterOption & {
  icon?: ComponentType<{ className?: string }>
}

function getSelectedValues(value: unknown) {
  if (Array.isArray(value)) return new Set(value.map(String))
  if (value == null || value === "") return new Set<string>()
  return new Set([String(value)])
}

function getNextFilterValue({
  column,
  optionValue,
  selectedValues,
}: {
  column: Column<unknown, unknown>
  optionValue: string
  selectedValues: Set<string>
}) {
  const variant = column.columnDef.meta?.variant

  if (variant === "multi-select") {
    const next = new Set(selectedValues)
    if (next.has(optionValue)) {
      next.delete(optionValue)
    } else {
      next.add(optionValue)
    }

    return next.size > 0 ? Array.from(next) : undefined
  }

  return selectedValues.has(optionValue) ? undefined : optionValue
}

export function DataTableFacetedFilter<TData extends RowData, TValue>({
  column,
  table,
}: {
  column: Column<TData, TValue>
  table: DataTableInstance<TData>
}) {
  const { localization } = table.cnTable
  const { options, counts } = useSelectOptions(column)
  const selectedValues = getSelectedValues(column.getFilterValue())
  const label = getColumnLabel(column)

  if (options.length === 0) return null

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-8 border-dashed"
          aria-label={localization.filterByColumn(label)}
        >
          <PlusCircleIcon className="size-4" />
          {label}
          {selectedValues.size > 0 && (
            <>
              <Separator orientation="vertical" className="mx-1 h-4" />
              <Badge
                variant="secondary"
                className="rounded-sm px-1 font-normal lg:hidden"
              >
                {selectedValues.size}
              </Badge>
              <div className="hidden items-center gap-1 lg:flex">
                {selectedValues.size > 2 ? (
                  <Badge
                    variant="secondary"
                    className="rounded-sm px-1 font-normal"
                  >
                    {selectedValues.size} đã chọn
                  </Badge>
                ) : (
                  options
                    .filter((option) => selectedValues.has(option.value))
                    .map((option) => (
                      <Badge
                        variant="secondary"
                        key={option.value}
                        className="rounded-sm px-1 font-normal"
                      >
                        {option.label}
                      </Badge>
                    ))
                )}
              </div>
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-0" align="start">
        <Command>
          <CommandInput placeholder={localization.filterPlaceholder(label)} />
          <CommandList>
            <CommandEmpty>{localization.noRecordsToDisplay}</CommandEmpty>
            <CommandGroup>
              {options.map((option) => {
                const facetedOption = option as FacetedOption
                const isSelected = selectedValues.has(option.value)
                const OptionIcon = facetedOption.icon

                return (
                  <CommandItem
                    key={option.value}
                    value={option.value}
                    onSelect={() =>
                      column.setFilterValue(
                        getNextFilterValue({
                          column: column as Column<unknown, unknown>,
                          optionValue: option.value,
                          selectedValues,
                        })
                      )
                    }
                  >
                    <div
                      className={cn(
                        "flex size-4 items-center justify-center rounded-sm border border-primary",
                        isSelected
                          ? "bg-primary text-primary-foreground"
                          : "opacity-50 [&_svg]:invisible"
                      )}
                    >
                      <CheckIcon className="size-3" />
                    </div>
                    {OptionIcon && (
                      <OptionIcon className="size-4 text-muted-foreground" />
                    )}
                    <span className="flex-1 truncate">{option.label}</span>
                    {counts.has(option.value) && (
                      <span className="font-mono text-xs text-muted-foreground">
                        {counts.get(option.value)}
                      </span>
                    )}
                  </CommandItem>
                )
              })}
            </CommandGroup>
            {selectedValues.size > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem
                    onSelect={() => column.setFilterValue(undefined)}
                    className="justify-center text-center"
                  >
                    {localization.clearFilter}
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
