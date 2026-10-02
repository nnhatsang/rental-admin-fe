'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { IconAlertCircle, IconDeviceFloppy, IconLoader, IconShieldLock } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/modules/auth/store';
import { applyApiFormErrors } from '@/utils/form-error';
import { useUpdateAccountProfile } from '../hooks/use-account-mutations';
import { accountProfileSchema, type AccountProfileFormValues } from '../schema';
import { AccountAvatarUpload } from './account-avatar-upload';
import { ChangePasswordDialog } from './change-password-dialog';

export function AccountPage() {
  const user = useAuthStore((state) => state.user);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const profileMutation = useUpdateAccountProfile();
  const profileForm = useForm<AccountProfileFormValues>({
    resolver: zodResolver(accountProfileSchema),
    defaultValues: { fullName: '', phone: '' },
  });

  useEffect(() => {
    if (!user) return;

    profileForm.reset({ fullName: user.fullName, phone: user.phone ?? '' });
  }, [profileForm, user]);

  if (!user) return null;

  const submitProfile = (values: AccountProfileFormValues) => {
    profileMutation.mutate(
      {
        fullName: values.fullName.trim(),
        phone: values.phone.trim() || undefined,
      },
      {
        onSuccess: () => profileForm.reset(values),
        onError: (error) =>
          applyApiFormErrors(profileForm, error, {
            fallbackMessage: 'Không thể cập nhật thông tin tài khoản.',
          }),
      },
    );
  };

  return (
    <main className="@container/main flex min-w-0 flex-col gap-5">
      <Card className="flex min-w-0 flex-col gap-2">
        <CardHeader>
          <div className="grid min-w-0 max-w-full auto-rows-min gap-1.5">
            <CardTitle className="text-xl leading-none">Tài khoản cá nhân</CardTitle>
            <CardDescription className="max-w-2xl leading-snug">
              Cập nhật thông tin hiển thị và bảo mật tài khoản quản trị của bạn.
            </CardDescription>
          </div>
        </CardHeader>

        <form onSubmit={profileForm.handleSubmit(submitProfile)} className="p-4 pt-0 sm:p-6 max-w-4xl mx-auto">
          <CardContent className="grid gap-6">
            <div className="grid gap-6 lg:grid-cols-[13rem_minmax(0,1fr)]">
              <div className="grid gap-6">
                <AccountAvatarUpload name={user.fullName} currentAvatar={user.avatar} />
                <div className="flex justify-center">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setPasswordDialogOpen(true)}
                  >
                    <IconShieldLock data-icon="inline-start" />
                    Đổi mật khẩu
                  </Button>
                </div>
              </div>

              <FieldGroup>
                <Controller
                  control={profileForm.control}
                  name="fullName"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={field.name}>Họ và tên</FieldLabel>
                      <Input {...field} id={field.name} aria-invalid={fieldState.invalid} placeholder="Nguyễn Văn A" />
                      <FieldError errors={[fieldState.error]} />
                    </Field>
                  )}
                />
                <Controller
                  control={profileForm.control}
                  name="phone"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={field.name}>Số điện thoại</FieldLabel>
                      <Input
                        {...field}
                        id={field.name}
                        type="tel"
                        aria-invalid={fieldState.invalid}
                        placeholder="0901234567"
                      />
                      <FieldError errors={[fieldState.error]} />
                    </Field>
                  )}
                />
                <Field data-disabled>
                  <FieldLabel htmlFor="account-email">Email đăng nhập</FieldLabel>
                  <Input id="account-email" value={user.email} disabled />
                  <FieldDescription>Email được dùng để đăng nhập và khôi phục mật khẩu.</FieldDescription>
                </Field>
              </FieldGroup>
            </div>

            <Alert className="border-amber-500/30 bg-amber-500/5">
              <IconAlertCircle aria-hidden="true" className="text-amber-600" />
              <AlertTitle>Ảnh đại diện</AlertTitle>
              <AlertDescription>
                Bạn có thể chọn ảnh để xem trước. API upload ảnh chưa được kết nối nên ảnh sẽ chưa được lưu lên hệ
                thống.
              </AlertDescription>
            </Alert>

            {profileMutation.isError ? (
              <Alert variant="destructive">
                <IconAlertCircle aria-hidden="true" />
                <AlertDescription>Thao tác chưa hoàn tất. Kiểm tra lại thông tin và thử lại.</AlertDescription>
              </Alert>
            ) : null}
          </CardContent>

          <div className="flex justify-end border-t border-accent/50 pt-4">
            <Button
              type="submit"
              className="w-full sm:w-auto"
              disabled={profileMutation.isPending || !profileForm.formState.isDirty}
            >
              {profileMutation.isPending ? (
                <IconLoader className="animate-spin" data-icon="inline-start" />
              ) : (
                <IconDeviceFloppy data-icon="inline-start" />
              )}
              Lưu thông tin
            </Button>
          </div>
        </form>
      </Card>

      <ChangePasswordDialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen} />
    </main>
  );
}
