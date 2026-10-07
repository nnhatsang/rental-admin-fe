'use client';

import { IconAlertCircle, IconLoader } from '@tabler/icons-react';

import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { DataTable } from '@/components/ui/data-table';
import { useDeleteMailLayout } from '../api/mutations';
import type { IMailLayoutOut } from '../type';
import { useMailLayoutLogic } from '../hooks/mail-layout-logic';
import { MailLayoutFormDialog } from './update';

function MailLayoutDeleteConfirmDialog({
  layout,
  open,
  onOpenChange,
}: {
  layout: IMailLayoutOut;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const mutation = useDeleteMailLayout();

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title={'X\u00f3a layout email?'}
      desc={
        <>
          {'B\u1ea1n c\u00f3 ch\u1eafc ch\u1eafn mu\u1ed1n x\u00f3a layout '}
          <strong>{layout.name}</strong>
          {'? Layout ch\u1ec9 c\u00f3 th\u1ec3 x\u00f3a khi kh\u00f4ng c\u00f2n template n\u00e0o s\u1eed d\u1ee5ng.'}
        </>
      }
      cancelBtnText={'Quay l\u1ea1i'}
      confirmText={mutation.isPending ? <IconLoader className="animate-spin" /> : 'X\u00f3a layout'}
      destructive
      isLoading={mutation.isPending}
      handleConfirm={() => {
        mutation.mutate(layout.id, { onSuccess: () => onOpenChange(false) });
      }}
    />
  );
}

function MailLayoutsTable() {
  const { table, dialogState, setDialogState, deleteLayout, setDeleteLayout, isError } = useMailLayoutLogic();

  return (
    <main className="@container/main flex min-w-0 flex-col gap-5">
      {isError ? (
        <Alert variant="destructive">
          <IconAlertCircle aria-hidden="true" />
          <AlertTitle>Không tải được layout email</AlertTitle>
          <AlertDescription>Kiểm tra quyền truy cập hoặc thử làm mới bảng.</AlertDescription>
        </Alert>
      ) : null}
      <DataTable table={table} />

      {dialogState ? (
        <MailLayoutFormDialog
          id={dialogState.id}
          readOnly={dialogState.readOnly}
          open
          onOpenChange={(open) => {
            if (!open) setDialogState(null);
          }}
        />
      ) : null}

      {deleteLayout ? (
        <MailLayoutDeleteConfirmDialog
          layout={deleteLayout}
          open
          onOpenChange={(open) => {
            if (!open) setDeleteLayout(null);
          }}
        />
      ) : null}
    </main>
  );
}

export function MailLayoutList() {
  return <MailLayoutsTable />;
}
