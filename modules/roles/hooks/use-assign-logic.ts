'use client';

import { useState } from 'react';
import { RowSelectionState } from '@tanstack/react-table';

import { useDataTable, type DataTableInstance } from '@/components/ui/data-table';
import { useTableQueryState } from '@/hooks/use-table-query-state';

import { List } from '@/utils/enums/list.enum';
import { TITLE_PAGE } from '@/utils/consts/title-page.const';

import { IUserOut, IGetUsersParams } from '@/modules/users/type';
import { columns as userColumns } from '@/modules/users/columns';
import { useGetUsers } from '@/modules/users/hooks/use-get-users';

export interface UseAssignLogicProps {
  roleCode: string;
}

export interface UseAssignLogicReturn {
  table: DataTableInstance<IUserOut>;
  inOutList: List;
  setInOutList: React.Dispatch<React.SetStateAction<List>>;
}

export const useAssignLogic = ({ roleCode }: UseAssignLogicProps): UseAssignLogicReturn => {
  const [inOutList, setInOutList] = useState(List.In);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const { queryParams, pagination, globalFilter, onPaginationChange, onGlobalFilterChange } =
    useTableQueryState<IGetUsersParams>({
      defaultPageSize: 10,
      columns: userColumns,
      syncToUrl: false,
    });

  const { data, isLoading, isFetching } = useGetUsers({
    ...queryParams,
    ...(inOutList === List.In && { roleCode: roleCode }),
    ...(inOutList === List.Out && { excludeRoleCode: roleCode }),
  });

  const table = useDataTable<IUserOut>({
    data: data?.items ?? [],
    columns: userColumns,
    pageCount: data?.pagination?.totalPage ?? 1,

    state: {
      pagination,
      globalFilter,
      rowSelection,
    },

    getRowId: (row) => row.id,

    manualPagination: true,
    manualFiltering: true,

    enableRowSelection: true,
    enableGlobalFilter: true,
    enableColumnFilters: false,
    enableSorting: false,

    isLoading,
    showLoadingOverlay: isFetching,

    enableColumnActions: false,
    enableFullscreenToggle: false,
    enableDensityToggle: false,
    exportFileName: '',
    enableStickyHeader: true,
    enableStickyFooter: true,
    // initialState: {
    //   columnPinning: {
    //     right: ['actions'],
    //   },
    // },
    readOnly: true,
    onPaginationChange,
    onGlobalFilterChange,
    onRowSelectionChange: setRowSelection,
  });

  return {
    table,
    inOutList,
    setInOutList,
  };
};
