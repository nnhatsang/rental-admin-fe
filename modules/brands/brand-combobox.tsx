'use client';

import { Badge } from '@/components/ui/badge';
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '@/components/ui/combobox';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { cn } from '@/lib/utils';
import { useMemo, useState } from 'react';
import { useGetBrands } from './hooks/use-get-brands';
import { BrandSortBy, type IBrandOut } from './type';

export type BrandComboboxProps = {
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  ariaInvalid?: boolean;
  className?: string;
  placeholder?: string;
  portalContainer?: HTMLElement | null;
  fetchEnabled?: boolean;
};

function fallbackBrand(id: string): IBrandOut {
  return {
    id,
    name: id,
    slug: null,
    isActive: true,
    productCount: 0,
    createdAt: '',
    updatedAt: '',
    deletedAt: null,
  };
}

export function BrandCombobox({
  value,
  onChange,
  disabled,
  ariaInvalid,
  className,
  placeholder = 'Chọn thương hiệu',
  portalContainer,
  fetchEnabled = true,
}: BrandComboboxProps) {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search, 300);
  const query = useGetBrands(
    {
      page: 1,
      perPage: 100,
      search: debouncedSearch || undefined,
      sort: 'asc',
      sortBy: BrandSortBy.NAME,
    },
    fetchEnabled,
  );
  const items = query.data?.items ?? [];
  const itemById = useMemo(() => {
    const map = new Map<string, IBrandOut>(items.map((item) => [item.id, item]));

    if (value && !map.has(value)) map.set(value, fallbackBrand(value));

    return map;
  }, [items, value]);
  const itemIds = useMemo(
    () => Array.from(new Set([...(value ? [value] : []), ...items.map((item) => item.id)])),
    [items, value],
  );

  return (
    <Combobox
      items={itemIds}
      value={value || null}
      onValueChange={(nextValue) => {
        onChange?.(nextValue ?? '');
        setSearch('');
      }}
      onInputValueChange={(nextValue) => setSearch(nextValue ?? '')}
      itemToStringLabel={(id) => itemById.get(id)?.name ?? id}
      itemToStringValue={(id) => id}
      disabled={disabled}
      autoHighlight
    >
      <ComboboxInput
        className={cn('w-full', className)}
        placeholder={placeholder}
        disabled={disabled}
        showClear={!disabled && Boolean(value)}
        aria-invalid={ariaInvalid}
      />

      <ComboboxContent portalContainer={portalContainer}>
        <ComboboxEmpty>
          {query.isFetching ? 'Đang tải thương hiệu...' : 'Không tìm thấy thương hiệu.'}
        </ComboboxEmpty>
        <ComboboxList>
          {(id: string) => {
            const item = itemById.get(id) ?? fallbackBrand(id);
            const selected = item.id === value;

            return (
              <ComboboxItem
                key={id}
                value={id}
                disabled={!item.isActive && !selected}
              >
                <span className="min-w-0 flex-1 truncate">{item.name}</span>
                {!item.isActive ? (
                  <Badge variant="outline" className="shrink-0 text-[10px]">
                    Tạm tắt
                  </Badge>
                ) : null}
              </ComboboxItem>
            );
          }}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}
