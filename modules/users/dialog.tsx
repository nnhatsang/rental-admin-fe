'use client';

import * as React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { IconLoader } from '@tabler/icons-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { applyApiFormErrors } from '@/utils/form-error';
import {
  createUserSchema, updateUserSchema, resetUserPasswordSchema,
  ICreateUserInput, IUpdateUserInput, IResetUserPasswordInput,
} from './schema';
import { useCreateUser } from './hooks/use-create-user';
import { useUpdateUser } from './hooks/use-update-user';
import { useResetUserPassword } from './hooks/use-reset-user-password';
import { IUsersState } from './hooks/use-users-state';

type UserFormValues = ICreateUserInput | IUpdateUserInput;

// ---- User Form Dialog (Create khi selectedUser=null, Edit khi selectedUser có giá trị) ----

function UserFormDialog({ open, onOpenChange, state }: { open: boolean; onOpenChange: (v: boolean) => void; state: IUsersState }) {
  const { selectedUser, setSelectedUser } = state;
  const isEdit = selectedUser !== null;

  const form = useForm<UserFormValues>({
    resolver: zodResolver(isEdit ? updateUserSchema : createUserSchema),
    defaultValues: { email: '', fullName: '', phone: '' },
  });

  const createMutation = useCreateUser();
  const updateMutation = useUpdateUser();
  const isPending = isEdit ? updateMutation.isPending : createMutation.isPending;

  React.useEffect(() => {
    if (!open) return;
    form.reset(
      isEdit && selectedUser
        ? { email: selectedUser.email, fullName: selectedUser.fullName, phone: selectedUser.phone ?? '' }
        : { email: '', fullName: '', phone: '', password: '' },
    );
  }, [open, selectedUser]);

  const handleClose = () => {
    onOpenChange(false);
    setSelectedUser(null);
    form.reset();
  };

  const onSubmit = (values: UserFormValues) => {
    if (isEdit) {
      const v = values as IUpdateUserInput;
      updateMutation.mutate(
        { id: selectedUser.id, data: { email: v.email, fullName: v.fullName, phone: v.phone || undefined } },
        {
          onError: (err) => applyApiFormErrors(form, err, { fallbackMessage: 'Cập nhật người dùng thất bại' }),
          onSuccess: handleClose,
        },
      );
    } else {
      createMutation.mutate(values as ICreateUserInput, {
        onError: (err) => applyApiFormErrors(form, err, { fallbackMessage: 'Tạo người dùng thất bại' }),
        onSuccess: handleClose,
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="text-xl">{isEdit ? 'Chỉnh sửa thông tin' : 'Thêm người dùng mới'}</DialogTitle>
          <DialogDescription>
            {isEdit ? 'Cập nhật thông tin cơ bản cho tài khoản người dùng này.' : 'Nhập thông tin chi tiết để tạo tài khoản nhân viên/admin mới.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
          <Controller control={form.control} name="fullName" render={({ field, fieldState }) => (
            <Field>
              <FieldLabel>Họ và tên</FieldLabel>
              <Input placeholder="Nguyễn Văn A" {...field} className="h-10" />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )} />

          <Controller control={form.control} name="email" render={({ field, fieldState }) => (
            <Field>
              <FieldLabel>Email</FieldLabel>
              <Input placeholder="name@rental.local" type="email" {...field} className="h-10" />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )} />

          <Controller control={form.control} name="phone" render={({ field, fieldState }) => (
            <Field>
              <FieldLabel>Số điện thoại</FieldLabel>
              <Input placeholder="0901234567" {...field} className="h-10" />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )} />

          {!isEdit && (
            <Controller control={form.control} name={'password' as keyof UserFormValues} render={({ field, fieldState }) => (
              <Field>
                <FieldLabel>Mật khẩu ban đầu</FieldLabel>
                <PasswordInput placeholder="Mật khẩu ít nhất 8 ký tự" {...field} className="h-10" />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )} />
          )}

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={handleClose} className="h-10">Hủy</Button>
            <Button type="submit" disabled={isPending} className="h-10 min-w-[100px]">
              {isPending && <IconLoader className="mr-2 size-4 animate-spin" />}
              {isEdit ? 'Lưu thay đổi' : 'Tạo mới'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ---- All Dialogs ----

export function UserDialogs({ state }: { state: IUsersState }) {
  const {
    selectedUser,
    isFormOpen, setIsFormOpen,
    isDeleteOpen, setIsDeleteOpen,
    isResetPasswordOpen, setIsResetPasswordOpen,
    handleConfirmDelete, isDeleting,
  } = state;

  const resetPasswordForm = useForm<IResetUserPasswordInput>({
    resolver: zodResolver(resetUserPasswordSchema),
    defaultValues: { newPassword: '', confirmPassword: '' },
  });
  const resetPasswordMutation = useResetUserPassword();

  React.useEffect(() => {
    if (!isResetPasswordOpen) resetPasswordForm.reset();
  }, [isResetPasswordOpen]);

  const onResetPasswordSubmit = (values: IResetUserPasswordInput) => {
    if (!selectedUser) return;
    resetPasswordMutation.mutate(
      { id: selectedUser.id, data: values },
      {
        onError: (err) => applyApiFormErrors(resetPasswordForm, err, { fallbackMessage: 'Reset mật khẩu thất bại' }),
        onSuccess: () => { setIsResetPasswordOpen(false); resetPasswordForm.reset(); },
      },
    );
  };

  return (
    <>
      <UserFormDialog open={isFormOpen} onOpenChange={setIsFormOpen} state={state} />

      <Dialog open={isResetPasswordOpen} onOpenChange={setIsResetPasswordOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-xl">Đặt lại mật khẩu</DialogTitle>
            <DialogDescription>
              Nhập mật khẩu mới cho tài khoản <strong>{selectedUser?.fullName}</strong>. Phiên đăng nhập hiện tại sẽ bị hủy.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={resetPasswordForm.handleSubmit(onResetPasswordSubmit)} className="space-y-4 py-2">
            <Controller control={resetPasswordForm.control} name="newPassword" render={({ field, fieldState }) => (
              <Field>
                <FieldLabel>Mật khẩu mới</FieldLabel>
                <PasswordInput placeholder="Ít nhất 8 ký tự" {...field} className="h-10" />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )} />
            <Controller control={resetPasswordForm.control} name="confirmPassword" render={({ field, fieldState }) => (
              <Field>
                <FieldLabel>Xác nhận mật khẩu mới</FieldLabel>
                <PasswordInput placeholder="Nhập lại mật khẩu mới" {...field} className="h-10" />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )} />
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setIsResetPasswordOpen(false)} className="h-10">Hủy</Button>
              <Button type="submit" disabled={resetPasswordMutation.isPending} className="h-10 min-w-[100px]">
                {resetPasswordMutation.isPending && <IconLoader className="mr-2 size-4 animate-spin" />}
                Cập nhật
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-xl">Xác nhận xóa tài khoản</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa tài khoản <strong>{selectedUser?.fullName}</strong>? Hành động này không thể khôi phục.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={() => setIsDeleteOpen(false)} className="h-10">Hủy</Button>
            <Button type="button" variant="destructive" onClick={handleConfirmDelete} disabled={isDeleting} className="h-10 min-w-[100px]">
              {isDeleting && <IconLoader className="mr-2 size-4 animate-spin" />}
              Xác nhận xóa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default UserDialogs;
