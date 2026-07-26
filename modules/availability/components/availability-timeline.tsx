'use client';

import {
  RENTAL_GANTT_I18N,
  RENTAL_GANTT_LOCALE,
  RENTAL_GANTT_READONLY_CONFIG,
  RENTAL_GANTT_TIME_ZONE,
} from '@/components/reui/gantt/gantt-config';
import { Gantt } from '@/components/reui/gantt/gantt';
import { GanttNav } from '@/components/reui/gantt/gantt-nav';
import { GanttView } from '@/components/reui/gantt/gantt-view';
import { DebouncedSearchInput } from '@/components/shared/debounced-search-input';
import { Button } from '@/components/ui/button';
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { IconChevronLeft, IconChevronRight, IconRefresh } from '@tabler/icons-react';
import { useAvailabilityTimelineLogic } from '../hooks/use-availability-timeline-logic';
import { AvailabilityShell } from './availability-shell';

export function AvailabilityTimeline() {
  const {
    currentPage,
    events,
    ganttDate,
    ganttScale,
    handlePageChange,
    handleRangeChange,
    handleSearchChange,
    handleScaleChange,
    handleDateChange,
    query,
    resources,
    search,
  } = useAvailabilityTimelineLogic();
  const totalPage = query.data?.pagination?.totalPage ?? 1;
  const canPreviousPage = currentPage > 1;
  const canNextPage = currentPage < totalPage;

  return (
    <AvailabilityShell>
      <Card>
        <CardHeader className="border-b has-data-[slot=card-action]:grid-cols-1 md:has-data-[slot=card-action]:grid-cols-[1fr_auto]">
          <div className="grid auto-rows-min gap-1.5">
            <CardTitle className="text-xl leading-none">Timeline</CardTitle>
            <CardDescription className="max-w-sm leading-snug">
              Xem lịch thuê theo từng serial để điều phối máy.
            </CardDescription>
          </div>
          <CardAction className="col-start-1 row-start-auto flex w-full flex-wrap justify-start gap-2 justify-self-stretch md:col-start-2 md:row-span-2 md:row-start-1 md:w-auto md:flex-nowrap md:justify-end md:justify-self-end">
            <DebouncedSearchInput
              value={search}
              onDebouncedChange={handleSearchChange}
              placeholder="Tìm serial, sản phẩm, SKU..."
              className="w-full sm:w-[280px]"
            />
            <Button variant="outline" size="lg" disabled={query.isFetching} onClick={() => void query.refetch()}>
              <IconRefresh className="mr-1.5 size-4" />
              Làm mới
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent className="space-y-3">
          {query.isLoading ? <p className="text-sm text-muted-foreground">Đang tải timeline...</p> : null}
          <div className="overflow-hidden rounded-lg border bg-background">
            <Gantt
              events={events}
              resources={resources}
              scale={ganttScale}
              date={ganttDate}
              onDateChange={handleDateChange}
              onScaleChange={handleScaleChange}
              onRangeChange={handleRangeChange}
              locale={RENTAL_GANTT_LOCALE}
              timeZone={RENTAL_GANTT_TIME_ZONE}
              i18n={RENTAL_GANTT_I18N}
              className="h-[calc(100dvh-320px)] border-0"
              loading={query.isFetching}
              {...RENTAL_GANTT_READONLY_CONFIG}
            >
              <GanttNav />
              <GanttView />
            </Gantt>
          </div>
          <div className="flex flex-col gap-2 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
            <span>
              Hiển thị {query.data?.pagination?.count ?? resources.length} /{' '}
              {query.data?.pagination?.total ?? resources.length} thiết bị
            </span>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={!canPreviousPage || query.isFetching}
                onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
              >
                <IconChevronLeft className="size-4" />
                Trước
              </Button>
              <span className="min-w-20 text-center">
                Trang {currentPage}/{totalPage}
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={!canNextPage || query.isFetching}
                onClick={() => handlePageChange(currentPage + 1)}
              >
                Sau
                <IconChevronRight className="size-4" />
              </Button>
            </div>
          </div>
          {/* {!query.isLoading && resources.length === 0 ? (
            <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
              Không có serial trong khoảng này.
            </p>
          ) : null} */}
        </CardContent>
      </Card>
    </AvailabilityShell>
  );
}
