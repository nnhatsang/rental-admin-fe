'use client';

import type { DefaultParamsRequest } from '@/types/api';
import type { ColumnFiltersState, OnChangeFn, PaginationState, SortingState } from '@tanstack/react-table';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useMemo, useState } from 'react';

type QueryStateColumn = {
  accessorKey?: unknown;
  meta?: {
    variant?: string;
  };
};

type UseTableQueryStateParams = {
  columns?: QueryStateColumn[];
  defaultPageSize?: number;
  /** true: sync table state with URL query string. false: keep state local only. */
  syncToUrl?: boolean;
};

type QueryValue = string | number | string[] | undefined | null;

type LocalQueryState = {
  pagination: PaginationState;
  sorting: SortingState;
  globalFilter: string;
  columnFilters: ColumnFiltersState;
};

const getFilterIds = (columns: QueryStateColumn[] = []) => {
  return columns
    .map((column) => {
      if (!column.meta?.variant || !('accessorKey' in column) || typeof column.accessorKey !== 'string') {
        return null;
      }

      return {
        id: String(column.accessorKey),
        isMulti: column.meta.variant === 'multi-select',
      };
    })
    .filter((item): item is { id: string; isMulti: boolean } => item !== null);
};

const toQueryValue = (value: QueryValue) => {
  if (Array.isArray(value)) return value.length ? value.join(',') : undefined;
  return value;
};

const paginationFromSearchParams = (searchParams: URLSearchParams, defaultPageSize: number): PaginationState => {
  const page = Number(searchParams.get('page'));
  const perPage = Number(searchParams.get('perPage'));

  return {
    pageIndex: Number.isInteger(page) && page > 0 ? page - 1 : 0,
    pageSize: Number.isInteger(perPage) && perPage > 0 ? perPage : defaultPageSize,
  };
};

const sortingFromSearchParams = (searchParams: URLSearchParams): SortingState => {
  const sortBy = searchParams.get('sortBy');
  if (!sortBy) return [];

  return [{ id: sortBy, desc: searchParams.get('sort') === 'desc' }];
};

const filterParamsFromSearchParams = <TParams extends DefaultParamsRequest>(
  searchParams: URLSearchParams,
  filters: ReturnType<typeof getFilterIds>,
) => {
  const result: Partial<TParams> = {};

  filters.forEach((filter) => {
    const value = searchParams.get(filter.id);
    if (!value) return;

    result[filter.id as keyof TParams] = (
      filter.isMulti ? value.split(',').filter(Boolean) : value
    ) as TParams[keyof TParams];
  });

  return result;
};

const columnFiltersFromFilterParams = (
  filterQueryParams: Record<string, QueryValue>,
  filters: ReturnType<typeof getFilterIds>,
): ColumnFiltersState => {
  return filters
    .map((filter) => {
      const value = filterQueryParams[filter.id];
      return value ? { id: filter.id, value } : null;
    })
    .filter(Boolean) as ColumnFiltersState;
};

const filterParamsFromColumnFilters = <TParams extends DefaultParamsRequest>(
  columnFilters: ColumnFiltersState,
  filters: ReturnType<typeof getFilterIds>,
) => {
  const result: Partial<TParams> = {};

  filters.forEach((filter) => {
    const value = columnFilters.find((item) => item.id === filter.id)?.value as QueryValue;
    if (value !== undefined && value !== null && value !== '') {
      result[filter.id as keyof TParams] = value as TParams[keyof TParams];
    }
  });

  return result;
};

