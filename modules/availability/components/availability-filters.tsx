'use client';

import { Button } from '@/components/ui/button';
import { DateTimeRangePicker } from '@/components/shared/date-time-range-picker';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { IconRefresh } from '@tabler/icons-react';
import { Controller, type UseFormReturn } from 'react-hook-form';
import type { IAvailabilityFilterInput } from '../schema';
import { format } from 'date-fns';
import { useState } from 'react';

export function AvailabilityFilters({
  form,
  onRefresh,
  isFetching,
}: {
  form: UseFormReturn<IAvailabilityFilterInput>;
  onRefresh: () => void;
  isFetching: boolean;
}) {
  const [open, setOpen] = useState(false);

  const startDate = form.watch('startDate');
  const endDate = form.watch('endDate');
  const range = {
    from: startDate ? new Date(startDate) : undefined,
    to: endDate ? new Date(endDate) : undefined,
  };
  const toLocalValue = (date: Date) => format(date, "yyyy-MM-dd'T'HH:mm");

  return (
    <div className="grid gap-4 rounded-xl border bg-card p-4 md:grid-cols-2 xl:grid-cols-[1fr_1fr_1.2fr_180px_auto]">
      <Field
        className="md:col-span-2"
        data-invalid={!!form.formState.errors.startDate || !!form.formState.errors.endDate}
      >
        <FieldLabel htmlFor="date-range-time" className="w-full grid grid-cols-2">
          <span>Ngày nhận</span>
          <span>Ngày trả</span>
        </FieldLabel>

        <DateTimeRangePicker
          value={range}
          className="w-full"
          onUpdate={({ range: nextRange }) => {
            form.setValue('startDate', nextRange.from ? toLocalValue(nextRange.from) : '', {
              shouldDirty: true,
              shouldValidate: true,
            });
            form.setValue('endDate', nextRange.to ? toLocalValue(nextRange.to) : '', {
              shouldDirty: true,
              shouldValidate: true,
            });
          }}
          id="date-range-time"
          open={open}
          setOpen={setOpen}
        />
        <FieldError className="flex" errors={[form.formState.errors.startDate, form.formState.errors.endDate]} />
      </Field>

      <Field>
        <FieldLabel htmlFor="availability-search">Tìm sản phẩm hoặc SKU</FieldLabel>
        <Input id="availability-search" placeholder="Canon R5..." {...form.register('search')} />
      </Field>
      <Field>
        <FieldLabel>Khả dụng</FieldLabel>
        <Controller
          control={form.control}
          name="availability"
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Tất cả</SelectItem>
                <SelectItem value="AVAILABLE">Còn hàng</SelectItem>
                <SelectItem value="UNAVAILABLE">Hết hàng</SelectItem>
              </SelectContent>
            </Select>
          )}
        />
      </Field>
      <div className="flex items-end">
        <Button type="button" variant="outline" onClick={onRefresh} disabled={isFetching} className="w-full xl:w-auto">
          <IconRefresh className={isFetching ? 'animate-spin' : ''} /> Làm mới
        </Button>
      </div>
    </div>
  );
}
