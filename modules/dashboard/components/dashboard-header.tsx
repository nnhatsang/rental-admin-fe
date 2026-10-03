'use client';

import { useState } from 'react';
import { DateTimeRangePicker, type DateTimeRange } from '@/components/shared/date-time-range-picker';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { IconChartBar, IconRefresh } from '@tabler/icons-react';
import { dashboardPresetOptions } from '../constants';
import { formatDashboardPeriod } from '../display-utils';
import type { DashboardPreset } from '../constants';
import type { DashboardTrendGroupBy as DashboardTrendGroupByType } from '../model';

type DashboardHeaderProps = {
  dateRange: DateTimeRange;
  onDateRangeChange: (range: DateTimeRange) => void;
  onPresetChange: (preset: DashboardPreset) => void;
  includeCancelled: boolean;
  onIncludeCancelledChange: (value: boolean) => void;
  groupBy: DashboardTrendGroupByType;
  onGroupByChange: (value: DashboardTrendGroupByType) => void;
  isFetching: boolean;
  onRefresh: () => void;
};

export function DashboardHeader({
  dateRange,
  onDateRangeChange,
  onPresetChange,
  includeCancelled,
  onIncludeCancelledChange,
  groupBy,
  onGroupByChange,
  isFetching,
  onRefresh,
}: DashboardHeaderProps) {
  const [datePickerOpen, setDatePickerOpen] = useState(false);

  return (
    <Card className="border-accent/60 shadow-none">
      <CardHeader className="gap-4 border-b border-accent/60 lg:flex lg:flex-row lg:items-start lg:justify-between">
        <div className="grid min-w-0 gap-1">
          <CardTitle className="flex items-center gap-2 text-xl">
            <IconChartBar className="size-5 text-primary" aria-hidden="true" />
            Dashboard vận hành
          </CardTitle>
          <CardDescription className="max-w-2xl">
            Tổng quan đơn thuê, tài chính snapshot, thiết bị và các việc quản trị viên cần xử lý.
          </CardDescription>
          <p className="text-xs text-muted-foreground">
            Đang xem: <span className="font-medium text-foreground">{formatDashboardPeriod(dateRange.from, dateRange.to)}</span>
          </p>
        </div>

        <div className="flex shrink-0 flex-wrap items-end gap-2 lg:justify-end">
          <div className="grid min-w-0 gap-1.5">
            <Label htmlFor="dashboard-period" className="text-xs text-muted-foreground">
              Khoảng thời gian
            </Label>
            <DateTimeRangePicker
              id="dashboard-period"
              value={dateRange}
              onUpdate={({ range }) => onDateRangeChange(range)}
              open={datePickerOpen}
              setOpen={setDatePickerOpen}
              updateMode="manual"
              enableTime={false}
              allowPastDates
              className="w-full sm:w-[270px]"
            />
          </div>
          <div className="flex items-center gap-1 rounded-lg border border-accent/60 p-1" aria-label="Khoảng thời gian nhanh">
            {dashboardPresetOptions.map((preset) => (
              <Button
                key={preset.value}
                type="button"
                size="sm"
                variant="ghost"
                className="h-7 px-2.5 text-xs"
                onClick={() => onPresetChange(preset.value)}
              >
                {preset.label}
              </Button>
            ))}
          </div>
          <Button type="button" variant="outline" disabled={isFetching} onClick={onRefresh}>
            <IconRefresh aria-hidden="true" data-icon="inline-start" />
            Làm mới
          </Button>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-3 pt-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
          <Checkbox
            checked={includeCancelled}
            onCheckedChange={(checked) => onIncludeCancelledChange(checked === true)}
            aria-label="Bao gồm đơn đã hủy"
          />
          <span>
            Bao gồm đơn đã hủy
            <span className="ml-1 text-xs">(để rà cả nghĩa vụ hoàn tiền)</span>
          </span>
        </label>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted-foreground">Xu hướng:</span>
          <ToggleGroup
            type="single"
            value={groupBy}
            onValueChange={(value) => {
              if (value) onGroupByChange(value as DashboardTrendGroupByType);
            }}
            variant="outline"
            size="sm"
            aria-label="Nhóm dữ liệu xu hướng"
          >
            <ToggleGroupItem value="DAY" aria-label="Theo ngày">
              Ngày
            </ToggleGroupItem>
            <ToggleGroupItem value="WEEK" aria-label="Theo tuần">
              Tuần
            </ToggleGroupItem>
            <ToggleGroupItem value="MONTH" aria-label="Theo tháng">
              Tháng
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      </CardContent>
    </Card>
  );
}
