'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { IconAlertCircle, IconLoader, IconShieldLock } from '@tabler/icons-react';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { PasswordInput } from '@/components/ui/password-input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { applyApiFormErrors } from '@/utils/form-error';
import { useChangeAccountPassword } from '../hooks/use-account-mutations';
import { accountPasswordSchema, type AccountPasswordFormValues } from '../schema';

type ChangePasswordDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ChangePasswordDialog({ open, onOpenChange }: ChangePasswordDialogProps) {
  const mutation = useChangeAccountPassword();
  const form = useForm<AccountPasswordFormValues>({
    resolver: zodResolver(accountPasswordSchema),
    defaultValues: { oldPassword: '', newPassword: '', confirmPassword: '' },
  });

  useEffect(() => {
    if (!open) form.reset();
  }, [form, open]);

  const handleClose = () => {
    form.reset();
    onOpenChange(false);
  };

  const onSubmit = (values: AccountPasswordFormValues) => {
    mutation.mutate(
      { oldPassword: values.oldPassword, newPassword: values.newPassword },
      {
        onSuccess: handleClose,
        onError: (error) =>
          applyApiFormErrors(form, error, {
            fallbackMessage: 'Không thể đổi mật khẩu.',
          }),
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => (nextOpen ? onOpenChange(true) : handleClose())}>
      <DialogContent className=" sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Đổi mật khẩu</DialogTitle>
          <DialogDescription>
            Nhập mật khẩu hiện tại và mật khẩu mới. Các phiên đăng nhập khác sẽ bị thu hồi sau khi đổi thành công.
          </DialogDescription>
        </DialogHeader>

        <form id="account-password-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FieldGroup>
            <Controller
              control={form.control}
              name="oldPassword"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Mật khẩu hiện tại</FieldLabel>
                  <PasswordInput
                    {...field}
                    id={field.name}
                    aria-invalid={fieldState.invalid}
                    autoComplete="current-password"
                  />
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />
            <Controller
              control={form.control}
              name="newPassword"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Mật khẩu mới</FieldLabel>
                  <PasswordInput
                    {...field}
                    id={field.name}
                    aria-invalid={fieldState.invalid}
                    autoComplete="new-password"
                  />
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />
            <Controller
              control={form.control}
              name="confirmPassword"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Xác nhận mật khẩu mới</FieldLabel>
                  <PasswordInput
                    {...field}
                    id={field.name}
                    aria-invalid={fieldState.invalid}
                    autoComplete="new-password"
                  />
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />
          </FieldGroup>

          {mutation.isError ? (
            <Alert variant="destructive" className="mt-4">
              <IconAlertCircle aria-hidden="true" />
              <AlertDescription>Không thể đổi mật khẩu. Kiểm tra lại thông tin và thử lại.</AlertDescription>
            </Alert>
          ) : null}
        </form>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleClose}>
            Hủy
          </Button>
          <Button type="submit" form="account-password-form" disabled={mutation.isPending}>
            {mutation.isPending ? (
              <IconLoader className="animate-spin" data-icon="inline-start" />
            ) : (
              <IconShieldLock data-icon="inline-start" />
            )}
            Đổi mật khẩu
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
