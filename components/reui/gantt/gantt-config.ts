import { LOCALE } from '@/lib/utils';
import type { GanttI18nOverrides } from '@/components/reui/gantt/gantt-i18n';
import type { GanttDateRange, GanttInteractions, GanttScale } from '@/components/reui/gantt/gantt-types';
import { vi } from 'date-fns/locale';
import { format, isSameYear, subMilliseconds, type Locale } from 'date-fns';

export const RENTAL_GANTT_TIME_ZONE = 'Asia/Ho_Chi_Minh';

export const RENTAL_GANTT_LOCALE = vi;

export const RENTAL_GANTT_DEFAULT_SCALE: GanttScale = 'week';

function formatRentalDayRange(range: GanttDateRange, locale?: Locale): string {
  const end = subMilliseconds(range.end, 1);
  const sameYear = isSameYear(range.start, end);
  const startLabel = format(range.start, sameYear ? 'dd/MM' : 'dd/MM/yyyy', { locale });
  const endLabel = format(end, 'dd/MM/yyyy', { locale });

  return `${startLabel} - ${endLabel}`;
}

export const RENTAL_GANTT_I18N: GanttI18nOverrides = {
  labels: {
    today: 'Hôm nay',
    previous: 'Trước',
    next: 'Sau',
    addEvent: 'Thêm lịch',
    addTask: 'Thêm dòng',
    allDay: 'Cả ngày',
    loading: 'Đang tải lịch',
    event: 'lịch',
    events: (count) => `${count} lịch`,
    week: (weekNumber) => `Tuần ${weekNumber}`,
    resources: 'Thiết bị',
    goToDate: 'Chọn ngày',
    scheduleHint: 'Bấm để thêm lịch',
    scheduleHintDrag: 'Bấm hoặc kéo để thêm lịch',
    reorder: 'Sắp xếp',
    selectView: 'Kiểu xem',
    zoomIn: 'Phóng to',
    zoomOut: 'Thu nhỏ',
    resizePanel: 'Đổi kích thước panel',
    jumpToBar: (title) => `Cuộn tới "${title}"`,
    progress: (percent) => `Hoàn thành ${percent}%`,
    durationDays: (days) => `${days} ngày`,
    continues: 'còn tiếp',
    scales: {
      day: 'Ngày',
      week: 'Tuần',
      month: 'Tháng',
      quarter: 'Quý',
      year: 'Năm',
    },
  },
  formats: {
    monthTitle: 'MMMM yyyy',
    dayTitle: LOCALE.dateFormats.long,
    timeGutter: LOCALE.dateFormats.time,
    eventTime: LOCALE.dateFormats.time,
  },
  functions: {
    formatTitle: (scale, { date, activeRange, locale }) => {
      if (scale === 'day') return format(date, LOCALE.dateFormats.long, { locale });
      if (scale === 'month') return format(date, 'MMMM yyyy', { locale });
      if (scale === 'quarter') return `Quý ${format(date, 'Q yyyy', { locale })}`;
      if (scale === 'year') return format(date, 'yyyy', { locale });
      return formatRentalDayRange(activeRange, locale);
    },
    formatDayRange: (range, locale) => formatRentalDayRange(range, locale),
  },
};

export const RENTAL_GANTT_READONLY_INTERACTIONS: GanttInteractions = {
  drag: false,
  resize: false,
  selectSlot: false,
};

export const RENTAL_GANTT_READONLY_CONFIG = {
  interactions: RENTAL_GANTT_READONLY_INTERACTIONS,
  rowCheckboxes: false,
  summaryBars: false,
  dragCreate: false,
  displayScheduleHint: false,
  timelineLines: 'both' as const,
  barLabel: 'inside' as const,
  offDays: true,
};
