'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { IconSearch, IconX } from '@tabler/icons-react';
import { useEffect, useState } from 'react';

export interface DebouncedSearchInputProps {
  value: string;
  onDebouncedChange: (value: string | undefined) => void;
  placeholder?: string;
  debounceMs?: number;
  className?: string;
  inputClassName?: string;
  clearLabel?: string;
}

export function DebouncedSearchInput({
  value,
  onDebouncedChange,
  placeholder = 'Tìm kiếm...',
  debounceMs = 300,
  className,
  inputClassName,
  clearLabel = 'Xóa tìm kiếm',
}: DebouncedSearchInputProps) {
  const [searchValue, setSearchValue] = useState(value);

  useEffect(() => {
    if (searchValue === value) return;
    const id = setTimeout(() => onDebouncedChange(searchValue || undefined), debounceMs);
    return () => clearTimeout(id);
  }, [debounceMs, onDebouncedChange, searchValue, value]);

  const clear = () => {
    setSearchValue('');
    onDebouncedChange(undefined);
  };

  return (
    <div className={cn('flex h-9 items-center gap-0.5 rounded-md border bg-background pr-1 pl-2 focus-within:border-ring', className)}>
      <IconSearch className="size-3.5 shrink-0 text-muted-foreground" />
      <Input
        value={searchValue}
        onChange={(event) => setSearchValue(event.target.value)}
        placeholder={placeholder}
        className={cn('h-7 border-0 px-1 text-sm shadow-none focus-visible:ring-0', inputClassName)}
      />
      {searchValue ? (
        <Button type="button" variant="ghost" size="icon" aria-label={clearLabel} onClick={clear} className="size-7">
          <IconX className="size-3.5" />
        </Button>
      ) : null}
    </div>
  );
}