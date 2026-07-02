'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useDebounceValue } from 'usehooks-ts';
import type {
  ColumnFiltersState,
  OnChangeFn,
  PaginationState,
  RowSelectionState,
  SortingState,
  Updater,
} from '@tanstack/react-table';
import { DefaultParamsRequest } from '@/types/api';

export type TableQueryParams = DefaultParamsRequest;

export interface UseTableQueryStateOptions {
  initialPageSize?: number;
  initialSearch?: string;
  initialColumnFilters?: ColumnFiltersState;
  columnFilterQueryParamMap?: Record<string, string>;
  searchDebounceMs?: number;
  syncUrl?: boolean;
  extraQueryParams?: Record<string, string | number | null | undefined>;
}

function parsePositiveInt(value: string | null, fallback: number): number {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function parseInitialSorting(searchParams: Pick<URLSearchParams, 'get'>): SortingState {
  const sortBy = searchParams.get('sortBy');
  if (!sortBy) return [];
  const sort = searchParams.get('sort');

  return [
    {
      id: sortBy,
      desc: sort === 'desc' || sort === '-1',
    },
  ];
}

function resolveUpdater<T>(updater: Updater<T>, previous: T): T {
  return typeof updater === 'function' ? (updater as (old: T) => T)(previous) : updater;
}

function normalizeSearch(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

export function useTableQueryState(options: UseTableQueryStateOptions = {}) {
  const {
    initialPageSize = 10,
    initialSearch = '',
    initialColumnFilters = [],
    columnFilterQueryParamMap,
    searchDebounceMs = 300,
    syncUrl = false,
    extraQueryParams,
  } = options;
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: parsePositiveInt(searchParams.get('page'), 1) - 1,
    pageSize: parsePositiveInt(searchParams.get('perPage'), initialPageSize),
  });
  const [sorting, setSorting] = useState<SortingState>(() => parseInitialSorting(searchParams));
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(initialColumnFilters);
  const [searchInput, setSearchInput] = useState(searchParams.get('search') ?? initialSearch);
  const [globalFilter, setGlobalFilter] = useDebounceValue(
    normalizeSearch(searchParams.get('search') ?? initialSearch),
    searchDebounceMs,
  );
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const resetPage = useCallback(() => {
    setPagination((previous) => (previous.pageIndex === 0 ? previous : { ...previous, pageIndex: 0 }));
  }, []);

  const onPaginationChange = useCallback<OnChangeFn<PaginationState>>((updater) => {
    setPagination((previous) => resolveUpdater(updater, previous));
  }, []);

  const onSortingChange = useCallback<OnChangeFn<SortingState>>(
    (updater) => {
      setSorting((previous) => resolveUpdater(updater, previous));
      resetPage();
    },
    [resetPage],
  );

  const onColumnFiltersChange = useCallback<OnChangeFn<ColumnFiltersState>>(
    (updater) => {
      setColumnFilters((previous) => resolveUpdater(updater, previous));
      resetPage();
    },
    [resetPage],
  );

  const onGlobalFilterChange = useCallback<OnChangeFn<string | undefined>>(
    (updater) => {
      const next = normalizeSearch(resolveUpdater(updater, globalFilter));
      setSearchInput(next ?? '');
      setGlobalFilter(next);
      resetPage();
    },
    [globalFilter, resetPage, setGlobalFilter],
  );

  const onRowSelectionChange = useCallback<OnChangeFn<RowSelectionState>>((updater) => {
    setRowSelection((previous) => resolveUpdater(updater, previous));
  }, []);

  const setSearch = useCallback(
    (value: string) => {
      setSearchInput(value);
      setGlobalFilter(normalizeSearch(value));
      resetPage();
    },
    [resetPage, setGlobalFilter],
  );

  const clearSelection = useCallback(() => {
    setRowSelection({});
  }, []);

  const queryParams = useMemo<TableQueryParams>(() => {
    const firstSort = sorting[0];

    return {
      page: pagination.pageIndex + 1,
      perPage: pagination.pageSize,
      search: normalizeSearch(globalFilter),
      sortBy: firstSort?.id,
      sort: firstSort ? (firstSort.desc ? -1 : 1) : undefined,
    };
  }, [globalFilter, pagination.pageIndex, pagination.pageSize, sorting]);

  useEffect(() => {
    if (!syncUrl) return;

    const nextParams = new URLSearchParams(searchParams.toString());
    const setOrDelete = (key: string, value: string | number | null | undefined) => {
      if (value == null || value === '') {
        nextParams.delete(key);
        return;
      }
      nextParams.set(key, String(value));
    };

    setOrDelete('page', queryParams.page === 1 ? undefined : queryParams.page);
    setOrDelete('perPage', queryParams.perPage === initialPageSize ? undefined : queryParams.perPage);
    setOrDelete('search', queryParams.search);
    setOrDelete('sortBy', queryParams.sortBy);
    setOrDelete('sort', queryParams.sort);

    for (const [key, value] of Object.entries(extraQueryParams ?? {})) {
      setOrDelete(key, value);
    }

    for (const [columnId, paramName] of Object.entries(columnFilterQueryParamMap ?? {})) {
      const value = columnFilters.find((filter) => filter.id === columnId)?.value;
      setOrDelete(paramName, typeof value === 'string' || typeof value === 'number' ? value : undefined);
    }

    const queryString = nextParams.toString();
    const nextUrl = queryString ? `${pathname}?${queryString}` : pathname;
    const currentUrl = searchParams.toString() ? `${pathname}?${searchParams.toString()}` : pathname;

    if (nextUrl !== currentUrl) {
      router.replace(nextUrl, { scroll: false });
    }
  }, [
    columnFilterQueryParamMap,
    columnFilters,
    extraQueryParams,
    initialPageSize,
    pathname,
    queryParams,
    router,
    searchParams,
    syncUrl,
  ]);

  return {
    pagination,
    sorting,
    columnFilters,
    globalFilter,
    searchInput,
    rowSelection,
    queryParams,
    resetPage,
    setSearch,
    clearSelection,
    onPaginationChange,
    onSortingChange,
    onColumnFiltersChange,
    onGlobalFilterChange,
    onRowSelectionChange,
  };
}
