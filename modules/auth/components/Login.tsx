'use client';

import { Button } from '@/components/ui/button';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { IconLoader } from '@tabler/icons-react';
import Link from 'next/link';
import { Controller } from 'react-hook-form';
import { useLogin } from '../hooks/useLogin.hook';
import { TITLE_PAGE } from '@/utils/consts/title-page.const';

const Login: React.FC = () => {
  const { form, onSubmit, isPending } = useLogin();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = form;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Đăng nhập</h1>
        <p className="text-muted-foreground">
          Chào mừng đến với {TITLE_PAGE.SITE_TITLE}. Đăng nhập để xác minh danh tính của bạn.
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

        <Controller
          control={control}
          name="password"
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel>Mật khẩu</FieldLabel>
              <PasswordInput placeholder="Mật khẩu" {...field} className="h-11" />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        {errors.root && <FieldError errors={[errors.root]} />}

        <div className="flex items-center justify-between">
          <Button variant="link" className="px-0 text-primary" asChild>
            <Link href="/auth/forgot-password">Quên mật khẩu?</Link>
          </Button>
        </div>

        <Button type="submit" className="w-full h-11" disabled={isPending}>
          {isPending && <IconLoader className="mr-2 size-4 animate-spin" />}
          Đăng nhập
        </Button>
      </form>
    </div>
  );
};

export default Login;
