'use client';

import { useForgotPassword } from '../hooks/useForgotPassword.hook';
import { IconArrowLeft, IconLoader } from '@tabler/icons-react';
import Link from 'next/link';
import { Controller } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { TITLE_PAGE } from '@/utils/consts/title-page.const';

const ForgotPassword: React.FC = () => {
  const { form, onSubmit, isPending, isSuccess } = useForgotPassword();
  const { control, handleSubmit } = form;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Quên mật khẩu</h1>
        <p className="text-muted-foreground">
          Nhập email quản trị của bạn để nhận hướng dẫn đặt lại mật khẩu cho {TITLE_PAGE.SITE_TITLE}.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Controller
          control={control}
          name="email"
          render={({ field, fieldState }) => (
             <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Email</FieldLabel>
              <Input
                {...field}
                id={field.name}
                aria-invalid={fieldState.invalid}
                placeholder="admin@rental.local"
                type="email"
                className="h-11"
              />
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
