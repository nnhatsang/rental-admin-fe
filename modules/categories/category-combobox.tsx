'use client';

import { Badge } from '@/components/ui/badge';
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
  useComboboxAnchor,
} from '@/components/ui/combobox';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { cn } from '@/lib/utils';
import { useMemo, useState } from 'react';
import { useGetCategories } from './hooks/use-get-categories';
import { CategorySortBy, type ICategoryOut } from './type';

export type CategoryComboboxProps = {
  value?: string[];
  onChange?: (value: string[]) => void;
  disabled?: boolean;
  ariaInvalid?: boolean;
  className?: string;
  placeholder?: string;
  portalContainer?: HTMLElement | null;
  fetchEnabled?: boolean;
};

function fallbackCategory(id: string): ICategoryOut {
  return {
    id,
    name: id,
    slug: null,
    order: 0,
    isActive: true,
    productCount: 0,
    createdAt: '',
    updatedAt: '',
    deletedAt: null,
  };
}

export function CategoryCombobox({
  value = [],
  onChange,
  disabled,
  ariaInvalid,
  className,
  placeholder = 'Chọn một hoặc nhiều danh mục',
  portalContainer,
  fetchEnabled = true,
}: CategoryComboboxProps) {
  const anchor = useComboboxAnchor();
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search, 300);
  const query = useGetCategories(
    {
      page: 1,
      perPage: 100,
      search: debouncedSearch || undefined,
      sort: 'asc',
      sortBy: CategorySortBy.NAME,
    },
    fetchEnabled,
  );
  const items = query.data?.items ?? [];
  const selectedIds = useMemo(() => new Set(value), [value]);
  const itemById = useMemo(() => {
    const map = new Map<string, ICategoryOut>(items.map((item) => [item.id, item]));

    value.forEach((id) => {
      if (!map.has(id)) map.set(id, fallbackCategory(id));
    });

    return map;
  }, [items, value]);
  const itemIds = useMemo(
    () => Array.from(new Set([...value, ...items.map((item) => item.id)])),
    [items, value],
  );

  return (
    <Combobox
      items={itemIds}
      multiple
      value={value}
      onValueChange={(nextValue) => onChange?.(nextValue as string[])}
      onInputValueChange={(nextValue) => setSearch(nextValue ?? '')}
      itemToStringLabel={(id) => itemById.get(id)?.name ?? id}
      itemToStringValue={(id) => id}
      disabled={disabled}
      autoHighlight
    >
      <ComboboxChips
        ref={anchor}
        className={cn('w-full', className)}
        aria-invalid={ariaInvalid}
      >
        <ComboboxValue>
          {value.map((id) => (
            <ComboboxChip key={id} showRemove={!disabled}>
              {itemById.get(id)?.name ?? id}
            </ComboboxChip>
          ))}
        </ComboboxValue>
        <ComboboxChipsInput
          placeholder={value.length ? 'Thêm danh mục...' : placeholder}
          disabled={disabled}
        />
      </ComboboxChips>

      <ComboboxContent anchor={anchor} portalContainer={portalContainer}>
        <ComboboxEmpty>
          {query.isFetching ? 'Đang tải danh mục...' : 'Không tìm thấy danh mục.'}
        </ComboboxEmpty>
        <ComboboxList>
          {(id: string) => {
            const item = itemById.get(id) ?? fallbackCategory(id);
            const selected = selectedIds.has(id);

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
