'use client';

import { IconCode, IconRefresh } from '@tabler/icons-react';
import { ProtectedAction } from '@/components/shared/protected-action';
import type { DataTableInstance } from '@/components/ui/data-table';
import { useDataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { useTableQueryState } from '@/hooks/use-table-query-state';
import { PermissionCode } from '@/utils/consts/rbac.const';
import { useMemo, useState } from 'react';
import { useGetMailTemplates } from '../api/queries';
import columns from '../columns';
import type { IMailTemplateListParams, IMailTemplateOut } from '../type';
import Link from 'next/link';
import { MailTemplateActionItems } from '../components/actions';

export interface IMailTemplateLogic {
  table: DataTableInstance<IMailTemplateOut>;
  selectedTemplate: MailTemplateDialogState;
  setSelectedTemplate: (state: MailTemplateDialogState) => void;
}

export type MailTemplateDialogState = { id: string; readOnly: boolean } | null;

export function useMailTemplateLogic(): IMailTemplateLogic {
  const [selectedTemplate, setSelectedTemplate] = useState<MailTemplateDialogState>(null);
  const tableState = useTableQueryState<IMailTemplateListParams>({
    defaultPageSize: 10,
    columns,
  });
  const rawQueryParams = tableState.queryParams;
  const queryParams = useMemo<IMailTemplateListParams>(() => {
    const activeValue = rawQueryParams.isActive;
    const isActive =
      typeof activeValue === 'boolean'
        ? activeValue
        : activeValue === 'true'
          ? true
          : activeValue === 'false'
            ? false
            : undefined;

    return {
      ...rawQueryParams,
      isActive,
    };
  }, [rawQueryParams]);
  const { data, isLoading, isFetching, refetch } = useGetMailTemplates(queryParams);

  const table = useDataTable<IMailTemplateOut>({
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
      searchPlaceholder: 'Tìm theo key, tên hoặc subject...',
    },
    title: 'Mẫu email',
    description: 'Quản lý nội dung các email hệ thống. Purpose, biến và payload mẫu được backend quản lý theo nghiệp vụ.',
    isLoading,
    showLoadingOverlay: isFetching,
    onPaginationChange: tableState.onPaginationChange,
    onSortingChange: tableState.onSortingChange,
    onColumnFiltersChange: tableState.onColumnFiltersChange,
    onGlobalFilterChange: tableState.onGlobalFilterChange,
    renderToolbarActions: () => (
      <div className="flex flex-wrap items-center gap-2">
        <ProtectedAction permission={PermissionCode.EmailTemplatesRead}>
          <Button asChild variant="outline">
            <Link href="/mail-templates/layouts">
              <IconCode data-icon="inline-start" />
              Quản lý layout
            </Link>
          </Button>
        </ProtectedAction>
        <Button type="button" variant="outline" disabled={isFetching} onClick={() => void refetch()}>
          <IconRefresh data-icon="inline-start" />
          Làm mới
        </Button>
      </div>
    ),
    renderRowActionMenuItems: ({ row }) => (
      <MailTemplateActionItems row={row} onOpen={(id, readOnly) => setSelectedTemplate({ id, readOnly })} />
    ),
    renderEmpty: () => (
      <div className="flex flex-col items-center gap-1 py-8 text-center">
        <span className="font-medium">Chưa có mẫu email phù hợp</span>
        <span className="text-sm text-muted-foreground">Thử thay đổi từ khóa hoặc bộ lọc trạng thái.</span>
      </div>
    ),
  });

  return { table, selectedTemplate, setSelectedTemplate };
}
