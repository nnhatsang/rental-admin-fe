'use client';

import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { TITLE_PAGE } from '@/utils/consts/title-page.const';
import { applyApiFormErrors } from '@/utils/form-error';
import { zodResolver } from '@hookform/resolvers/zod';
import { IconLoader } from '@tabler/icons-react';
import { type Table } from '@tanstack/react-table';
import { AlertTriangle } from 'lucide-react';
import { Controller, useForm } from 'react-hook-form';
import { useCreateUser } from './hooks/use-create-user';
import { useDeleteUser } from './hooks/use-delete-user';
import { useResetUserPassword } from './hooks/use-reset-user-password';
import { useUpdateUser } from './hooks/use-update-user';
import {
  createUserSchema,
  type ICreateUserInput,
  type IResetUserPasswordInput,
  type IUpdateUserInput,
  resetUserPasswordSchema,
  updateUserSchema,
} from './schema';
import type { IUserOut } from './type';
import { useUsers } from './users-provider';

type UserFormValues = ICreateUserInput | IUpdateUserInput;

type UserFormDialogProps = {
  currentRow?: IUserOut;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function UserFormDialog({ currentRow, open, onOpenChange }: UserFormDialogProps) {
  const isEdit = !!currentRow;
  const text = TITLE_PAGE.USERS;
  const createMutation = useCreateUser();
  const updateMutation = useUpdateUser();
  const isPending = isEdit ? updateMutation.isPending : createMutation.isPending;

  const form = useForm<UserFormValues>({
    resolver: zodResolver(isEdit ? updateUserSchema : createUserSchema),
    defaultValues: isEdit
      ? {
          ...currentRow,
          phone: currentRow?.phone || '',
        }
      : {
          email: '',
          fullName: '',
          phone: '',
          password: '',
        },
  });
  const { control, handleSubmit, reset } = form;

  const handleClose = () => {
    reset();
    onOpenChange(false);
  };

  const onSubmit = (values: UserFormValues) => {
    if (isEdit && currentRow) {
      updateMutation.mutate(
        {
          id: currentRow.id,
          data: values as IUpdateUserInput,
        },
        {
          onError: (err) => applyApiFormErrors(form, err, { fallbackMessage: text.ERRORS.UPDATE_FAILED }),
          onSuccess: handleClose,
        },
      );
      return;
    }

    createMutation.mutate(values as ICreateUserInput, {
      onError: (err) => applyApiFormErrors(form, err, { fallbackMessage: text.ERRORS.CREATE_FAILED }),
      onSuccess: handleClose,
    });
  };

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => (nextOpen ? onOpenChange(true) : handleClose())}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? text.DIALOG.FORM_EDIT_TITLE : text.DIALOG.FORM_CREATE_TITLE}</DialogTitle>
          <DialogDescription>
            {isEdit ? text.DIALOG.FORM_EDIT_DESCRIPTION : text.DIALOG.FORM_CREATE_DESCRIPTION}
          </DialogDescription>
        </DialogHeader>

        <form id="user-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          <Controller
            control={control}
            name="fullName"
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel>{text.FORM.FULL_NAME}</FieldLabel>
                <Input placeholder={text.FORM.FULL_NAME_PLACEHOLDER} {...field} value={field.value ?? ''} />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          <Controller
            control={control}
            name="email"
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel>{text.FORM.EMAIL}</FieldLabel>
                <Input placeholder={text.FORM.EMAIL_PLACEHOLDER} type="email" {...field} value={field.value ?? ''} />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          <Controller
            control={control}
            name="phone"
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel>{text.FORM.PHONE}</FieldLabel>
                <Input placeholder={text.FORM.PHONE_PLACEHOLDER} {...field} value={field.value ?? ''} />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          {!isEdit && (
            <Controller
              control={control}
              name="password"
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel>{text.FORM.INITIAL_PASSWORD}</FieldLabel>
                  <PasswordInput
                    placeholder={text.FORM.INITIAL_PASSWORD_PLACEHOLDER}
                    {...field}
                    value={field.value ?? ''}
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              {text.DIALOG.CANCEL}
            </Button>
            <Button type="submit" form="user-form" disabled={isPending}>
              {isPending && <IconLoader className="mr-2 size-4 animate-spin" />}
              {isEdit ? text.DIALOG.SAVE_CHANGES : text.DIALOG.CREATE_SUBMIT}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

type UserResetPasswordDialogProps = {
  currentRow: IUserOut;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function UserResetPasswordDialog({ currentRow, open, onOpenChange }: UserResetPasswordDialogProps) {
  const text = TITLE_PAGE.USERS;
  const mutation = useResetUserPassword();
  const form = useForm<IResetUserPasswordInput>({
    resolver: zodResolver(resetUserPasswordSchema),
    defaultValues: { newPassword: '', confirmPassword: '' },
  });

  const handleClose = () => {
    form.reset();
    onOpenChange(false);
  };

  const onSubmit = (values: IResetUserPasswordInput) => {
    mutation.mutate(
      { id: currentRow.id, data: values },
      {
        onError: (err) => applyApiFormErrors(form, err, { fallbackMessage: text.ERRORS.RESET_PASSWORD_FAILED }),
        onSuccess: handleClose,
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => (nextOpen ? onOpenChange(true) : handleClose())}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>{text.DIALOG.RESET_PASSWORD_TITLE}</DialogTitle>
          <DialogDescription>
            {text.DIALOG.RESET_PASSWORD_DESCRIPTION_PREFIX} <strong>{currentRow.fullName}</strong>.{' '}
            {text.DIALOG.RESET_PASSWORD_DESCRIPTION_SUFFIX}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
          <Controller
            control={form.control}
            name="newPassword"
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel>{text.FORM.NEW_PASSWORD}</FieldLabel>
                <PasswordInput placeholder={text.FORM.NEW_PASSWORD_PLACEHOLDER} {...field} />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
          <Controller
            control={form.control}
            name="confirmPassword"
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel>{text.FORM.CONFIRM_NEW_PASSWORD}</FieldLabel>
                <PasswordInput placeholder={text.FORM.CONFIRM_NEW_PASSWORD_PLACEHOLDER} {...field} />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              {text.DIALOG.CANCEL}
            </Button>
            <Button type="submit" disabled={mutation.isPending} className="min-w-[100px]">
              {mutation.isPending && <IconLoader className="mr-2 size-4 animate-spin" />}
              {text.DIALOG.UPDATE_SUBMIT}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

type UserDeleteDialogProps = {
  currentRow: IUserOut;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function UserDeleteDialog({ currentRow, open, onOpenChange }: UserDeleteDialogProps) {
  const text = TITLE_PAGE.USERS;
  const deleteMutation = useDeleteUser();

  const handleDelete = () => {
    onOpenChange(false);
    window.setTimeout(() => {
      deleteMutation.mutate([currentRow.id]);
    }, 500);
  };
  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title={text.DIALOG.DELETE_TITLE}
      desc={
        <>
          {text.DIALOG.DELETE_DESCRIPTION_PREFIX} <strong>{currentRow.fullName}</strong>?{' '}
          {text.DIALOG.DELETE_DESCRIPTION_SUFFIX}
        </>
      }
      confirmText={text.DIALOG.CONFIRM_DELETE}
      cancelBtnText={text.DIALOG.CANCEL}
      destructive
      handleConfirm={handleDelete}
    />
  );
}

type UserMultiDeleteDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  table: Table<IUserOut>;
};
export function UsersMultiDeleteDialog({ open, onOpenChange, table }: UserMultiDeleteDialogProps) {
  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const { mutate } = useDeleteUser();
  const text = TITLE_PAGE.USERS;

  const handleDelete = async () => {
    onOpenChange(false);

    mutate(
      selectedRows.map((row) => row.original.id),
      {
        onSuccess: () => {
          table.resetRowSelection();
        },
      },
    );

    // try {
    //   await toast.promise(mutateAsync(selectedRows.map((row) => row.original.id)), {
    //     loading: 'Deleting users...',
    //     success: () => {
    //       table.resetRowSelection();

    //       return `Deleted ${selectedRows.length} ${selectedRows.length > 1 ? 'users' : 'user'}`;
    //     },
    //     error: 'Failed to delete users',
    //   });
    // } catch {
    //   // toast.promise đã xử lý error
    // }
  };
  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title={
        <span className="text-destructive">
          <AlertTriangle className="me-1 inline-block stroke-destructive" size={18} /> {text.DIALOG.DELETE_TITLE}{' '}
          {selectedRows.length} {selectedRows.length > 1 ? 'users' : 'user'}
        </span>
      }
      desc={
        <>
          Are you sure you want to delete {selectedRows.length} {selectedRows.length > 1 ? 'users' : 'user'}?{' '}
        </>
      }
      confirmText={text.DIALOG.CONFIRM_DELETE}
      cancelBtnText={text.DIALOG.CANCEL}
      destructive
      handleConfirm={handleDelete}
    />
  );
}
type DataTableBulkActionsProps = {
  table: Table<IUserOut>;
};
export function UserDialogs({ table }: DataTableBulkActionsProps) {
  const { open, setOpen, currentRow, setCurrentRow } = useUsers();

  const closeDialog = () => {
    setOpen(null);
    setTimeout(() => {
      setCurrentRow(null);
    }, 500);
  };

  return (
    <>
      <UserFormDialog
        key="user-add"
        open={open === 'add'}
        onOpenChange={(nextOpen) => (nextOpen ? setOpen('add') : closeDialog())}
      />
      <UsersMultiDeleteDialog
        key="'delete-multi"
        open={open === 'delete-multi'}
        onOpenChange={(nextOpen) => (nextOpen ? setOpen('delete-multi') : closeDialog())}
        table={table}
      />

      {currentRow && (
        <>
          <UserFormDialog
            key={`user-edit-${currentRow.id}`}
            open={open === 'edit'}
            onOpenChange={(nextOpen) => (nextOpen ? setOpen('edit') : closeDialog())}
            currentRow={currentRow}
          />

          <UserResetPasswordDialog
            key={`user-reset-password-${currentRow.id}`}
            currentRow={currentRow}
            open={open === 'reset-password'}
            onOpenChange={(nextOpen) => (nextOpen ? setOpen('reset-password') : closeDialog())}
          />

          <UserDeleteDialog
            key={`user-delete-${currentRow.id}`}
            currentRow={currentRow}
            open={open === 'delete'}
            onOpenChange={(nextOpen) => (nextOpen ? setOpen('delete') : closeDialog())}
          />
        </>
      )}
    </>
  );
}

export default UserDialogs;