export function useTableQueryState<TParams extends DefaultParamsRequest = DefaultParamsRequest>({
  columns,
  defaultPageSize = 10,
  syncToUrl = true,
}: UseTableQueryStateParams = {}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const filters = useMemo(() => getFilterIds(columns), [columns]);

  const [localState, setLocalState] = useState<LocalQueryState>(() => ({
    pagination: { pageIndex: 0, pageSize: defaultPageSize },
    sorting: [],
    globalFilter: '',
    columnFilters: [],
  }));

  const setParams = useCallback(
    (updates: Record<string, QueryValue>, resetPage = false) => {
      if (!syncToUrl) return;

      const params = new URLSearchParams(searchParams.toString());

      if (resetPage) params.delete('page');

      Object.entries(updates).forEach(([key, value]) => {
        const nextValue = toQueryValue(value);

        if (nextValue === undefined || nextValue === null || nextValue === '') {
          params.delete(key);
          return;
        }

        params.set(key, String(nextValue));
      });

      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams, syncToUrl],
  );

  const urlPagination = useMemo(
    () => paginationFromSearchParams(searchParams, defaultPageSize),
    [defaultPageSize, searchParams],
  );
  const urlSorting = useMemo(() => sortingFromSearchParams(searchParams), [searchParams]);
  const urlGlobalFilter = searchParams.get('search') ?? '';
  const urlFilterQueryParams = useMemo(
    () => filterParamsFromSearchParams<TParams>(searchParams, filters),
    [filters, searchParams],
  );
  const urlColumnFilters = useMemo(
    () => columnFiltersFromFilterParams(urlFilterQueryParams as Record<string, QueryValue>, filters),
    [filters, urlFilterQueryParams],
  );

  const pagination = syncToUrl ? urlPagination : localState.pagination;
  const sorting = syncToUrl ? urlSorting : localState.sorting;
  const globalFilter = syncToUrl ? urlGlobalFilter : localState.globalFilter;
  const columnFilters = syncToUrl ? urlColumnFilters : localState.columnFilters;

  const filterQueryParams = useMemo(() => {
    if (syncToUrl) return urlFilterQueryParams;
    return filterParamsFromColumnFilters<TParams>(localState.columnFilters, filters);
  }, [filters, localState.columnFilters, syncToUrl, urlFilterQueryParams]);

  const queryParams = useMemo(() => {
    return {
      page: pagination.pageIndex + 1,
      perPage: pagination.pageSize,
      search: globalFilter || undefined,
      sortBy: sorting[0]?.id,
      sort: sorting[0] ? (sorting[0].desc ? 'desc' : 'asc') : undefined,
      ...filterQueryParams,
    } as TParams;
  }, [filterQueryParams, globalFilter, pagination, sorting]);

  const onPaginationChange: OnChangeFn<PaginationState> = useCallback(
    (updater) => {
      const next = typeof updater === 'function' ? updater(pagination) : updater;

      if (!syncToUrl) {
        setLocalState((prev) => ({ ...prev, pagination: next }));
        return;
      }

      setParams({
        page: next.pageIndex > 0 ? next.pageIndex + 1 : undefined,
        perPage: next.pageSize !== defaultPageSize ? next.pageSize : undefined,
      });
    },
    [defaultPageSize, pagination, setParams, syncToUrl],
  );

  const onSortingChange: OnChangeFn<SortingState> = useCallback(
    (updater) => {
      const next = typeof updater === 'function' ? updater(sorting) : updater;
      const sort = next[0];

      if (!syncToUrl) {
        setLocalState((prev) => ({
          ...prev,
          pagination: { ...prev.pagination, pageIndex: 0 },
          sorting: next,
        }));
        return;
      }

      setParams(
        {
          sortBy: sort?.id,
          sort: sort ? (sort.desc ? 'desc' : 'asc') : undefined,
        },
        true,
      );
    },
    [setParams, sorting, syncToUrl],
  );

  const onGlobalFilterChange: OnChangeFn<string | undefined> = useCallback(
    (updater) => {
      const next = typeof updater === 'function' ? updater(globalFilter) : updater;
      const search = typeof next === 'string' ? next.trim() : '';

      if (!syncToUrl) {
        setLocalState((prev) => ({
          ...prev,
          pagination: { ...prev.pagination, pageIndex: 0 },
          globalFilter: search,
        }));
        return;
      }

      setParams({ search: search || undefined }, true);
    },
    [globalFilter, setParams, syncToUrl],
  );

  const onColumnFiltersChange: OnChangeFn<ColumnFiltersState> = useCallback(
    (updater) => {
      const next = typeof updater === 'function' ? updater(columnFilters) : updater;

      if (!syncToUrl) {
        setLocalState((prev) => ({
          ...prev,
          pagination: { ...prev.pagination, pageIndex: 0 },
          columnFilters: next,
        }));
        return;
      }

      const updates: Record<string, QueryValue> = {};

      filters.forEach((filter) => {
        updates[filter.id] = next.find((item) => item.id === filter.id)?.value as QueryValue;
      });

      setParams(updates, true);
    },
    [columnFilters, filters, setParams, syncToUrl],
  );

  const resetPage = useCallback(() => {
    if (!syncToUrl) {
      setLocalState((prev) => ({
        ...prev,
        pagination: { ...prev.pagination, pageIndex: 0 },
      }));
      return;
    }

    setParams({ page: undefined });
  }, [setParams, syncToUrl]);

  return {
    pagination,
    sorting,
    globalFilter,
    columnFilters,
    queryParams,
    filterQueryParams,
    onPaginationChange,
    onSortingChange,
    onGlobalFilterChange,
    onColumnFiltersChange,
    resetPage,
  };
}
