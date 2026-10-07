'use client';

import { IconArrowLeft, IconCode, IconPlus, IconRefresh } from '@tabler/icons-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';

import { ProtectedAction } from '@/components/shared/protected-action';
import type { DataTableInstance } from '@/components/ui/data-table';
import { useDataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { useTableQueryState } from '@/hooks/use-table-query-state';
import { PermissionCode } from '@/utils/consts/rbac.const';
import { useGetMailLayouts } from '../api/queries';
import columns from '../layout-columns';
import type { IMailLayoutListParams, IMailLayoutOut } from '../type';
import { MailLayoutActionItems } from '../components/actions';

export type MailLayoutDialogState = { id?: string; readOnly: boolean } | null;

export interface IMailLayoutLogic {
  table: DataTableInstance<IMailLayoutOut>;
  dialogState: MailLayoutDialogState;
  setDialogState: (state: MailLayoutDialogState) => void;
  deleteLayout: IMailLayoutOut | null;
  setDeleteLayout: (layout: IMailLayoutOut | null) => void;
  isError: boolean;
}

export function useMailLayoutLogic(): IMailLayoutLogic {
  const [dialogState, setDialogState] = useState<MailLayoutDialogState>(null);
  const [deleteLayout, setDeleteLayout] = useState<IMailLayoutOut | null>(null);
  const tableState = useTableQueryState<IMailLayoutListParams>({
    defaultPageSize: 10,
    columns,
  });
  const rawQueryParams = tableState.queryParams;
  const queryParams = useMemo<IMailLayoutListParams>(() => {
    const activeValue = rawQueryParams.isActive;
    const isActive =
      typeof activeValue === 'boolean'
        ? activeValue
        : activeValue === 'true'
          ? true
          : activeValue === 'false'
            ? false
            : undefined;

    return { ...rawQueryParams, isActive };
  }, [rawQueryParams]);
  const { data, isLoading, isFetching, isError, refetch } = useGetMailLayouts(queryParams);

  const table = useDataTable<IMailLayoutOut>({
    data: data?.items ?? [],
    columns,
    pageCount: data?.pagination.totalPage ?? 1,
    state: {
      pagination: tableState.pagination,
      sorting: tableState.sorting,
      columnFilters: tableState.columnFilters,
      globalFilter: tableState.globalFilter,
    },
    getRowId: (row) => row.id,
    defaultGlobalFilterMode: 'fuzzy',
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    enableGlobalFilter: true,
    enableColumnFilters: true,
    enableColumnFilterModes: false,
    localization: {
      searchPlaceholder: 'Tìm theo key hoặc tên layout...',
    },
    title: 'Layout email',
    description: 'Quản lý HTML bao ngoài dùng chung. Layout bắt buộc giữ placeholder {{content}}.',
    isLoading,
    showLoadingOverlay: isFetching,
    onPaginationChange: tableState.onPaginationChange,
    onSortingChange: tableState.onSortingChange,
    onColumnFiltersChange: tableState.onColumnFiltersChange,
    onGlobalFilterChange: tableState.onGlobalFilterChange,
    renderToolbarActions: () => (
      <div className="flex flex-wrap items-center gap-2">
        <Button asChild variant="ghost">
          <Link href="/mail-templates">
            <IconArrowLeft data-icon="inline-start" />
            Mẫu email
          </Link>
        </Button>
        <ProtectedAction permission={PermissionCode.EmailTemplatesUpdate}>
          <Button type="button" onClick={() => setDialogState({ readOnly: false })}>
            <IconPlus data-icon="inline-start" />
            Tạo layout
          </Button>
        </ProtectedAction>
        <Button type="button" variant="outline" disabled={isFetching} onClick={() => void refetch()}>
          <IconRefresh data-icon="inline-start" />
          Làm mới
        </Button>
      </div>
    ),
    renderRowActionMenuItems: ({ row }) => (
      <MailLayoutActionItems
        row={row}
        onOpen={(id, readOnly) => setDialogState({ id, readOnly })}
        onDelete={(layout) => setDeleteLayout(layout)}
      />
    ),
    renderEmpty: () => (
      <div className="flex flex-col items-center gap-1 py-8 text-center">
        <IconCode className="size-5 text-muted-foreground" aria-hidden="true" />
        <span className="font-medium">Chưa có layout email phù hợp</span>
        <span className="text-sm text-muted-foreground">Thử thay đổi từ khóa hoặc bộ lọc trạng thái.</span>
      </div>
    ),
  });

  return { table, dialogState, setDialogState, deleteLayout, setDeleteLayout, isError };
}
