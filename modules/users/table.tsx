'use client';

import * as React from 'react';
import { format } from 'date-fns';
import {
  IconDotsVertical,
  IconEdit,
  IconKey,
  IconLock,
  IconLockOpen,
  IconTrash,
} from '@tabler/icons-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { IUsersState } from './hooks/use-users-state';
import { IUserOut, UserActivityStatus } from './type';
import { Skeleton } from '@/components/ui/skeleton';

interface UsersTableProps {
  state: IUsersState;
}

export function UsersTable({ state }: UsersTableProps) {
  const {
    usersData,
    isLoading,
    page,
    totalPages,
    setPage,
    handleOpenEdit,
    handleOpenDelete,
    handleOpenResetPassword,
    handleToggleStatus,
  } = state;

  const renderStatusBadge = (status: UserActivityStatus) => {
    switch (status) {
      case 'ACTIVE':
        return (
          <Badge className="bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 hover:bg-emerald-500/15 border-transparent">
            Hoạt động
          </Badge>
        );
      case 'BANNED':
        return (
          <Badge className="bg-red-500/10 text-red-600 dark:bg-red-500/20 dark:text-red-400 hover:bg-red-500/15 border-transparent">
            Bị cấm
          </Badge>
        );
      case 'LOCKED':
        return (
          <Badge className="bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400 hover:bg-amber-500/15 border-transparent">
            Bị khóa
          </Badge>
        );
      case 'INACTIVE':
      default:
        return (
          <Badge className="bg-zinc-500/10 text-zinc-600 dark:bg-zinc-500/20 dark:text-zinc-400 hover:bg-zinc-500/15 border-transparent">
            Chưa kích hoạt
          </Badge>
        );
    }
  };

  const handlePrevPage = (e: React.MouseEvent) => {
    e.preventDefault();
    if (page > 1) setPage(page - 1);
  };

  const handleNextPage = (e: React.MouseEvent) => {
    e.preventDefault();
    if (page < totalPages) setPage(page + 1);
  };

  const handlePageClick = (pageNum: number, e: React.MouseEvent) => {
    e.preventDefault();
    setPage(pageNum);
  };

  return (
    <div className="space-y-4">
      <div className="border border-border/50 rounded-2xl overflow-hidden bg-card/50">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="font-semibold text-foreground/80 pl-4 py-3">Họ và tên / Email</TableHead>
              <TableHead className="font-semibold text-foreground/80 py-3">Số điện thoại</TableHead>
              <TableHead className="font-semibold text-foreground/80 py-3">Vai trò</TableHead>
              <TableHead className="font-semibold text-foreground/80 py-3">Trạng thái</TableHead>
              <TableHead className="font-semibold text-foreground/80 py-3">Ngày tạo</TableHead>
              <TableHead className="w-12 text-right pr-4 py-3"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, idx) => (
                <TableRow key={idx} className="hover:bg-transparent border-b border-border/30">
                  <TableCell className="pl-4 py-3.5">
                    <div className="space-y-2">
                      <Skeleton className="h-5 w-40" />
                      <Skeleton className="h-4 w-52" />
                    </div>
                  </TableCell>
                  <TableCell className="py-3.5">
                    <Skeleton className="h-5 w-28" />
                  </TableCell>
                  <TableCell className="py-3.5">
                    <Skeleton className="h-5 w-20" />
                  </TableCell>
                  <TableCell className="py-3.5">
                    <Skeleton className="h-5 w-16" />
                  </TableCell>
                  <TableCell className="py-3.5">
                    <Skeleton className="h-5 w-32" />
                  </TableCell>
                  <TableCell className="pr-4 py-3.5 text-right">
                    <Skeleton className="h-8 w-8 ml-auto rounded-full" />
                  </TableCell>
                </TableRow>
              ))
            ) : usersData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                  Không tìm thấy người dùng nào.
                </TableCell>
              </TableRow>
            ) : (
              usersData.map((user: IUserOut) => (
                <TableRow key={user.id} className="border-b border-border/30">
                  <TableCell className="pl-4 py-3">
                    <div className="flex flex-col">
                      <span className="font-medium text-foreground">{user.fullName}</span>
                      <span className="text-xs text-muted-foreground">{user.email}</span>
                    </div>
                  </TableCell>
                  <TableCell className="py-3 text-muted-foreground">
                    {user.phone || '—'}
                  </TableCell>
                  <TableCell className="py-3">
                    <div className="flex flex-wrap gap-1">
                      {user.roles.map((role) => (
                        <Badge key={role.id} variant="secondary" className="text-[10px] font-medium h-5">
                          {role.name}
                        </Badge>
                      ))}
                      {user.roles.length === 0 && <span className="text-muted-foreground text-xs">—</span>}
                    </div>
                  </TableCell>
                  <TableCell className="py-3">
                    {renderStatusBadge(user.activityStatus)}
                  </TableCell>
                  <TableCell className="py-3 text-muted-foreground text-xs">
                    {user.createdAt ? format(new Date(user.createdAt), 'dd/MM/yyyy HH:mm') : '—'}
                  </TableCell>
                  <TableCell className="pr-4 py-3 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl hover:bg-muted/80">
                          <IconDotsVertical className="size-4 text-muted-foreground" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem onClick={() => handleOpenEdit(user)}>
                          <IconEdit className="mr-2 size-4" />
                          Chỉnh sửa
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleOpenResetPassword(user)}>
                          <IconKey className="mr-2 size-4" />
                          Đổi mật khẩu
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleToggleStatus(user)}>
                          {user.activityStatus === 'ACTIVE' ? (
                            <>
                              <IconLock className="mr-2 size-4 text-amber-500" />
                              <span className="text-amber-600 dark:text-amber-400">Khóa tài khoản</span>
                            </>
                          ) : (
                            <>
                              <IconLockOpen className="mr-2 size-4 text-emerald-500" />
                              <span className="text-emerald-600 dark:text-emerald-400">Kích hoạt lại</span>
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem variant="destructive" onClick={() => handleOpenDelete(user)}>
                          <IconTrash className="mr-2 size-4" />
                          Xóa người dùng
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center mt-4">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={handlePrevPage}
                  text="Trước"
                  className={page === 1 ? 'pointer-events-none opacity-50' : ''}
                />
              </PaginationItem>

              {Array.from({ length: totalPages }).map((_, index) => {
                const pageNum = index + 1;
                return (
                  <PaginationItem key={pageNum}>
                    <PaginationLink
                      href="#"
                      isActive={page === pageNum}
                      onClick={(e) => handlePageClick(pageNum, e)}
                    >
                      {pageNum}
                    </PaginationLink>
                  </PaginationItem>
                );
              })}

              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={handleNextPage}
                  text="Sau"
                  className={page === totalPages ? 'pointer-events-none opacity-50' : ''}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}
export default UsersTable;
