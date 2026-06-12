'use client';

import { useResetPassword } from '@/hooks/auth/useResetPassword.hook';
import { IconArrowLeft, IconLoader } from '@tabler/icons-react';
import Link from 'next/link';
import { Controller } from 'react-hook-form';
import { Button } from '../ui/button';
import { Field, FieldError, FieldLabel } from '../ui/field';
import { PasswordInput } from '../ui/password-input';
import { useSearchParams } from 'next/navigation';

const ResetPassword: React.FC = () => {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const { form, onSubmit, isPending } = useResetPassword(token as string);
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = form;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Đặt lại mật khẩu</h1>
        <p className="text-muted-foreground">Tạo mật khẩu mới cho tài khoản quản trị của bạn.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Controller
          control={control}
          name="newPassword"
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel>Mật khẩu mới</FieldLabel>
              <PasswordInput placeholder="Mật khẩu mới" {...field} />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          control={control}
          name="confirmPassword"
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel>Xác nhận mật khẩu mới</FieldLabel>
              <PasswordInput placeholder="Xác nhận mật khẩu mới" {...field} />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        {errors.root && <FieldError errors={[errors.root]} />}

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending && <IconLoader className="mr-2 size-4 animate-spin" />}
          Đặt lại mật khẩu
        </Button>

        <Button variant="link" className="px-0" asChild>
          <Link href="/auth/login">
            <IconArrowLeft className="mr-1 size-4" />
            Quay lại đăng nhập
          </Link>
        </Button>
      </form>
    </div>
  );
};

export default ResetPassword;
