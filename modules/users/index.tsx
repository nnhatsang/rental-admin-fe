'use client';

import { PageCardLayout } from '@/components/shared/page-card-layout';
import { Button } from '@/components/ui/button';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TITLE_PAGE } from '@/utils/consts/title-page.const';
import { IconPlus, IconSearch, IconX } from '@tabler/icons-react';
import { statusMeta } from './columns';
import { UserDialogs } from './dialog';
import { useUsersState } from './hooks/use-users-state';
import { DataTable } from '@/components/shared/data-table';
import { UserActivityStatus } from './type';

export default function Users() {
  const state = useUsersState();
  const hasActiveFilters = state.search || state.status || state.roleCode;
  return (
    <PageCardLayout
      title={TITLE_PAGE.USERS.INDEX}
      description={TITLE_PAGE.USERS.DESCRIPTION}
      actions={
        <>
          <InputGroup className="h-7 w-full md:w-64">
            <InputGroupAddon align="inline-start">
              <IconSearch className="size-3.5" />
            </InputGroupAddon>
            <InputGroupInput
              className="h-7"
              placeholder="Tìm kiếm người dùng..."
              value={state.search}
              onChange={(e) => state.setSearch(e.target.value)}
            />
            {/* <InputGroupAddon align="inline-end">
          <Kbd className="h-4 text-[10px]">⌘K</Kbd>
        </InputGroupAddon> */}
          </InputGroup>

          <Button size="sm" onClick={() => { state.setSelectedUser(null); state.setIsFormOpen(true); }}>
            <IconPlus className="mr-1.5 size-4" /> Thêm người dùng
          </Button>
        </>
      }
      filter={
        <>
          <Select
            value={state.status ?? 'ALL'}
            onValueChange={(val) => state.setStatus(val === 'ALL' ? undefined : (val as UserActivityStatus))}
          >
            <SelectTrigger size="sm" className="min-w-[140px]">
              <span className="text-muted-foreground">Trạng thái:</span>
              <SelectValue />
            </SelectTrigger>
            <SelectContent position="popper" align="start">
              <SelectGroup>
                <SelectItem value="ALL">Tất cả</SelectItem>
                {Object.entries(statusMeta).map(([status, meta]) => (
                  <SelectItem key={status} value={status}>
                    {meta.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={() => { state.setSearch(''); state.setStatus(undefined); state.setRoleCode(undefined); }} className="text-muted-foreground">
              <IconX className="mr-1 size-4" /> Xóa bộ lọc
            </Button>
          )}
          <div className="text-muted-foreground text-sm tabular-nums">{state.table.getFilteredSelectedRowModel().rows.length} đã chọn</div>
        </>
      }
    >
      <DataTable table={state.table} isLoading={state.isLoading} emptyMessage="Không tìm thấy người dùng nào." />
      <UserDialogs state={state} />
    </PageCardLayout>
  );
}
export { Users };
