'use client';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn, formatDate } from '@/lib/utils';
import { useGetStoreBussinessHours } from '@/modules/store-business-hours/hooks/use-get-store-business-hours';
import { IStoreBussinessHoursOut } from '@/modules/store-business-hours/type';
import { vi, type Locale } from 'date-fns/locale';
import * as React from 'react';

export interface DateTimeRange {
  from: Date | undefined;
  to: Date | undefined;
}

export interface DateTimeRangePickerV2Props {
  value?: DateTimeRange;
  onUpdate?: (values: { range: DateTimeRange }) => void;
  initialDateFrom?: Date | string;
  initialDateTo?: Date | string;
  align?: 'start' | 'center' | 'end';
  locale?: Locale;
  className?: string;
  id?: string;
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  enableTime?: boolean;
}

const pad2 = (n: number) => String(n).padStart(2, '0');
const HOUR_OPTIONS = Array.from({ length: 24 }, (_, hour) => ({
  label: `${pad2(hour)}:00`,
  value: hour,
}));

const normalizeToHour = (date: Date): Date => {
  const next = new Date(date);
  next.setMinutes(0, 0, 0);
  return next;
};

const startOfDate = (date: Date): Date => {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
};

const endOfDate = (date: Date): Date => {
  const next = new Date(date);
  next.setHours(23, 59, 59, 999);
  return next;
};

const ceilToNextHour = (date: Date): Date => {
  const next = new Date(date);
  if (next.getMinutes() > 0 || next.getSeconds() > 0 || next.getMilliseconds() > 0) {
    next.setHours(next.getHours() + 1);
  }
  next.setMinutes(0, 0, 0);
  return next;
};

const normalizeInitialDate = (input: Date | string | undefined): Date | undefined => {
  if (!input) return undefined;
  if (input instanceof Date) return normalizeToHour(input);
  const parsed = new Date(input);
  return Number.isNaN(parsed.getTime()) ? undefined : normalizeToHour(parsed);
};

const mergeDateAndHour = (date: Date, hour: number): Date => {
  const next = new Date(date);
  next.setHours(hour, 0, 0, 0);
  return next;
};

const timeToMinutes = (time: string): number => {
  const [hour, minute] = time.split(':').map(Number);
  return hour * 60 + minute;
};

