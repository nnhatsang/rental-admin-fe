'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { IconAlertCircle, IconAlertTriangle, IconDeviceFloppy, IconLoader, IconShieldLock } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { Controller, useForm, type Resolver } from 'react-hook-form';

import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Field, FieldDescription, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';

import { useCreateMailLayout, useUpdateMailLayout } from '../../api/mutations';
import { useGetMailLayout } from '../../api/queries';
import { mailLayoutFormSchema, type MailLayoutFormValues } from '../../layout-schema';

export type MailLayoutFormDialogProps = {
  id?: string;
  open: boolean;
  readOnly?: boolean;
  onOpenChange: (open: boolean) => void;
};

const defaultValues: MailLayoutFormValues = {
  key: '',
  name: '',
  htmlLayout: '<!doctype html>\n<html>\n  <body>\n    {{content}}\n  </body>\n</html>',
  isActive: true,
};

export function MailLayoutFormDialog({ id, open, readOnly = false, onOpenChange }: MailLayoutFormDialogProps) {
  const isEdit = Boolean(id);

  const layoutQuery = useGetMailLayout(id ?? '');
  const createMutation = useCreateMailLayout();
  const updateMutation = useUpdateMailLayout(id ?? '');

  const mutation = isEdit ? updateMutation : createMutation;

  const isLoading = isEdit && layoutQuery.isLoading;
  const isError = isEdit && (layoutQuery.isError || !layoutQuery.data);
  const usedByCount = layoutQuery.data?.usedByCount ?? 0;

  const formId = `mail-layout-form-${id ?? 'new'}`;

  const [disableConfirmOpen, setDisableConfirmOpen] = useState(false);
  const [pendingValues, setPendingValues] = useState<MailLayoutFormValues | null>(null);

  const form = useForm<MailLayoutFormValues>({
    resolver: zodResolver(mailLayoutFormSchema) as Resolver<MailLayoutFormValues>,
    defaultValues,
  });

  useEffect(() => {
    if (!open) return;

    if (!isEdit) {
      form.reset(defaultValues);
      return;
    }

    if (layoutQuery.data) {
      form.reset({
        key: layoutQuery.data.key,
        name: layoutQuery.data.name,
        htmlLayout: layoutQuery.data.htmlLayout,
        isActive: layoutQuery.data.isActive,
      });
    }
  }, [form, isEdit, layoutQuery.data, open]);

  const handleClose = () => {
    form.reset(defaultValues);
    setDisableConfirmOpen(false);
    setPendingValues(null);
    onOpenChange(false);
  };

  const saveValues = (values: MailLayoutFormValues) => {
    if (isEdit) {
      updateMutation.mutate(values, {
        onSuccess: ({ data }) => {
          form.reset({
            key: data.data.key,
            name: data.data.name,
            htmlLayout: data.data.htmlLayout,
            isActive: data.data.isActive,
          });
        },
      });

      return;
    }

    createMutation.mutate(values, {
      onSuccess: handleClose,
    });
  };

  const onSubmit = (values: MailLayoutFormValues) => {
    if (readOnly) return;

    if (isEdit && layoutQuery.data?.isActive && !values.isActive && usedByCount > 0) {
      setPendingValues(values);
      setDisableConfirmOpen(true);
      return;
    }

    saveValues(values);
  };

  const renderForm = !isLoading && !isError;

  return (
    <>
      <Dialog open={open} onOpenChange={(nextOpen) => (nextOpen ? onOpenChange(true) : handleClose())}>
        <DialogContent className="sm:max-w-4xl ring-0">
          <DialogHeader>
            <DialogTitle>{isEdit ? 'Chỉnh sửa layout email' : 'Tạo layout email'}</DialogTitle>

            <DialogDescription>
              {'Layout là mã HTML dùng chung và bắt buộc phải chứa placeholder {{content}}.'}
            </DialogDescription>
          </DialogHeader>

          {isLoading ? (
            <>
              <div className="grid gap-4 py-2">
                <Skeleton className="h-10 w-full rounded-lg" />
                <Skeleton className="h-80 w-full rounded-lg" />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleClose}>
                  Đóng
                </Button>
              </DialogFooter>
            </>
          ) : isError ? (
            <>
              <Alert variant="destructive">
                <IconAlertCircle aria-hidden="true" />

                <AlertTitle>Không thể tải layout email</AlertTitle>

                <AlertDescription>Vui lòng kiểm tra quyền truy cập hoặc đóng hộp thoại và thử lại.</AlertDescription>
              </Alert>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleClose}>
                  Đóng
                </Button>
              </DialogFooter>
            </>
          ) : renderForm ? (
            <form id={formId} onSubmit={form.handleSubmit(onSubmit)} className="min-h-0">
              <ScrollArea className="h-[calc(60dvh-105px)] min-h-0">
                <div className="grid gap-4 py-2">
                  {readOnly ? (
                    <Alert className="bg-muted/20">
                      <IconShieldLock aria-hidden="true" />

                      <AlertTitle>Chế độ chỉ xem</AlertTitle>

                      <AlertDescription>Bạn cần quyền email_templates.update để chỉnh sửa layout.</AlertDescription>
                    </Alert>
                  ) : null}

                  {isEdit && usedByCount > 0 ? (
                    <Alert className="bg-amber-50/60 dark:bg-amber-950/20">
                      <IconAlertTriangle aria-hidden="true" />

                      <AlertTitle>Layout đang được sử dụng</AlertTitle>

                      <AlertDescription>
                        {`Có ${usedByCount} mẫu email đang sử dụng layout này. Mọi thay đổi đối với HTML sẽ được áp dụng cho tất cả các mẫu đó.`}
                      </AlertDescription>
                    </Alert>
                  ) : null}

                  <div className="grid gap-4 rounded-md border p-3 sm:grid-cols-2">
                    <Controller
                      control={form.control}
                      name="key"
                      render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid} data-disabled={readOnly}>
                          <FieldLabel htmlFor={field.name}>Mã layout</FieldLabel>

                          <Input
                            {...field}
                            id={field.name}
                            disabled={readOnly}
                            className="font-mono text-xs"
                            aria-invalid={fieldState.invalid}
                          />

                          <FieldDescription>
                            Chỉ sử dụng chữ thường, chữ số, dấu chấm, dấu gạch ngang hoặc dấu gạch dưới.
                          </FieldDescription>

                          <FieldError errors={[fieldState.error]} />
                        </Field>
                      )}
                    />

                    <Controller
                      control={form.control}
                      name="name"
                      render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid} data-disabled={readOnly}>
                          <FieldLabel htmlFor={field.name}>Tên hiển thị</FieldLabel>

                          <Input {...field} id={field.name} disabled={readOnly} aria-invalid={fieldState.invalid} />

                          <FieldError errors={[fieldState.error]} />
                        </Field>
                      )}
                    />
                  </div>

                  <Controller
                    control={form.control}
                    name="htmlLayout"
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid} data-disabled={readOnly}>
                        <FieldLabel htmlFor={field.name}>Mã nguồn HTML của layout</FieldLabel>

                        <Textarea
                          {...field}
                          id={field.name}
                          disabled={readOnly}
                          rows={24}
                          className="resize-y font-mono text-xs leading-5"
                          spellCheck={false}
                          aria-invalid={fieldState.invalid}
                        />

                        <FieldDescription>
                          Bắt buộc phải có {'{{content}}'} để hệ thống chèn nội dung email đã được render.
                        </FieldDescription>

                        <FieldError errors={[fieldState.error]} />
                      </Field>
                    )}
                  />

                  <Controller
                    control={form.control}
                    name="isActive"
                    render={({ field }) => (
                      <Field orientation="horizontal" className="justify-between rounded-md border p-3">
                        <div>
                          <FieldLabel htmlFor={field.name}>Bật layout</FieldLabel>

                          <p className="text-sm text-muted-foreground">
                            Khi tắt layout, mẫu email sẽ hiển thị nội dung trực tiếp mà không sử dụng layout.
                          </p>
                        </div>

                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={readOnly}
                          aria-label="Trạng thái layout"
                        />
                      </Field>
                    )}
                  />
                </div>
              </ScrollArea>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleClose}>
                  Đóng
                </Button>

                {!readOnly ? (
                  <Button type="submit" disabled={mutation.isPending || !form.formState.isDirty}>
                    {mutation.isPending ? (
                      <IconLoader className="animate-spin" data-icon="inline-start" />
                    ) : (
                      <IconDeviceFloppy data-icon="inline-start" />
                    )}

                    {isEdit ? 'Lưu thay đổi' : 'Tạo layout'}
                  </Button>
                ) : null}
              </DialogFooter>
            </form>
          ) : null}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={disableConfirmOpen}
        onOpenChange={(open) => {
          if (!open && !mutation.isPending) {
            setDisableConfirmOpen(false);
            setPendingValues(null);
          }
        }}
        title="Tắt layout đang được sử dụng?"
        desc={`Có ${usedByCount} mẫu email đang sử dụng layout này. Sau khi tắt, các mẫu này sẽ hiển thị nội dung trực tiếp mà không sử dụng layout.`}
        cancelBtnText="Quay lại"
        confirmText="Tắt layout"
        destructive
        isLoading={mutation.isPending}
        handleConfirm={() => {
          if (!pendingValues) return;

          setDisableConfirmOpen(false);
          setPendingValues(null);
          saveValues(pendingValues);
        }}
      />
    </>
  );
}
