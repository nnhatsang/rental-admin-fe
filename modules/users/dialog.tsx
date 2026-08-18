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
import { zodResolver } from '@hookform/resolvers/zod';
import { IconLoader } from '@tabler/icons-react';
import { type Table } from '@tanstack/react-table';
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
import { ScrollArea } from '@/components/ui/scroll-area';
import { IUpdateCustomerReq } from '../customers/type';

type UserFormValues = ICreateUserInput | IUpdateUserInput;

type UserFormDialogProps = {
  currentRow?: IUserOut;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  readOnly?: boolean;
};

function UserFormDialog({ currentRow, open, onOpenChange, readOnly = false }: UserFormDialogProps) {
  const isEdit = !!currentRow;
  const text = TITLE_PAGE.USERS;
  const createMutation = useCreateUser();
  const updateMutation = useUpdateUser();
  const isPending = isEdit ? updateMutation.isPending : createMutation.isPending;

  const {
    reset,
    formState: { isDirty, dirtyFields },
    handleSubmit,
    control,
  } = useForm<UserFormValues>({
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

  const handleClose = () => {
    reset();
    onOpenChange(false);
  };

  const onSubmit = (values: UserFormValues) => {
    if (!currentRow) {
      createMutation.mutate(values as ICreateUserInput, {
        onSuccess: handleClose,
      });
      return;
    }

    if (!isDirty) {
      handleClose();
      return;
    }

    const dirtyValues = Object.fromEntries(
      Object.entries(values).filter(([key]) => {
        return dirtyFields[key as keyof UserFormValues];
      }),
    ) as IUpdateCustomerReq;

    updateMutation.mutate(
      {
        id: currentRow.id,
        data: dirtyValues,
      },
      { onSuccess: handleClose },
    );
  };

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => (nextOpen ? onOpenChange(true) : handleClose())}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? text.DIALOG.FORM_EDIT_TITLE : text.DIALOG.FORM_CREATE_TITLE}</DialogTitle>
          <DialogDescription>
            {isEdit ? text.DIALOG.FORM_EDIT_DESCRIPTION : text.DIALOG.FORM_CREATE_DESCRIPTION}
          </DialogDescription>
        </DialogHeader>

        <form id="user-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <ScrollArea className="h-[25dvh] max-h-[calc(100dvh-220px)]">
            <div className="py-2 grid gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Controller
                  control={control}
                  name="fullName"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={field.name}>{text.FORM.FULL_NAME}</FieldLabel>
                      <Input
                        {...field}
                        id={field.name}
                        placeholder={text.FORM.FULL_NAME_PLACEHOLDER}
                        disabled={readOnly}
                        value={field.value ?? ''}
                        aria-invalid={fieldState.invalid}
                      />
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />
                <Controller
                  control={control}
                  name="email"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={field.name}>{text.FORM.EMAIL}</FieldLabel>
                      <Input
                        disabled={readOnly}
                        placeholder={text.FORM.EMAIL_PLACEHOLDER}
                        {...field}
                        id={field.name}
                        type="email"
                        aria-invalid={fieldState.invalid}
                      />
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />
              </div>

              <Controller
                control={control}
                name="phone"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>{text.FORM.PHONE}</FieldLabel>
                    <Input
                      disabled={readOnly}
                      placeholder={text.FORM.PHONE_PLACEHOLDER}
                      {...field}
                      id={field.name}
                      type="phone"
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />

              {!isEdit && (
                <Controller
                  control={control}
                  name="password"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={field.name}>{text.FORM.INITIAL_PASSWORD}</FieldLabel>
                      <PasswordInput
                        placeholder={text.FORM.INITIAL_PASSWORD_PLACEHOLDER}
                        {...field}
                        disabled={readOnly}
                        aria-invalid={fieldState.invalid}
                      />
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />
              )}
            </div>
          </ScrollArea>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              {text.DIALOG.CANCEL}
            </Button>
            {!readOnly && (
              <Button type="submit" form="user-form" disabled={isPending || !isDirty}>
                {isPending && <IconLoader className="mr-2 size-4 animate-spin" />}
                {isEdit ? text.DIALOG.SAVE_CHANGES : text.DIALOG.CREATE_SUBMIT}
              </Button>
            )}
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
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>{text.FORM.NEW_PASSWORD}</FieldLabel>
                <PasswordInput
                  {...field}
                  id={field.name}
                  placeholder={text.FORM.NEW_PASSWORD_PLACEHOLDER}
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
          <Controller
            control={form.control}
            name="confirmPassword"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>{text.FORM.CONFIRM_NEW_PASSWORD}</FieldLabel>
                <PasswordInput
                  {...field}
                  id={field.name}
                  placeholder={text.FORM.CONFIRM_NEW_PASSWORD_PLACEHOLDER}
                  aria-invalid={fieldState.invalid}
                />
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

function UserDeleteConfirmDialog({
  open,
  onOpenChange,
  users,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  users: IUserOut[];
  onSuccess?: () => void;
}) {
  const text = TITLE_PAGE.USERS;
  const deleteMutation = useDeleteUser();
  const isMulti = users.length > 1;

  const handleDelete = () => {
    onOpenChange(false);

    deleteMutation.mutate(
      users.map((user) => user.id),
      {
        onSuccess,
      },
    );
  };

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title={text.DIALOG.DELETE_TITLE}
      desc={
        isMulti ? (
          `Are you sure you want to delete ${users.length} users?`
        ) : (
          <>
            {text.DIALOG.DELETE_DESCRIPTION_PREFIX} <strong>{users[0]?.fullName}</strong>?{' '}
            {text.DIALOG.DELETE_DESCRIPTION_SUFFIX}
          </>
        )
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
  const isFormOpen = open === 'view' || open === 'edit';
  const readOnly = open === 'view';
  return (
    <>
      <UserFormDialog
        key="user-add"
        open={open === 'add'}
        onOpenChange={(nextOpen) => (nextOpen ? setOpen('add') : closeDialog())}
      />
      <UserDeleteConfirmDialog
        open={open === 'delete-multi'}
        onOpenChange={(nextOpen) => (nextOpen ? setOpen('delete-multi') : closeDialog())}
        users={table.getFilteredSelectedRowModel().rows.map((row) => row.original)}
        onSuccess={() => table.resetRowSelection()}
      />

      {currentRow && (
        <>
          <UserFormDialog
            key={`user-form-${currentRow.id}`}
            open={isFormOpen}
            onOpenChange={(nextOpen) => (nextOpen ? setOpen(readOnly ? 'view' : 'edit') : closeDialog())}
            currentRow={currentRow}
            readOnly={readOnly}
          />

          <UserResetPasswordDialog
            key={`user-reset-password-${currentRow.id}`}
            currentRow={currentRow}
            open={open === 'reset-password'}
            onOpenChange={(nextOpen) => (nextOpen ? setOpen('reset-password') : closeDialog())}
          />

          <UserDeleteConfirmDialog
            open={open === 'delete'}
            onOpenChange={(nextOpen) => (nextOpen ? setOpen('delete') : closeDialog())}
            users={[currentRow]}
          />
        </>
      )}
    </>
  );
}

export default UserDialogs;
