'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { IconLoader, IconSend } from '@tabler/icons-react';
import { useEffect } from 'react';
import { Controller, useForm, type Resolver } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Field, FieldDescription, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import type { ISendTestMailTemplateReq } from '../type';

const sendTestMailSchema = z.object({
  toEmail: z.string().trim().email('Vui lòng nhập email hợp lệ.'),
});

type SendTestMailValues = z.infer<typeof sendTestMailSchema>;

type SendTestMailDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  samplePayload: Record<string, unknown>;
  isPending: boolean;
  onSubmit: (data: ISendTestMailTemplateReq) => void;
};

export function SendTestMailDialog({ open, onOpenChange, samplePayload, isPending, onSubmit }: SendTestMailDialogProps) {
  const form = useForm<SendTestMailValues>({
    resolver: zodResolver(sendTestMailSchema) as Resolver<SendTestMailValues>,
    defaultValues: { toEmail: '' },
  });

  useEffect(() => {
    if (!open) form.reset({ toEmail: '' });
  }, [form, open]);

  const handleSubmit = (values: SendTestMailValues) => {
    onSubmit({ toEmail: values.toEmail, payload: samplePayload });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Gửi email thử</DialogTitle>
          <DialogDescription>
            Email dùng bản draft hiện tại và payload mẫu. Chỉ gửi tới địa chỉ bạn nhập để kiểm tra giao diện.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="grid gap-4">
          <Controller
            control={form.control}
            name="toEmail"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Địa chỉ nhận</FieldLabel>
                <Input {...field} id={field.name} type="email" placeholder="you@example.com" aria-invalid={fieldState.invalid} />
                <FieldDescription>Backend sẽ đưa email vào queue và trả về jobId.</FieldDescription>
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Hủy
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? <IconLoader className="animate-spin" data-icon="inline-start" /> : <IconSend data-icon="inline-start" />}
              Gửi thử
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
