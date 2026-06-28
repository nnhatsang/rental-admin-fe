'use client';

import * as React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { IconLoader } from '@tabler/icons-react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Checkbox } from '@/components/ui/checkbox';
import { useGetRoles } from '@/modules/roles/hooks/use-get-roles';
import { applyApiFormErrors } from '@/utils/form-error';

import {
  createUserSchema,
  updateUserSchema,
  resetUserPasswordSchema,
  ICreateUserInput,
  IUpdateUserInput,
  IResetUserPasswordInput,
} from './schema';
import { useCreateUser } from './hooks/use-create-user';
import { useUpdateUser } from './hooks/use-update-user';
import { useResetUserPassword } from './hooks/use-reset-user-password';
import { IUsersState } from './hooks/use-users-state';

interface UserDialogsProps {
  state: IUsersState;
}

export function UserDialogs({ state }: UserDialogsProps) {
  const {
    selectedUser,
    isCreateOpen,
    isEditOpen,
    isDeleteOpen,
    isResetPasswordOpen,
    setIsCreateOpen,
    setIsEditOpen,
    setIsDeleteOpen,
    setIsResetPasswordOpen,
    handleConfirmDelete,
    isDeleting,
  } = state;

  const { data: rolesData } = useGetRoles();
  const roles = rolesData?.data?.items ?? [];

  // 1. Create Form Setup
  const createForm = useForm<ICreateUserInput>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      email: '',
      fullName: '',
      phone: '',
      password: '',
      roleCodes: [],
    },
  });

  const createUserMutation = useCreateUser();

  const onCreateSubmit = (values: ICreateUserInput) => {
    createUserMutation.mutate(values, {
      onError: (err) => {
        applyApiFormErrors(createForm, err, {
          fallbackMessage: 'Tạo người dùng thất bại',
        });
      },
      onSuccess: () => {
        setIsCreateOpen(false);
        createForm.reset();
      },
    });
  };

  // Reset Create Form on close/open
  React.useEffect(() => {
    if (!isCreateOpen) {
      createForm.reset({
        email: '',
        fullName: '',
        phone: '',
        password: '',
        roleCodes: [],
      });
    }
  }, [isCreateOpen]);

  // 2. Edit Form Setup
  const editForm = useForm<IUpdateUserInput>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: {
      email: '',
      fullName: '',
      phone: '',
    },
  });

  const updateUserMutation = useUpdateUser();

  const onEditSubmit = (values: IUpdateUserInput) => {
    if (!selectedUser) return;
    updateUserMutation.mutate(
      {
        id: selectedUser.id,
        data: {
          email: values.email,
          fullName: values.fullName,
          phone: values.phone || undefined,
        },
      },
      {
        onError: (err) => {
          applyApiFormErrors(editForm, err, {
            fallbackMessage: 'Cập nhật người dùng thất bại',
          });
        },
        onSuccess: () => {
          setIsEditOpen(false);
          editForm.reset();
        },
      },
    );
  };

  // Populate Edit Form when user is selected
  React.useEffect(() => {
    if (isEditOpen && selectedUser) {
      editForm.reset({
        email: selectedUser.email,
        fullName: selectedUser.fullName,
        phone: selectedUser.phone ?? '',
      });
    }
  }, [isEditOpen, selectedUser]);

  // 3. Reset Password Form Setup
  const resetPasswordForm = useForm<IResetUserPasswordInput>({
    resolver: zodResolver(resetUserPasswordSchema),
    defaultValues: {
      newPassword: '',
      confirmPassword: '',
    },
  });

  const resetPasswordMutation = useResetUserPassword();

  const onResetPasswordSubmit = (values: IResetUserPasswordInput) => {
    if (!selectedUser) return;
    resetPasswordMutation.mutate(
      {
        id: selectedUser.id,
        data: {
          newPassword: values.newPassword,
          confirmPassword: values.confirmPassword,
        },
      },
      {
        onError: (err) => {
          applyApiFormErrors(resetPasswordForm, err, {
            fallbackMessage: 'Reset mật khẩu thất bại',
          });
        },
        onSuccess: () => {
          setIsResetPasswordOpen(false);
          resetPasswordForm.reset();
        },
      },
    );
  };

  React.useEffect(() => {
    if (!isResetPasswordOpen) {
      resetPasswordForm.reset({
        newPassword: '',
        confirmPassword: '',
      });
    }
  }, [isResetPasswordOpen]);

  return (
    <>
      {/* DIALOG THÊM MỚI */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle className="text-xl">Thêm người dùng mới</DialogTitle>
            <DialogDescription>Nhập thông tin chi tiết để tạo tài khoản nhân viên/admin mới.</DialogDescription>
          </DialogHeader>

          <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-4 py-2">
            <Controller
              control={createForm.control}
              name="fullName"
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel>Họ và tên</FieldLabel>
                  <Input placeholder="Nguyễn Văn A" {...field} className="h-10" />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <Controller
              control={createForm.control}
              name="email"
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel>Email</FieldLabel>
                  <Input placeholder="name@rental.local" {...field} type="email" className="h-10" />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <Controller
              control={createForm.control}
              name="phone"
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel>Số điện thoại</FieldLabel>
                  <Input placeholder="0901234567" {...field} className="h-10" />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <Controller
              control={createForm.control}
              name="password"
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel>Mật khẩu ban đầu</FieldLabel>
                  <PasswordInput placeholder="Mật khẩu ít nhất 8 ký tự" {...field} className="h-10" />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            {/* Chọn vai trò */}
            <div className="space-y-2">
              <FieldLabel>Vai trò gán</FieldLabel>
              <Controller
                control={createForm.control}
                name="roleCodes"
                render={({ field }) => (
                  <div className="grid grid-cols-2 gap-3 bg-muted/30 p-3 rounded-2xl border border-border/30">
                    {roles.map((role) => {
                      const isChecked = field.value?.includes(role.code);
                      return (
                        <label
                          key={role.id}
                          className="flex items-center space-x-2.5 text-sm font-medium text-foreground cursor-pointer select-none"
                        >
                          <Checkbox
                            checked={isChecked}
                            onCheckedChange={(checked) => {
                              const newValue = checked
                                ? [...(field.value || []), role.code]
                                : (field.value || []).filter((c) => c !== role.code);
                              field.onChange(newValue);
                            }}
                          />
                          <span>{role.name}</span>
                        </label>
                      );
                    })}
                  </div>
                )}
              />
            </div>

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)} className="h-10">
                Hủy
              </Button>
              <Button type="submit" disabled={createUserMutation.isPending} className="h-10 min-w-[100px]">
                {createUserMutation.isPending && <IconLoader className="mr-2 size-4 animate-spin" />}
                Tạo mới
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* DIALOG CHỈNH SỬA */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle className="text-xl">Chỉnh sửa thông tin</DialogTitle>
            <DialogDescription>Cập nhật thông tin cơ bản cho tài khoản người dùng này.</DialogDescription>
          </DialogHeader>

          <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4 py-2">
            <Controller
              control={editForm.control}
              name="fullName"
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel>Họ và tên</FieldLabel>
                  <Input placeholder="Nguyễn Văn A" {...field} className="h-10" />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <Controller
              control={editForm.control}
              name="email"
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel>Email</FieldLabel>
                  <Input placeholder="name@rental.local" {...field} type="email" className="h-10" />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <Controller
              control={editForm.control}
              name="phone"
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel>Số điện thoại</FieldLabel>
                  <Input placeholder="0901234567" {...field} className="h-10" />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)} className="h-10">
                Hủy
              </Button>
              <Button type="submit" disabled={updateUserMutation.isPending} className="h-10 min-w-[100px]">
                {updateUserMutation.isPending && <IconLoader className="mr-2 size-4 animate-spin" />}
                Lưu thay đổi
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* DIALOG RESET MẬT KHẨU */}
      <Dialog open={isResetPasswordOpen} onOpenChange={setIsResetPasswordOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-xl">Đặt lại mật khẩu</DialogTitle>
            <DialogDescription>
              Nhập mật khẩu mới cho tài khoản <strong>{selectedUser?.fullName}</strong>. Phiên đăng nhập hiện tại của người dùng sẽ bị hủy.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={resetPasswordForm.handleSubmit(onResetPasswordSubmit)} className="space-y-4 py-2">
            <Controller
              control={resetPasswordForm.control}
              name="newPassword"
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel>Mật khẩu mới</FieldLabel>
                  <PasswordInput placeholder="Ít nhất 8 ký tự" {...field} className="h-10" />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <Controller
              control={resetPasswordForm.control}
              name="confirmPassword"
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel>Xác nhận mật khẩu mới</FieldLabel>
                  <PasswordInput placeholder="Nhập lại mật khẩu mới" {...field} className="h-10" />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setIsResetPasswordOpen(false)} className="h-10">
                Hủy
              </Button>
              <Button type="submit" disabled={resetPasswordMutation.isPending} className="h-10 min-w-[100px]">
                {resetPasswordMutation.isPending && <IconLoader className="mr-2 size-4 animate-spin" />}
                Cập nhật
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* DIALOG XÁC NHẬN XÓA */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-xl">Xác nhận xóa tài khoản</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa tài khoản <strong>{selectedUser?.fullName}</strong>? Hành động này sẽ khóa tài khoản vĩnh viễn và không thể khôi phục.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={() => setIsDeleteOpen(false)} className="h-10">
              Hủy
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="h-10 min-w-[100px]"
            >
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
