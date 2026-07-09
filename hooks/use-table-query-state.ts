'use client';

import type { DefaultParamsRequest } from '@/types/api';
import type { ColumnFiltersState, OnChangeFn, PaginationState, SortingState } from '@tanstack/react-table';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useMemo } from 'react';

type QueryStateColumn = {
  accessorKey?: unknown;
  meta?: {
    variant?: string;
  };
};

type UseTableQueryStateParams = {
  columns?: QueryStateColumn[];
  defaultPageSize?: number;
};

type QueryValue = string | number | string[] | undefined | null;

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

export function useTableQueryState<
  TParams extends DefaultParamsRequest = DefaultParamsRequest,
>({ columns, defaultPageSize = 10 }: UseTableQueryStateParams = {}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const filters = useMemo(() => getFilterIds(columns), [columns]);

  const setParams = useCallback(
    (updates: Record<string, QueryValue>, resetPage = false) => {
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
    [pathname, router, searchParams],
  );

  const pagination: PaginationState = useMemo(() => {
    const page = Number(searchParams.get('page'));
    const perPage = Number(searchParams.get('perPage'));

    return {
      pageIndex: Number.isInteger(page) && page > 0 ? page - 1 : 0,
      pageSize: Number.isInteger(perPage) && perPage > 0 ? perPage : defaultPageSize,
    };
  }, [defaultPageSize, searchParams]);

  const sorting: SortingState = useMemo(() => {
    const sortBy = searchParams.get('sortBy');
    if (!sortBy) return [];

    return [{ id: sortBy, desc: searchParams.get('sort') === 'desc' }];
  }, [searchParams]);

  const globalFilter = searchParams.get('search') ?? '';

  const filterQueryParams = useMemo(() => {
    const result: Partial<TParams> = {};

    filters.forEach((filter) => {
      const value = searchParams.get(filter.id);
      if (!value) return;

      result[filter.id as keyof TParams] = (filter.isMulti ? value.split(',').filter(Boolean) : value) as TParams[keyof TParams];
    });

    return result;
  }, [filters, searchParams]);

  const columnFilters: ColumnFiltersState = useMemo(() => {
    const filterValues = filterQueryParams as Record<string, QueryValue>;

    return filters
      .map((filter) => {
        const value = filterValues[filter.id];
        return value ? { id: filter.id, value } : null;
      })
      .filter(Boolean) as ColumnFiltersState;
  }, [filterQueryParams, filters]);

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

  const onPaginationChange: OnChangeFn<PaginationState> = useCallback((updater) => {
    const next = typeof updater === 'function' ? updater(pagination) : updater;

    setParams({
      page: next.pageIndex > 0 ? next.pageIndex + 1 : undefined,
      perPage: next.pageSize !== defaultPageSize ? next.pageSize : undefined,
    });
  }, [defaultPageSize, pagination, setParams]);

  const onSortingChange: OnChangeFn<SortingState> = useCallback((updater) => {
    const next = typeof updater === 'function' ? updater(sorting) : updater;
    const sort = next[0];

    setParams(
      {
        sortBy: sort?.id,
        sort: sort ? (sort.desc ? 'desc' : 'asc') : undefined,
      },
      true,
    );
  }, [setParams, sorting]);

  const onGlobalFilterChange: OnChangeFn<string | undefined> = useCallback((updater) => {
    const next = typeof updater === 'function' ? updater(globalFilter) : updater;
    setParams({ search: typeof next === 'string' ? next.trim() : undefined }, true);
  }, [globalFilter, setParams]);

  const onColumnFiltersChange: OnChangeFn<ColumnFiltersState> = useCallback((updater) => {
    const next = typeof updater === 'function' ? updater(columnFilters) : updater;
    const updates: Record<string, QueryValue> = {};

    filters.forEach((filter) => {
      updates[filter.id] = next.find((item) => item.id === filter.id)?.value as QueryValue;
    });

    setParams(updates, true);
  }, [columnFilters, filters, setParams]);

  const resetPage = useCallback(() => {
    setParams({ page: undefined });
  }, [setParams]);

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
