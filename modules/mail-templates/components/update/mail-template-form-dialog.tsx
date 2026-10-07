'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import {
  IconAlertCircle,
  IconDeviceFloppy,
  IconEye,
  IconLoader,
  IconMail,
  IconSend,
} from '@tabler/icons-react';
import { useEffect, useMemo, useState } from 'react';
import { Controller, useForm, type Resolver } from 'react-hook-form';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { ProtectedAction } from '@/components/shared/protected-action';
import { PermissionCode } from '@/utils/consts/rbac.const';
import { usePreviewMailTemplate, useSendTestMailTemplate, useUpdateMailTemplate } from '../../api/mutations';
import { useGetMailLayout, useGetMailLayouts, useGetMailTemplate, useGetMailTemplateCatalog } from '../../api/queries';
import { mailTemplateFormSchema, type MailTemplateFormValues } from '../../schema';
import type { IMailTemplateOut, IRenderedMailTemplateOut } from '../../type';
import { MailBodyEditor } from '../mail-body-editor';
import { MailTemplatePreviewDialog } from '../mail-template-preview-dialog';
import { serializeEmailVariables } from '../mail-variable-node';
import { SendTestMailDialog } from '../send-test-mail-dialog';

export type MailTemplateFormDialogProps = {
  id: string;
  open: boolean;
  readOnly?: boolean;
  onOpenChange: (open: boolean) => void;
};

const toFormValues = (template: IMailTemplateOut): MailTemplateFormValues => ({
  name: template.name,
  subject: template.subject,
  htmlBody: serializeEmailVariables(template.htmlBody),
  description: template.description ?? '',
  layoutId: template.layoutId ?? '',
  isActive: template.isActive,
});

const getFallbackSamplePayload = (variables: string[]) =>
  Object.fromEntries(
    variables.map((variable) => [
      variable,
      variable.toLowerCase().includes('url')
        ? 'https://example.com/sample'
        : variable === 'expiresInMinutes'
          ? 30
          : `Giá trị ${variable}`,
    ]),
  );

const layoutOptionsParams = {
  page: 1,
  perPage: 100,
  sort: 'asc' as const,
  sortBy: 'key' as const,
  isActive: true,
};