export function DateTimeRangePicker({
  value,
  onUpdate,
  initialDateFrom,
  initialDateTo,
  align = 'start',
  locale = vi as Locale,
  className,
  id,
  open,
  setOpen,
  enableTime = true,
}: DateTimeRangePickerV2Props) {
  const businessHoursQuery = useGetStoreBussinessHours(open && enableTime);
  const businessHours: IStoreBussinessHoursOut[] | undefined = businessHoursQuery.data?.data;
  const businessHoursReady = !enableTime || Array.isArray(businessHours);
  const normalizedFrom = normalizeInitialDate(initialDateFrom);
  const normalizedTo = normalizeInitialDate(initialDateTo);
  const [internalRange, setInternalRange] = React.useState<DateTimeRange>({
    from: normalizedFrom,
    to: normalizedTo,
  });
  // const [open, setOpen] = React.useState(false);

  const range = value ?? internalRange;

  // Recalculate on render so a long-lived page does not keep offering hours
  // that have already passed when the picker is opened again.
  const minNow = ceilToNextHour(new Date());
  const minDateOnly = new Date(minNow);
  minDateOnly.setHours(0, 0, 0, 0);

  const emit = React.useCallback(
    (next: DateTimeRange) => {
      if (!value) setInternalRange(next);
      onUpdate?.({ range: next });
    },
    [onUpdate, value],
  );

  const getAvailableHours = React.useCallback(
    (date: Date | undefined, minAllowed: Date) => {
      if (!enableTime) return [];
      if (!date) return [];

      let available = HOUR_OPTIONS;

      if (!businessHoursReady) return [];

      // getDay() trả về 0 (CN) -> 6 (T7), khớp với data API.
      const daySchedule = businessHours?.find((item) => item.dayOfWeek === date.getDay());
      if (!daySchedule?.isOpen) return [];

      const openMinutes = timeToMinutes(daySchedule.openTime);
      const closeMinutes = timeToMinutes(daySchedule.closeTime);
      available = available.filter(({ value }) => {
        const optionMinutes = value * 60;
        return optionMinutes >= openMinutes && optionMinutes <= closeMinutes;
      });

      // Vẫn phải đảm bảo giờ đó lớn hơn hoặc bằng thời điểm hiện tại (minAllowed)
      return available.filter(({ value: hour }) => mergeDateAndHour(date, hour).getTime() >= minAllowed.getTime());
    },
    [businessHours, businessHoursReady, enableTime],
  );

  const isDateDisabled = (date: Date) =>
    date < minDateOnly || (enableTime && (!businessHoursReady || getAvailableHours(date, minNow).length === 0));

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleRangeSelect = (newRange: any) => {
    if (!newRange) {
      emit({ from: undefined, to: undefined });
      return;
    }

    let nextFrom = newRange.from;
    let nextTo = newRange.to;

    if (!enableTime) {
      emit({
        from: nextFrom ? startOfDate(nextFrom) : undefined,
        to: nextTo ? endOfDate(nextTo) : undefined,
      });
      return;
    }

    // Giữ nguyên giờ đã chọn khi thay đổi ngày nhận, nếu không thì lấy giờ khả dụng đầu tiên
    if (nextFrom) {
      const targetHour = range.from ? range.from.getHours() : undefined;
      const available = getAvailableHours(nextFrom, minNow);
      const hour = available.find((h) => h.value === targetHour)?.value ?? available[0]?.value ?? 0;
      nextFrom = mergeDateAndHour(nextFrom, hour);
    }

    // Giữ nguyên giờ đã chọn khi thay đổi ngày trả
    if (nextTo) {
      const minTo = nextFrom || minNow;
      const targetHour = range.to ? range.to.getHours() : undefined;
      const available = getAvailableHours(nextTo, minTo);
      const hour = available.find((h) => h.value === targetHour)?.value ?? available[0]?.value ?? 0;
      nextTo = mergeDateAndHour(nextTo, hour);
    }

    emit({ from: nextFrom, to: nextTo });
  };

  const handleFromHourSelect = (hour: number) => {
    if (!range.from) return;
    const nextFrom = mergeDateAndHour(range.from, hour);
    let nextTo = range.to;

    // Đảm bảo thời gian trả máy luôn sau thời gian nhận máy
    if (nextTo && nextTo.getTime() <= nextFrom.getTime()) {
      nextTo = undefined;
    }
    emit({ from: nextFrom, to: nextTo });
  };

  const handleToHourSelect = (hour: number) => {
    if (!range.to) return;
    const nextTo = mergeDateAndHour(range.to, hour);
    emit({ from: range.from, to: nextTo });
  };

  const fromAvailableHours = getAvailableHours(range.from, minNow);
  const toAvailableHours = getAvailableHours(range.to, range.from || minNow);
  const isMobile = useIsMobile();

  return (
    <div className={cn('space-y-2', className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id={id}
            variant="outline"
            className={cn(
              'w-full justify-start text-left font-normal hover:bg-input/40 ring-1 ring-transparent peer-focus:ring-primary',
              !range.from && !range.to && 'text-muted-foreground',
            )}
          >
            <div className="flex flex-row w-full items-center gap-4">
              <div className="flex-1 truncate">
                <span className={cn('font-medium', range.from ? 'text-primary' : 'text-muted-foreground')}>
                  {range.from
                    ? formatDate(range.from, enableTime ? 'datetimeLong' : 'short')
                    : enableTime
                      ? 'Chọn ngày giờ'
                      : 'Chọn ngày'}
                </span>
              </div>
              <div className="text-muted-foreground/50 font-bold hidden sm:block">
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M8.14645 3.14645C8.34171 2.95118 8.65829 2.95118 8.85355 3.14645L12.8536 7.14645C13.0488 7.34171 13.0488 7.65829 12.8536 7.85355L8.85355 11.8536C8.65829 12.0488 8.34171 12.0488 8.14645 11.8536C7.95118 11.6583 7.95118 11.3417 8.14645 11.1464L11.2929 8H2.5C2.22386 8 2 7.77614 2 7.5C2 7.22386 2.22386 7 2.5 7H11.2929L8.14645 3.85355C7.95118 3.65829 7.95118 3.34171 8.14645 3.14645Z"
                    fill="currentColor"
                    fillRule="evenodd"
                    clipRule="evenodd"
                  ></path>
                </svg>
              </div>
              <div className="flex-1 truncate">
                <span className={cn('font-medium', range.to ? 'text-primary' : 'text-muted-foreground')}>
                  {range.to
                    ? formatDate(range.to, enableTime ? 'datetimeLong' : 'short')
                    : enableTime
                      ? 'Chọn ngày giờ'
                      : 'Chọn ngày'}
                </span>
              </div>
            </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent align={align} className="w-auto p-0 z-500">
          <div className="flex flex-col divide-y sm:divide-y-0 sm:divide-x overflow-hidden bg-background">
            {/* Lịch ở bên trái */}
            <Calendar
              mode="range"
              locale={locale}
              selected={{ from: range.from, to: range.to }}
              defaultMonth={range.from ?? minDateOnly}
              className="p-3 w-[250px] md:w-[500px]"
              disabled={isDateDisabled}
              numberOfMonths={isMobile ? 1 : 2}
              onSelect={handleRangeSelect}
            />
            {enableTime && businessHoursQuery.isLoading ? (
              <div className="flex h-[420px] items-center justify-center">Đang tải giờ hoạt động...</div>
            ) : enableTime && businessHoursQuery.isError ? (
              <div className="flex h-[180px] items-center justify-center px-4 text-sm text-destructive md:h-[250px]">
                Không thể tải giờ hoạt động.
              </div>
            ) : enableTime ? (
              <div className="flex w-full divide-x border-t h-[180px] md:h-[250px]">
                {/* Cột chọn giờ nhận */}
                <div className="flex flex-1 flex-col z-10 overflow-hidden">
                  <div className="space-y-2 px-2 pt-3 pb-2 border-b shrink-0">
                    <p className="text-center text-xs font-bold text-primary uppercase tracking-wider">Giờ nhận</p>
                  </div>
                  <ScrollArea className="flex-1 w-full h-full">
                    <div className="flex flex-col gap-1.5 p-2">
                      {range.from ? (
                        fromAvailableHours.length ? (
                          fromAvailableHours.map((time) => (
                            <Button
                              key={`from-${time.value}`}
                              onClick={() => handleFromHourSelect(time.value)}
                              size="sm"
                              variant={range.from?.getHours() === time.value ? 'default' : 'ghost'}
                              className={cn('h-8 shrink-0', range.from?.getHours() === time.value && 'font-bold')}
                            >
                              {time.label}
                            </Button>
                          ))
                        ) : (
                          <div className="py-4 text-center text-xs text-muted-foreground shrink-0">Hết giờ</div>
                        )
                      ) : (
                        <div className="py-4 text-center text-[11px] text-muted-foreground leading-relaxed px-1 shrink-0">
                          Chọn ngày nhận trước
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </div>

                {/* Cột chọn giờ trả */}
                <div className="flex flex-1 flex-col z-10 overflow-hidden">
                  <div className="space-y-2 px-2 pt-3 pb-2 border-b shrink-0">
                    <p className="text-center text-xs font-bold text-primary uppercase tracking-wider">Giờ trả</p>
                  </div>
                  <ScrollArea className="flex-1 w-full h-full">
                    <div className="flex flex-col gap-1.5 p-2">
                      {range.to ? (
                        toAvailableHours.length ? (
                          toAvailableHours.map((time) => (
                            <Button
                              key={`to-${time.value}`}
                              onClick={() => handleToHourSelect(time.value)}
                              size="sm"
                              variant={range.to?.getHours() === time.value ? 'default' : 'ghost'}
                              className={cn('h-8 shrink-0', range.to?.getHours() === time.value && 'font-bold')}
                            >
                              {time.label}
                            </Button>
                          ))
                        ) : (
                          <div className="py-4 text-center text-xs text-muted-foreground shrink-0">Hết giờ</div>
                        )
                      ) : (
                        <div className="py-4 text-center text-[11px] text-muted-foreground leading-relaxed px-1 shrink-0">
                          Chọn ngày trả trước
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </div>
              </div>
            ) : null}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
