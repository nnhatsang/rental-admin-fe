'use client';

import * as React from 'react';
import { IconPlus, IconSearch, IconX } from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useGetRoles } from '@/modules/roles/hooks/use-get-roles';
import { UserActivityStatus } from './type';
import { IUsersState } from './hooks/use-users-state';
import { useDebounceValue } from 'usehooks-ts';
import { Kbd } from '@/components/ui/kbd';

interface UsersFiltersProps {
  state: IUsersState;
}

export function UsersFilters({ state }: UsersFiltersProps) {
  const [search, setSearch] = React.useState('');
  const [debouncedSearch] = useDebounceValue(search, 400);

  React.useEffect(() => {
    state.setSearch(debouncedSearch);
    state.setPage(1);
  }, [debouncedSearch]);

  const { data: rolesData } = useGetRoles({ page: 1, perPage: 1000 });
  const roles = rolesData?.data?.items ?? [];

  const handleClearFilters = () => {
    setSearch('');
    state.setSearch('');
    state.setStatus(undefined);
    state.setRoleCode(undefined);
    state.setPage(1);
  };

  const hasActiveFilters = search || state.status || state.roleCode;

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3 w-full">
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* <InputGroup className="h-9 w-full md:w-64">
            <InputGroupAddon align="inline-start">
              <IconSearch className="size-4" />
            </InputGroupAddon>
            <InputGroupInput
              className="h-9 text-sm"
              placeholder="Tìm kiếm người dùng..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </InputGroup> */}

          <InputGroup className="h-7 w-full md:w-64">
            <InputGroupAddon align="inline-start">
              <IconSearch className="size-3.5" />
            </InputGroupAddon>
            <InputGroupInput
              className="h-7"
              placeholder="Tìm kiếm người dùng..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <InputGroupAddon align="inline-end">
              <Kbd className="h-4 text-[10px]">⌘K</Kbd>
            </InputGroupAddon>
          </InputGroup>

          {/* Lọc theo Vai trò */}
          <Select
            value={state.roleCode || 'ALL'}
            onValueChange={(val) => {
              state.setRoleCode(val === 'ALL' ? undefined : val);
              state.setPage(1);
            }}
          >
            <SelectTrigger className="h-9 text-sm min-w-[140px]">
              <SelectValue placeholder="Vai trò" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="ALL">Tất cả vai trò</SelectItem>
                {roles.map((role) => (
                  <SelectItem key={role.id} value={role.code}>
                    {role.name}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>

          {/* Lọc theo Trạng thái */}
          <Select
            value={state.status || 'ALL'}
            onValueChange={(val) => {
              state.setStatus(val === 'ALL' ? undefined : (val as UserActivityStatus));
              state.setPage(1);
            }}
          >
            <SelectTrigger className="h-9 text-sm min-w-[140px]">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
                <SelectItem value={UserActivityStatus.Active}>Hoạt động</SelectItem>
                <SelectItem value={UserActivityStatus.Inactive}>Chưa kích hoạt</SelectItem>
                <SelectItem value={UserActivityStatus.Banned}>Bị cấm</SelectItem>
                <SelectItem value={UserActivityStatus.Locked}>Bị khóa</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>

          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={handleClearFilters} className="h-9 px-2 text-muted-foreground">
              <IconX className="mr-1 size-4" /> Xóa bộ lọc
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button size="sm" onClick={() => state.setIsCreateOpen(true)} className="h-9">
            <IconPlus className="mr-1.5 size-4" /> Thêm người dùng
          </Button>
        </div>
      </div>
    </>
  );
}
export default UsersFilters;

{
  /* <InputGroup className="h-7 w-full md:w-64">
            <InputGroupAddon align="inline-start">
              <Search className="size-3.5" />
            </InputGroupAddon>
            <InputGroupInput
              className="h-7"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(event) => {
                table.getColumn('search')?.setFilterValue(event.target.value || undefined);
                table.setPageIndex(0);
              }}
            />
            <InputGroupAddon align="inline-end">
              <Kbd className="h-4 text-[10px]">⌘K</Kbd>
            </InputGroupAddon>
          </InputGroup>
          <Button variant="outline" size="sm">
            <SlidersHorizontal /> Hide
          </Button>
          <Button variant="outline" size="sm">
            <Cog /> Customize
          </Button>
          <Button variant="outline" size="sm">
            <Download /> Export
          </Button>
          <Button size="sm">
            <Plus /> Add User
          </Button> */
}