export function MailTemplateFormDialog({ id, open, readOnly = false, onOpenChange }: MailTemplateFormDialogProps) {
  const templateQuery = useGetMailTemplate(id);
  const layoutsQuery = useGetMailLayouts(layoutOptionsParams);
  const catalogQuery = useGetMailTemplateCatalog();
  const updateMutation = useUpdateMailTemplate(id);
  const previewMutation = usePreviewMailTemplate(id);
  const sendTestMutation = useSendTestMailTemplate(id);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [sendTestOpen, setSendTestOpen] = useState(false);
  const [selectPortalContainer, setSelectPortalContainer] = useState<HTMLDivElement | null>(null);
  const [renderedPreview, setRenderedPreview] = useState<IRenderedMailTemplateOut | null>(null);
  const formId = `mail-template-form-${id}`;
  const selectedLayoutQuery = useGetMailLayout(templateQuery.data?.layoutId ?? '');

  const form = useForm<MailTemplateFormValues>({
    resolver: zodResolver(mailTemplateFormSchema) as Resolver<MailTemplateFormValues>,
    defaultValues: {
      name: '',
      subject: '',
      htmlBody: '',
      description: '',
      layoutId: '',
      isActive: true,
    },
  });

  const template = templateQuery.data;
  const layoutItems = useMemo(() => layoutsQuery.data?.items ?? [], [layoutsQuery.data?.items]);
  const selectedLayoutId = template?.layoutId ?? '';
  const selectedLayoutMissing = Boolean(
    selectedLayoutId && layoutsQuery.data && !layoutItems.some((layout) => layout.id === selectedLayoutId),
  );
  const layoutOptions = useMemo(() => {
    if (!selectedLayoutMissing || !selectedLayoutQuery.data) return layoutItems;

    return [selectedLayoutQuery.data, ...layoutItems];
  }, [layoutItems, selectedLayoutMissing, selectedLayoutQuery.data]);
  const catalogDefinition = catalogQuery.data?.find((item) => item.key === template?.key);
  const samplePayload = useMemo(
    () => catalogDefinition?.samplePayload ?? getFallbackSamplePayload(template?.variables ?? []),
    [catalogDefinition, template?.variables],
  );
  const isLoading =
    templateQuery.isLoading || layoutsQuery.isLoading || (selectedLayoutMissing && selectedLayoutQuery.isLoading);
  const isError =
    templateQuery.isError ||
    layoutsQuery.isError ||
    (!templateQuery.isLoading && !template) ||
    (selectedLayoutMissing && selectedLayoutQuery.isError);

  useEffect(() => {
    if (open && template) form.reset(toFormValues(template));
  }, [form, open, template]);

  const handleClose = () => {
    form.reset();
    setPreviewOpen(false);
    setSendTestOpen(false);
    onOpenChange(false);
  };

  const onSubmit = (values: MailTemplateFormValues) => {
    if (readOnly) return;

    updateMutation.mutate(
      {
        name: values.name,
        subject: values.subject,
        htmlBody: serializeEmailVariables(values.htmlBody),
        description: values.description.trim() || null,
        layoutId: values.layoutId || null,
        isActive: values.isActive,
      },
      {
        onSuccess: ({ data }) => form.reset(toFormValues(data.data)),
      },
    );
  };

  const getDraftRequest = () => {
    const values = form.getValues();

    return {
      subject: values.subject,
      htmlBody: serializeEmailVariables(values.htmlBody),
      layoutId: values.layoutId || null,
      payload: samplePayload,
    };
  };

  const handlePreview = () => {
    previewMutation.mutate(getDraftRequest(), {
      onSuccess: ({ data }) => {
        setRenderedPreview(data.data);
        setPreviewOpen(true);
      },
    });
  };

  const handleSendTest = (data: { toEmail: string; payload: Record<string, unknown> }) => {
    sendTestMutation.mutate({ ...getDraftRequest(), ...data }, { onSuccess: () => setSendTestOpen(false) });
  };

  return (
    <>
      <Dialog open={open} onOpenChange={(nextOpen) => (nextOpen ? onOpenChange(true) : handleClose())}>
        <DialogContent className="sm:max-w-4xl ring-0">
          <div ref={setSelectPortalContainer} className="pointer-events-none absolute inset-0" />
          <DialogHeader className="shrink-0">
            <DialogTitle className="flex items-center gap-2">
              <IconMail aria-hidden="true" />
              {template?.name ?? (isLoading ? 'Đang tải mẫu email' : 'Mẫu email')}
            </DialogTitle>
            <DialogDescription className="break-all font-mono text-xs">
              {template?.key ??
                (isError ? 'Không thể tải cấu hình mẫu email' : 'Đang lấy cấu hình mới nhất từ backend')}
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
                <AlertTitle>Không tải được mẫu email</AlertTitle>
                <AlertDescription>Kiểm tra quyền truy cập hoặc đóng dialog rồi thử lại.</AlertDescription>
              </Alert>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleClose}>
                  Đóng
                </Button>
              </DialogFooter>
            </>
          ) : template ? (
            <form id={formId} onSubmit={form.handleSubmit(onSubmit)} className="flex min-h-0 flex-1 flex-col">
              <ScrollArea className="h-[calc(80dvh-6rem)]">
                <div className="grid gap-4 p-1">
                  <div className="grid min-w-0 gap-4">
                    <Card className="min-w-0">
                      <CardHeader>
                        <CardTitle>Nội dung mẫu email</CardTitle>
                        <CardDescription>
                          Chỉnh sửa subject, nội dung và trạng thái sử dụng của template.
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="min-w-0">
                        <FieldGroup className="gap-5">
                          <div className="grid lg:grid-cols-2 gap-5">
                            <Controller
                              control={form.control}
                              name="name"
                              render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid} data-disabled={readOnly}>
                                  <FieldLabel htmlFor={field.name}>Tên hiển thị</FieldLabel>
                                  <Input
                                    {...field}
                                    id={field.name}
                                    disabled={readOnly}
                                    aria-invalid={fieldState.invalid}
                                  />
                                  <FieldError errors={[fieldState.error]} />
                                </Field>
                              )}
                            />
                            <Controller
                              control={form.control}
                              name="layoutId"
                              render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid} data-disabled={readOnly}>
                                  <FieldLabel htmlFor={field.name}>Layout bao ngoài</FieldLabel>
                                  <Select
                                    value={field.value || 'none'}
                                    onValueChange={(value) => field.onChange(value === 'none' ? '' : value)}
                                    disabled={readOnly}
                                  >
                                    <SelectTrigger id={field.name} className="w-full" aria-invalid={fieldState.invalid}>
                                      <SelectValue placeholder="Chọn layout" />
                                    </SelectTrigger>
                                    <SelectContent
                                      portalContainer={selectPortalContainer}
                                      className="pointer-events-auto"
                                      position="popper"
                                      align="start"
                                    >
                                      <SelectItem value="none">Không dùng layout</SelectItem>
                                      {layoutOptions.map((layout) => (
                                        <SelectItem key={layout.id} value={layout.id}>
                                          {layout.name} ({layout.key})
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <FieldDescription>
                                    Layout phải chứa placeholder hệ thống {'{{content}}'}.
                                  </FieldDescription>
                                  <FieldError errors={[fieldState.error]} />
                                </Field>
                              )}
                            />
                            <Controller
                              control={form.control}
                              name="description"
                              render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid} data-disabled={readOnly}>
                                  <FieldLabel htmlFor={field.name}>Mô tả</FieldLabel>
                                  <Textarea
                                    {...field}
                                    id={field.name}
                                    disabled={readOnly}
                                    rows={3}
                                    aria-invalid={fieldState.invalid}
                                  />
                                  <FieldError errors={[fieldState.error]} />
                                </Field>
                              )}
                            />

                            <Controller
                              control={form.control}
                              name="subject"
                              render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid} data-disabled={readOnly}>
                                  <FieldLabel htmlFor={field.name}>Subject</FieldLabel>
                                  <Input
                                    {...field}
                                    id={field.name}
                                    disabled={readOnly}
                                    aria-invalid={fieldState.invalid}
                                  />
                                  <FieldDescription>
                                    Được phép dùng các biến đã khai báo ở phần thông tin mẫu.
                                  </FieldDescription>
                                  <FieldError errors={[fieldState.error]} />
                                </Field>
                              )}
                            />
                          </div>

                          <Controller
                            control={form.control}
                            name="htmlBody"
                            render={({ field, fieldState }) => (
                              <Field data-invalid={fieldState.invalid} data-disabled={readOnly}>
                                <FieldLabel id="mail-template-html-body-label" htmlFor="mail-template-html-body-editor">
                                  Nội dung email
                                </FieldLabel>
                                <MailBodyEditor
                                  id="mail-template-html-body-editor"
                                  labelId="mail-template-html-body-label"
                                  value={field.value}
                                  variables={template.variables}
                                  disabled={readOnly}
                                  onChange={field.onChange}
                                />
                                <FieldDescription>
                                  Dùng Soạn thảo cho nội dung đơn giản hoặc HTML source cho email có table/style để giữ
                                  nguyên markup.
                                </FieldDescription>
                                <FieldError errors={[fieldState.error]} />
                              </Field>
                            )}
                          />
                          <Controller
                            control={form.control}
                            name="isActive"
                            render={({ field }) => (
                              <div className="flex items-center justify-between gap-4 rounded-lg border p-4">
                                <div>
                                  <div className="font-medium">Cho phép sử dụng mẫu này</div>
                                  <p className="mt-1 text-sm text-muted-foreground">
                                    Nếu tắt, nghiệp vụ sẽ dùng fallback do backend định nghĩa.
                                  </p>
                                </div>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                  disabled={readOnly}
                                  aria-label="Trạng thái mẫu email"
                                />
                              </div>
                            )}
                          />
                        </FieldGroup>
                      </CardContent>
                    </Card>

                    {/* <Card className="h-fit min-w-0">
                      <CardHeader>
                        <CardTitle>Thông tin mẫu</CardTitle>
                        <CardDescription>Purpose và danh sách biến được backend cấp cho template này.</CardDescription>
                      </CardHeader>
                      <CardContent className="grid gap-5">
                        <div>
                          <div className="text-xs text-muted-foreground">Key nghiệp vụ</div>
                          <div className="mt-1 break-all rounded-md bg-muted/50 px-3 py-2 font-mono text-xs">{template.key}</div>
                          <p className="mt-2 text-sm text-muted-foreground">Key do backend seed và dùng trong nghiệp vụ gửi email.</p>
                        </div>
                        <div>
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div className="font-medium">Biến được phép</div>
                            <Badge variant="outline">{template.variables.length} biến</Badge>
                          </div>
                          <p className="mt-1 text-sm text-muted-foreground">{catalogDefinition?.description ?? 'Danh sách biến được backend gắn với purpose này.'}</p>
                          <div className="mt-3 flex flex-wrap gap-2">
                            {template.variables.map((variable) => {
                              const definition = catalogDefinition?.variables.find((item) => item.key === variable);

                              return (
                                <Badge key={variable} variant="secondary" title={definition?.label ?? variable}>
                                  {'{{'}{variable}{'}}'}
                                </Badge>
                              );
                            })}
                          </div>
                        </div>
                        <div className="rounded-lg border bg-muted/20 p-4 text-sm text-muted-foreground">
                          Preview và gửi thử dùng draft hiện tại cùng payload mẫu do backend cung cấp.
                        </div>
                      </CardContent>
                    </Card> */}
                  </div>
                </div>
              </ScrollArea>

              <DialogFooter className="shrink-0">
                <Button type="button" variant="outline" onClick={handleClose}>
                  Đóng
                </Button>
                <div className="flex flex-wrap gap-2">
                  <ProtectedAction permission={PermissionCode.EmailTemplatesPreview}>
                    <Button
                      type="button"
                      variant="outline"
                      disabled={previewMutation.isPending}
                      onClick={handlePreview}
                    >
                      {previewMutation.isPending ? (
                        <IconLoader className="animate-spin" data-icon="inline-start" />
                      ) : (
                        <IconEye data-icon="inline-start" />
                      )}
                      Xem preview
                    </Button>
                  </ProtectedAction>
                  <ProtectedAction permission={PermissionCode.EmailTemplatesSendTest}>
                    <Button
                      type="button"
                      variant="outline"
                      disabled={sendTestMutation.isPending}
                      onClick={() => setSendTestOpen(true)}
                    >
                      <IconSend data-icon="inline-start" />
                      Gửi email thử
                    </Button>
                  </ProtectedAction>
                  {!readOnly ? (
                    <Button type="submit" disabled={updateMutation.isPending || !form.formState.isDirty}>
                      {updateMutation.isPending ? (
                        <IconLoader className="animate-spin" data-icon="inline-start" />
                      ) : (
                        <IconDeviceFloppy data-icon="inline-start" />
                      )}
                      Lưu thay đổi
                    </Button>
                  ) : null}
                </div>
              </DialogFooter>
            </form>
          ) : null}
        </DialogContent>
      </Dialog>

      <MailTemplatePreviewDialog open={previewOpen} onOpenChange={setPreviewOpen} rendered={renderedPreview} />
      <SendTestMailDialog
        open={sendTestOpen}
        onOpenChange={setSendTestOpen}
        samplePayload={samplePayload}
        isPending={sendTestMutation.isPending}
        onSubmit={handleSendTest}
      />
    </>
  );
}
