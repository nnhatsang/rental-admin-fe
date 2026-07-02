'use client';

import * as React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { IconLoader } from '@tabler/icons-react';
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
import { getDirtyValues } from '@/lib/dirty-form';
import { TITLE_PAGE } from '@/utils/consts/title-page.const';
import { applyApiFormErrors } from '@/utils/form-error';
import { useCreateUser } from './hooks/use-create-user';
import { useResetUserPassword } from './hooks/use-reset-user-password';
import { useUpdateUser } from './hooks/use-update-user';
import { IUsersState } from './hooks/use-users-state';
import {
  createUserSchema,
  ICreateUserInput,
  IResetUserPasswordInput,
  IUpdateUserInput,
  resetUserPasswordSchema,
  updateUserSchema,
} from './schema';

type UserFormValues = ICreateUserInput | IUpdateUserInput;

function UserFormDialog({
  open,
  onOpenChange,
  state,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  state: IUsersState;
}) {
  const { selectedUser, setSelectedUser } = state;
  const isEdit = selectedUser !== null;
  const text = TITLE_PAGE.USERS;

  const form = useForm<UserFormValues>({
    resolver: zodResolver(isEdit ? updateUserSchema : createUserSchema),
    defaultValues: { email: '', fullName: '', phone: '' },
  });

  const createMutation = useCreateUser();
  const updateMutation = useUpdateUser();
  const isPending = isEdit ? updateMutation.isPending : createMutation.isPending;

  const handleClose = React.useCallback(() => {
    onOpenChange(false);
    setSelectedUser(null);
    form.reset();
  }, [form, onOpenChange, setSelectedUser]);

  React.useEffect(() => {
    if (!open) return;

    form.reset(
      isEdit && selectedUser
        ? { email: selectedUser.email, fullName: selectedUser.fullName, phone: selectedUser.phone ?? '' }
        : { email: '', fullName: '', phone: '', password: '' },
    );
  }, [form, isEdit, open, selectedUser]);

  const onSubmit = (values: UserFormValues) => {
    if (isEdit) {
      if (!selectedUser) return;

      const dirtyValues = getDirtyValues(
        values as IUpdateUserInput,
        form.formState.dirtyFields as Partial<Record<keyof IUpdateUserInput, boolean>>,
      );

      if (Object.keys(dirtyValues).length === 0) {
        handleClose();
        return;
      }

      const data = {
        ...dirtyValues,
        ...(Object.prototype.hasOwnProperty.call(dirtyValues, 'phone') ? { phone: dirtyValues.phone || undefined } : {}),
      };

      updateMutation.mutate(
        { id: selectedUser.id, data },
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
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {isEdit ? text.DIALOG.FORM_EDIT_TITLE : text.DIALOG.FORM_CREATE_TITLE}
          </DialogTitle>
          <DialogDescription>
            {isEdit ? text.DIALOG.FORM_EDIT_DESCRIPTION : text.DIALOG.FORM_CREATE_DESCRIPTION}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
          <Controller
            control={form.control}
            name="fullName"
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel>{text.FORM.FULL_NAME}</FieldLabel>
                <Input placeholder={text.FORM.FULL_NAME_PLACEHOLDER} {...field} className="h-10" />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          <Controller
            control={form.control}
            name="email"
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel>{text.FORM.EMAIL}</FieldLabel>
                <Input placeholder={text.FORM.EMAIL_PLACEHOLDER} type="email" {...field} className="h-10" />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          <Controller
            control={form.control}
            name="phone"
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel>{text.FORM.PHONE}</FieldLabel>
                <Input placeholder={text.FORM.PHONE_PLACEHOLDER} {...field} className="h-10" />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          {!isEdit && (
            <Controller
              control={form.control}
              name={'password' as keyof UserFormValues}
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel>{text.FORM.INITIAL_PASSWORD}</FieldLabel>
                  <PasswordInput placeholder={text.FORM.INITIAL_PASSWORD_PLACEHOLDER} {...field} className="h-10" />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
          )}

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={handleClose} className="h-10">
              {text.DIALOG.CANCEL}
            </Button>
            <Button type="submit" disabled={isPending} className="h-10 min-w-[100px]">
              {isPending && <IconLoader className="mr-2 size-4 animate-spin" />}
              {isEdit ? text.DIALOG.SAVE_CHANGES : text.DIALOG.CREATE_SUBMIT}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function UserDialogs({ state }: { state: IUsersState }) {
  const {
    selectedUser,
    isFormOpen,
    setIsFormOpen,
    isDeleteOpen,
    setIsDeleteOpen,
    isResetPasswordOpen,
    setIsResetPasswordOpen,
    handleConfirmDelete,
    isDeleting,
  } = state;
  const text = TITLE_PAGE.USERS;

  const resetPasswordForm = useForm<IResetUserPasswordInput>({
    resolver: zodResolver(resetUserPasswordSchema),
    defaultValues: { newPassword: '', confirmPassword: '' },
  });
  const resetPasswordMutation = useResetUserPassword();

  React.useEffect(() => {
    if (!isResetPasswordOpen) resetPasswordForm.reset();
  }, [isResetPasswordOpen, resetPasswordForm]);

  const onResetPasswordSubmit = (values: IResetUserPasswordInput) => {
    if (!selectedUser) return;

    resetPasswordMutation.mutate(
      { id: selectedUser.id, data: values },
      {
        onError: (err) => applyApiFormErrors(resetPasswordForm, err, { fallbackMessage: text.ERRORS.RESET_PASSWORD_FAILED }),
        onSuccess: () => {
          setIsResetPasswordOpen(false);
          resetPasswordForm.reset();
        },
      },
    );
  };

  return (
    <>
      <UserFormDialog open={isFormOpen} onOpenChange={setIsFormOpen} state={state} />

      <Dialog open={isResetPasswordOpen} onOpenChange={setIsResetPasswordOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-xl">{text.DIALOG.RESET_PASSWORD_TITLE}</DialogTitle>
            <DialogDescription>
              {text.DIALOG.RESET_PASSWORD_DESCRIPTION_PREFIX} <strong>{selectedUser?.fullName}</strong>.{' '}
              {text.DIALOG.RESET_PASSWORD_DESCRIPTION_SUFFIX}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={resetPasswordForm.handleSubmit(onResetPasswordSubmit)} className="space-y-4 py-2">
            <Controller
              control={resetPasswordForm.control}
              name="newPassword"
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel>{text.FORM.NEW_PASSWORD}</FieldLabel>
                  <PasswordInput placeholder={text.FORM.NEW_PASSWORD_PLACEHOLDER} {...field} className="h-10" />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
            <Controller
              control={resetPasswordForm.control}
              name="confirmPassword"
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel>{text.FORM.CONFIRM_NEW_PASSWORD}</FieldLabel>
                  <PasswordInput placeholder={text.FORM.CONFIRM_NEW_PASSWORD_PLACEHOLDER} {...field} className="h-10" />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setIsResetPasswordOpen(false)} className="h-10">
                {text.DIALOG.CANCEL}
              </Button>
              <Button type="submit" disabled={resetPasswordMutation.isPending} className="h-10 min-w-[100px]">
                {resetPasswordMutation.isPending && <IconLoader className="mr-2 size-4 animate-spin" />}
                {text.DIALOG.UPDATE_SUBMIT}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-xl">{text.DIALOG.DELETE_TITLE}</DialogTitle>
            <DialogDescription>
              {text.DIALOG.DELETE_DESCRIPTION_PREFIX} <strong>{selectedUser?.fullName}</strong>?{' '}
              {text.DIALOG.DELETE_DESCRIPTION_SUFFIX}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={() => setIsDeleteOpen(false)} className="h-10">
              {text.DIALOG.CANCEL}
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="h-10 min-w-[100px]"
            >
              {isDeleting && <IconLoader className="mr-2 size-4 animate-spin" />}
              {text.DIALOG.CONFIRM_DELETE}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default UserDialogs;
