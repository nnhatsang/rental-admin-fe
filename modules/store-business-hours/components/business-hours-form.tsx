'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { IconClock, IconDeviceFloppy, IconLoader } from '@tabler/icons-react';
import { useEffect } from 'react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { SettingsRefreshButton } from '@/modules/settings/components/settings-refresh-button';
import { Switch } from '@/components/ui/switch';
import { useGetStoreBussinessHours } from '../hooks/use-get-store-business-hours';
import { useUpdateStoreBussinessHours } from '../hooks/use-update-store-business-hours';
import { storeBusinessHoursSchema, type StoreBusinessHoursFormValues } from '../schema';

type BusinessHoursFormProps = {
  canEdit: boolean;
};

const dayLabels = ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy'];
const defaultItems = dayLabels.map((_, dayOfWeek) => ({
  dayOfWeek,
  openTime: '08:00',
  closeTime: '20:00',
  isOpen: true,
}));

export function BusinessHoursForm({ canEdit }: BusinessHoursFormProps) {
  const query = useGetStoreBussinessHours();
  const mutation = useUpdateStoreBussinessHours();
  const form = useForm<StoreBusinessHoursFormValues>({
    resolver: zodResolver(storeBusinessHoursSchema),
    defaultValues: { items: defaultItems },
  });
  const { fields } = useFieldArray({ control: form.control, name: 'items' });
  const businessHours = query.data?.data;

  useEffect(() => {
    if (!businessHours?.length) return;

    const items = [...businessHours]
      .sort((a, b) => a.dayOfWeek - b.dayOfWeek)
      .map(({ dayOfWeek, openTime, closeTime, isOpen }) => ({ dayOfWeek, openTime, closeTime, isOpen }));
    form.reset({ items });
  }, [businessHours, form]);

  const refreshAction = (
    <SettingsRefreshButton isFetching={query.isFetching} onRefresh={() => void query.refetch()} />
  );

  if (query.isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex justify-end">{refreshAction}</div>
        <Card>
          <CardContent className="flex flex-col gap-3 p-4 sm:p-6">
            {Array.from({ length: 7 }).map((_, index) => (
              <Skeleton key={index} className="h-14 w-full" />
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (query.isError || !businessHours) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex justify-end">{refreshAction}</div>
        <Alert variant="destructive">
        <IconClock aria-hidden="true" />
        <AlertTitle>Không tải được giờ hoạt động</AlertTitle>
        <AlertDescription>Không thể xác định khung giờ cho thuê máy.</AlertDescription>
        </Alert>
      </div>
    );
  }

  const onSubmit = (values: StoreBusinessHoursFormValues) => {
    mutation.mutate(
      { items: values.items },
      {
        onSuccess: () => form.reset(values),
      },
    );
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">{refreshAction}</div>
      <form onSubmit={form.handleSubmit(onSubmit)}>
      <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
        <FieldGroup className="gap-0 divide-y divide-accent/50">
          {fields.map((field, index) => (
            <div
              key={field.id}
              className="grid gap-4 py-4 first:pt-0 last:pb-0 md:grid-cols-[minmax(0,1fr)_auto] md:items-center"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-medium" id={'business-hours-' + field.dayOfWeek}>
                    {dayLabels[field.dayOfWeek]}
                  </p>
                  <FieldDescription>
                    {form.watch(`items.${index}.isOpen`)
                      ? 'Cho phép nhận và trả máy trong ngày này.'
                      : 'Tạm không nhận lịch mới trong ngày này.'}
                  </FieldDescription>
                </div>
                <Controller
                  control={form.control}
                  name={`items.${index}.isOpen`}
                  render={({ field: switchField }) => (
                    <Switch
                      checked={switchField.value}
                      onCheckedChange={switchField.onChange}
                      disabled={!canEdit}
                      aria-label={'Bật giờ hoạt động ' + dayLabels[field.dayOfWeek]}
                    />
                  )}
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2 md:w-80 md:min-w-0">
                <Controller
                  control={form.control}
                  name={`items.${index}.openTime`}
                  render={({ field: timeField, fieldState }) => (
                    <Field data-invalid={fieldState.invalid} data-disabled={!canEdit}>
                      <FieldLabel htmlFor={timeField.name}>Mở cửa</FieldLabel>
                      <Input
                        {...timeField}
                        id={timeField.name}
                        type="time"
                        disabled={!canEdit || !form.watch(`items.${index}.isOpen`)}
                        aria-invalid={fieldState.invalid}
                      />
                      <FieldError errors={[fieldState.error]} />
                    </Field>
                  )}
                />
                <Controller
                  control={form.control}
                  name={`items.${index}.closeTime`}
                  render={({ field: timeField, fieldState }) => (
                    <Field data-invalid={fieldState.invalid} data-disabled={!canEdit}>
                      <FieldLabel htmlFor={timeField.name}>Đóng cửa</FieldLabel>
                      <Input
                        {...timeField}
                        id={timeField.name}
                        type="time"
                        disabled={!canEdit || !form.watch(`items.${index}.isOpen`)}
                        aria-invalid={fieldState.invalid}
                      />
                      <FieldError errors={[fieldState.error]} />
                    </Field>
                  )}
                />
              </div>
            </div>
          ))}
        </FieldGroup>
      </CardContent>

      {canEdit ? (
        <div className="flex justify-end border-t border-accent/50 pt-4">
          <Button type="submit" disabled={mutation.isPending || !form.formState.isDirty}>
            {mutation.isPending ? (
              <IconLoader className="animate-spin" data-icon="inline-start" />
            ) : (
              <IconDeviceFloppy data-icon="inline-start" />
            )}
            Lưu giờ hoạt động
          </Button>
        </div>
      ) : null}
      </form>
    </div>
  );
}
