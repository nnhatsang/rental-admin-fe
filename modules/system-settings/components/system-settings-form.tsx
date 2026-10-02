'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { IconDeviceFloppy, IconLoader, IconSettings } from '@tabler/icons-react';
import { Controller, useForm, type Resolver } from 'react-hook-form';
import { useEffect } from 'react';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CurrencyInput } from '@/components/ui/currency-input';
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { SettingsRefreshButton } from '@/modules/settings/components/settings-refresh-button';
import { systemSettingsSchema, type SystemSettingsFormValues } from '../schema';
import { useGetSystemSettings, useUpdateSystemSettings } from '../hooks/use-system-settings';

type SystemSettingsFormProps = {
  canEdit: boolean;
};

const defaultValues: SystemSettingsFormValues = {
  bookingHoldPricePerUnit: 0,
  bookingBufferTimeMinutes: 0,
  maxRentalTimeDays: 1,
  maxLateReturnTimeHours: 0,
};

export function SystemSettingsForm({ canEdit }: SystemSettingsFormProps) {
  const query = useGetSystemSettings();
  const mutation = useUpdateSystemSettings();
  const form = useForm<SystemSettingsFormValues>({
    resolver: zodResolver(systemSettingsSchema) as Resolver<SystemSettingsFormValues>,
    defaultValues,
  });

  const settings = query.data;

  useEffect(() => {
    if (!settings) return;

    form.reset({
      bookingHoldPricePerUnit: Number(settings.bookingHoldPricePerUnit),
      bookingBufferTimeMinutes: settings.bookingBufferTimeMinutes,
      maxRentalTimeDays: settings.maxRentalTimeDays,
      maxLateReturnTimeHours: settings.maxLateReturnTimeHours,
    });
  }, [form, settings]);

  const refreshAction = (
    <SettingsRefreshButton isFetching={query.isFetching} onRefresh={() => void query.refetch()} />
  );

  if (query.isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex justify-end">{refreshAction}</div>
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-44" />
            <Skeleton className="h-4 w-full max-w-xl" />
          </CardHeader>
          <CardContent className="grid gap-5 sm:grid-cols-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-16 w-full" />
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (query.isError || !settings) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex justify-end">{refreshAction}</div>
        <Alert variant="destructive">
        <IconSettings aria-hidden="true" />
        <AlertTitle>Không tải được quy tắc thuê</AlertTitle>
        <AlertDescription>Kiểm tra quyền truy cập hoặc thử tải lại trang.</AlertDescription>
        </Alert>
      </div>
    );
  }

  const onSubmit = (values: SystemSettingsFormValues) => {
    mutation.mutate(values, {
      onSuccess: () => form.reset(values),
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">{refreshAction}</div>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <CardContent className="p-4 pt-0">
          <FieldGroup className="gap-5">
            <div className="grid gap-5 md:grid-cols-3">
              <Controller
                control={form.control}
                name="bookingHoldPricePerUnit"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid} data-disabled={!canEdit}>
                    <FieldLabel htmlFor={field.name}>Giá giữ lịch cho mỗi máy thuê</FieldLabel>
                    <CurrencyInput
                      id={field.name}
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={!canEdit}
                      aria-invalid={fieldState.invalid}
                      placeholder="50.000 ₫"
                    />
                    <FieldDescription>Số tiền khách cần trả để giữ lịch cho một máy.</FieldDescription>
                    <FieldError errors={[fieldState.error]} />
                  </Field>
                )}
              />

              <Controller
                control={form.control}
                name="bookingBufferTimeMinutes"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid} data-disabled={!canEdit}>
                    <FieldLabel htmlFor={field.name}>
                      Khoảng cách thời gian giữa các lần đơn thuê được phép cho thuê
                    </FieldLabel>
                    <Input
                      {...field}
                      id={field.name}
                      type="number"
                      min={0}
                      step={1}
                      value={field.value ?? ''}
                      onChange={(event) =>
                        field.onChange(event.target.value === '' ? undefined : Number(event.target.value))
                      }
                      disabled={!canEdit}
                      aria-invalid={fieldState.invalid}
                    />
                    <FieldDescription>Khoảng cách thời gian để chuẩn bị máy sau thời gian trả (phút).</FieldDescription>
                    <FieldError errors={[fieldState.error]} />
                  </Field>
                )}
              />

              <Controller
                control={form.control}
                name="maxRentalTimeDays"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid} data-disabled={!canEdit}>
                    <FieldLabel htmlFor={field.name}>Thời gian thuê tối đa</FieldLabel>
                    <Input
                      {...field}
                      id={field.name}
                      type="number"
                      min={1}
                      step={1}
                      value={field.value ?? ''}
                      onChange={(event) =>
                        field.onChange(event.target.value === '' ? undefined : Number(event.target.value))
                      }
                      disabled={!canEdit}
                      aria-invalid={fieldState.invalid}
                    />
                    <FieldDescription>Giới hạn số ngày tối đa trong một yêu cầu thuê.</FieldDescription>
                    <FieldError errors={[fieldState.error]} />
                  </Field>
                )}
              />

              <Controller
                control={form.control}
                name="maxLateReturnTimeHours"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid} data-disabled={!canEdit}>
                    <FieldLabel htmlFor={field.name}>Thời gian cho phép trả trễ</FieldLabel>
                    <Input
                      {...field}
                      id={field.name}
                      type="number"
                      min={0}
                      step={1}
                      value={field.value ?? ''}
                      onChange={(event) =>
                        field.onChange(event.target.value === '' ? undefined : Number(event.target.value))
                      }
                      disabled={!canEdit}
                      aria-invalid={fieldState.invalid}
                    />
                    <FieldDescription>
                      Số giờ cho phép trễ của 1 đơn thuê. Nếu đơn thuê vượt ngưỡng thời gian, sẽ được tính giá theo quy
                      định (giờ)
                    </FieldDescription>
                    <FieldError errors={[fieldState.error]} />
                  </Field>
                )}
              />
            </div>
          </FieldGroup>
        </CardContent>
        {canEdit ? (
          <div className="flex justify-end border-t border-accent/50 pt-4">
            <Button type="submit" className="w-auto sm:w-auto" disabled={mutation.isPending || !form.formState.isDirty}>
              {mutation.isPending ? (
                <IconLoader className="animate-spin" data-icon="inline-start" />
              ) : (
                <IconDeviceFloppy data-icon="inline-start" />
              )}
              Lưu thay đổi
            </Button>
          </div>
        ) : null}
      </form>
    </div>
  );
}
