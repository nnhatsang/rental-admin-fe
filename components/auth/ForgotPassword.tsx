'use client';

import { useForgotPassword } from '@/hooks/auth/useForgotPassword.hook';
import { SITE_TITLE } from '@/utils/consts/token.const';
import { IconArrowLeft, IconLoader } from '@tabler/icons-react';
import Link from 'next/link';
import { Controller } from 'react-hook-form';
import { Button } from '../ui/button';
import { Field, FieldError, FieldLabel } from '../ui/field';
import { Input } from '../ui/input';

const ForgotPassword: React.FC = () => {
  const { form, onSubmit, isPending, isSuccess } = useForgotPassword();
  const {
    control,
    handleSubmit,
  } = form;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Quên mật khẩu</h1>
        <p className="text-muted-foreground">
          Nhập email quản trị của bạn để nhận hướng dẫn đặt lại mật khẩu cho {SITE_TITLE}.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Controller
          control={control}
          name="email"
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel>Email</FieldLabel>
              <Input placeholder="admin@rental.local" {...field} type="email" className="h-11" />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        {isSuccess && (
          <p className="text-sm text-muted-foreground">
            Nếu email tồn tại trong hệ thống, hướng dẫn đặt lại mật khẩu sẽ được gửi đến hộp thư của bạn.
          </p>
        )}

        <Button type="submit" className="w-full h-11" disabled={isPending}>
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

export default ForgotPassword;
