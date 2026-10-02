'use client';

import { IconCalendarOff, IconEdit, IconLoader, IconPlus, IconTrash } from '@tabler/icons-react';
import { useMemo, useState } from 'react';

import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import { Skeleton } from '@/components/ui/skeleton';
import { SettingsRefreshButton } from '@/modules/settings/components/settings-refresh-button';
import { useDeleteStoreClosures, useGetStoreClosures } from '../hooks/use-store-closures';
import type { IStoreClosureOut } from '../type';
import { StoreClosureFormDialog, storeClosureTypeLabels } from './store-closure-form-dialog';

type StoreClosuresPanelProps = {
  canEdit: boolean;
};

const listParams = {
  page: 1,
  perPage: 50,
  sort: 'asc' as const,
  sortBy: 'startDate',
};

const formatDate = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Không xác định';
  return new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(date);
};

export function StoreClosuresPanel({ canEdit }: StoreClosuresPanelProps) {
  const query = useGetStoreClosures(listParams);
  const deleteMutation = useDeleteStoreClosures();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<IStoreClosureOut | null>(null);
  const [deleting, setDeleting] = useState<IStoreClosureOut | null>(null);
  const items = query.data?.items ?? [];
  const refreshAction = (
    <SettingsRefreshButton isFetching={query.isFetching} onRefresh={() => void query.refetch()} />
  );

  const emptyText = useMemo(
    () => (query.isFetching ? 'Đang tải lịch đóng cửa...' : 'Chưa có ngày nghỉ hoặc lịch bảo trì nào.'),
    [query.isFetching],
  );

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (item: IStoreClosureOut) => {
    setEditing(item);
    setFormOpen(true);
  };

  const handleDelete = () => {
    if (!deleting) return;

    deleteMutation.mutate(
      { storeClosureIds: [deleting.id] },
      {
        onSuccess: () => setDeleting(null),
      },
    );
  };

  if (query.isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex justify-end">{refreshAction}</div>
        <Card>
          <CardContent className="flex flex-col gap-3 p-4 sm:p-6">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="h-16 w-full" />
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (query.isError) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex justify-end">{refreshAction}</div>
        <Alert variant="destructive">
        <IconCalendarOff aria-hidden="true" />
        <AlertTitle>Không tải được lịch đóng cửa</AlertTitle>
        <AlertDescription>Kiểm tra quyền truy cập hoặc thử tải lại trang.</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-4 max-md:pt-2">
        <div className="flex flex-wrap items-center justify-end gap-2">
          {refreshAction}
          {canEdit ? (
            <Button type="button" onClick={openCreate}>
              <IconPlus data-icon="inline-start" />
              Thêm lịch đóng cửa
            </Button>
          ) : null}
        </div>

        {items.length === 0 ? (
          <Empty className="min-h-48 rounded-none border-0 py-10">
            <EmptyMedia variant="icon">
              <IconCalendarOff aria-hidden="true" />
            </EmptyMedia>
            <EmptyHeader>
              <EmptyTitle>{emptyText}</EmptyTitle>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className="divide-y divide-accent/50">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-start sm:justify-between"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium">
                      {formatDate(item.startDate)} – {formatDate(item.endDate)}
                    </span>
                    <Badge variant="outline">{storeClosureTypeLabels[item.type]}</Badge>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{item.reason || 'Chưa có lý do cụ thể.'}</p>
                </div>
                {canEdit ? (
                  <div className="flex shrink-0 items-center gap-1">
                    <Button type="button" variant="ghost" size="sm" onClick={() => openEdit(item)}>
                      <IconEdit data-icon="inline-start" />
                      Sửa
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      className="text-muted-foreground hover:text-destructive"
                      aria-label={'Xóa lịch đóng cửa từ ' + formatDate(item.startDate)}
                      onClick={() => setDeleting(item)}
                    >
                      <IconTrash />
                    </Button>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </div>

      <StoreClosureFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        currentRow={editing}
        canEdit={canEdit}
      />

      <ConfirmDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => {
          if (!open) setDeleting(null);
        }}
        title="Xóa lịch đóng cửa?"
        desc={
          deleting
            ? 'Lịch ' + formatDate(deleting.startDate) + ' – ' + formatDate(deleting.endDate) + ' sẽ được xóa khỏi danh sách.'
            : ''
        }
        destructive
        confirmText={deleteMutation.isPending ? <IconLoader className="animate-spin" /> : 'Xóa lịch'}
        handleConfirm={handleDelete}
        isLoading={deleteMutation.isPending}
      />
    </>
  );
}
