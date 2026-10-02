'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { IconDeviceFloppy, IconLoader } from '@tabler/icons-react';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';

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
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { STORE_CLOSURE_TYPES, type IStoreClosureOut, type StoreClosureType } from '../type';
import { storeClosureSchema, type StoreClosureFormValues } from '../schema';
import { useCreateStoreClosure, useUpdateStoreClosure } from '../hooks/use-store-closures';

type StoreClosureFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentRow?: IStoreClosureOut | null;
  canEdit: boolean;
};

export const storeClosureTypeLabels: Record<StoreClosureType, string> = {
  OFF: 'Nghỉ theo lịch',
  HOLIDAY: 'Ngày lễ',
  MAINTENANCE: 'Bảo trì',
  INTERNAL_EVENT: 'Sự kiện nội bộ',
  OTHER: 'Khác',
};

const toDateInputValue = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return [year, month, day].join('-');
};

const toBoundaryIso = (value: string, endOfDay: boolean) => {
  const date = new Date(value + 'T' + (endOfDay ? '23:59:59.999' : '00:00:00'));
  return date.toISOString();
};

const defaultValues: StoreClosureFormValues = {
  startDate: '',
  endDate: '',
  type: 'OFF',
  reason: '',
};

export function StoreClosureFormDialog({ open, onOpenChange, currentRow, canEdit }: StoreClosureFormDialogProps) {
  const isEdit = Boolean(currentRow);
  const createMutation = useCreateStoreClosure();
  const updateMutation = useUpdateStoreClosure();
  const isPending = createMutation.isPending || updateMutation.isPending;
  const form = useForm<StoreClosureFormValues>({
    resolver: zodResolver(storeClosureSchema),
    defaultValues,
  });

  useEffect(() => {
    if (!open) return;

    form.reset(
      currentRow
        ? {
            startDate: toDateInputValue(currentRow.startDate),
            endDate: toDateInputValue(currentRow.endDate),
            type: currentRow.type,
            reason: currentRow.reason ?? '',
          }
        : defaultValues,
    );
  }, [currentRow, form, open]);

  const handleClose = () => {
    form.reset(defaultValues);
    onOpenChange(false);
  };

  const onSubmit = (values: StoreClosureFormValues) => {
    if (!canEdit) return;

    const data = {
      startDate: toBoundaryIso(values.startDate, false),
      endDate: toBoundaryIso(values.endDate, true),
      type: values.type,
      reason: values.reason?.trim() || undefined,
    };

    if (currentRow) {
      updateMutation.mutate(
        { id: currentRow.id, data },
        {
          onSuccess: handleClose,
        },
      );
      return;
    }

    createMutation.mutate(data, { onSuccess: handleClose });
  };

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => (nextOpen ? onOpenChange(true) : handleClose())}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Cập nhật ngày đóng cửa' : 'Thêm ngày đóng cửa'}</DialogTitle>
          <DialogDescription>
            Khoảng thời gian này sẽ được dùng để cảnh báo và chặn lịch thuê mới theo chính sách backend.
          </DialogDescription>
        </DialogHeader>

        <form id="store-closure-form" onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            <div className="grid gap-4 sm:grid-cols-2">
              <Controller
                control={form.control}
                name="startDate"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid} data-disabled={!canEdit}>
                    <FieldLabel htmlFor={field.name}>Từ ngày</FieldLabel>
                    <Input
                      {...field}
                      id={field.name}
                      type="date"
                      disabled={!canEdit}
                      aria-invalid={fieldState.invalid}
                    />
                    <FieldError errors={[fieldState.error]} />
                  </Field>
                )}
              />
              <Controller
                control={form.control}
                name="endDate"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid} data-disabled={!canEdit}>
                    <FieldLabel htmlFor={field.name}>Đến ngày</FieldLabel>
                    <Input
                      {...field}
                      id={field.name}
                      type="date"
                      disabled={!canEdit}
                      aria-invalid={fieldState.invalid}
                    />
                    <FieldError errors={[fieldState.error]} />
                  </Field>
                )}
              />
            </div>

            <Controller
              control={form.control}
              name="type"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid} data-disabled={!canEdit}>
                  <FieldLabel htmlFor={field.name}>Loại đóng cửa</FieldLabel>
                  <Select value={field.value} onValueChange={field.onChange} disabled={!canEdit}>
                    <SelectTrigger id={field.name} aria-invalid={fieldState.invalid} className="w-full">
                      <SelectValue placeholder="Chọn loại" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {STORE_CLOSURE_TYPES.map((type) => (
                          <SelectItem key={type} value={type}>
                            {storeClosureTypeLabels[type]}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />

            <Controller
              control={form.control}
              name="reason"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid} data-disabled={!canEdit}>
                  <FieldLabel htmlFor={field.name}>Lý do</FieldLabel>
                  <Textarea
                    {...field}
                    id={field.name}
                    disabled={!canEdit}
                    placeholder="Ví dụ: Nghỉ lễ, bảo trì thiết bị..."
                    aria-invalid={fieldState.invalid}
                  />
                  <FieldDescription>Hiển thị cho quản trị viên khi kiểm tra lịch.</FieldDescription>
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />
          </FieldGroup>
        </form>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleClose}>
            Đóng
          </Button>
          {canEdit ? (
            <Button type="submit" form="store-closure-form" disabled={isPending}>
              {isPending ? (
                <IconLoader className="animate-spin" data-icon="inline-start" />
              ) : (
                <IconDeviceFloppy data-icon="inline-start" />
              )}
              {isEdit ? 'Lưu thay đổi' : 'Thêm ngày'}
            </Button>
          ) : null}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export { toDateInputValue };
