# Gantt Component

Tài liệu nhanh cho bộ component trong `components/reui/gantt`. Bộ này dùng kiểu compound component:

```tsx
<Gantt>
  <GanttNav />
  <GanttView />
</Gantt>
```

`Gantt` giữ state/config, `GanttNav` render thanh điều hướng, `GanttView` render tree resource + timeline.

## Import

```tsx
import { Gantt } from '@/components/reui/gantt/gantt';
import { GanttNav } from '@/components/reui/gantt/gantt-nav';
import { GanttView } from '@/components/reui/gantt/gantt-view';
import type { GanttEvent, GanttResource } from '@/components/reui/gantt/gantt-types';
```

## Data Chính

### Resource

`resources` là danh sách dòng bên trái timeline.

```ts
const resources: GanttResource[] = [
  {
    id: 'asset-unit-id',
    title: 'SN001 - Canon R5',
    scheduleMode: 'multiple',
  },
];
```

Các field hay dùng:

| Field | Type | Mục đích |
| --- | --- | --- |
| `id` | `string` | ID duy nhất của row |
| `title` | `string` | Label hiển thị bên trái |
| `color` | `string` | Màu accent row |
| `scheduleMode` | `'single' \| 'multiple'` | Cho phép 1 hay nhiều bar chồng lane |
| `children` | `GanttResource[]` | Tạo group/cây lồng nhau |

### Event

`events` là các bar nằm trên timeline.

```ts
const events: GanttEvent[] = [
  {
    id: 'order-001',
    title: 'RO-001 - Nguyen Van A',
    start: new Date('2026-07-24T08:00:00'),
    end: new Date('2026-07-26T18:00:00'),
    resourceId: 'asset-unit-id',
    color: 'var(--color-blue-500)',
    readOnly: true,
    draggable: false,
    resizable: false,
  },
];
```

Các field hay dùng:

| Field | Type | Mục đích |
| --- | --- | --- |
| `id` | `string` | ID event |
| `title` | `string` | Text trên bar |
| `start` | `Date` | Thời gian bắt đầu |
| `end` | `Date` | Thời gian kết thúc, phải `>= start` |
| `resourceId` | `string` | Gắn event vào resource row |
| `color` | `string` | Màu bar |
| `readOnly` | `boolean` | Chặn drag/resize |
| `draggable` | `boolean` | Override quyền drag |
| `resizable` | `boolean` | Override quyền resize |
| `progress` | `number` | 0-100, hiển thị tiến độ trong bar |
| `data` | `TData` | Payload domain riêng |

## Ví Dụ Cơ Bản

```tsx
<Gantt
  defaultEvents={events}
  resources={resources}
  defaultScale="month"
  className="h-[calc(100dvh-280px)]"
>
  <GanttNav />
  <GanttView />
</Gantt>
```

## Config Hay Dùng

### Scale

```tsx
<Gantt defaultScale="week" />
```

Hỗ trợ:

```ts
'day' | 'week' | 'month' | 'quarter' | 'year'
```

Nếu muốn controlled:

```tsx
<Gantt scale={scale} onScaleChange={setScale} />
```

### Date Anchor

```tsx
<Gantt defaultDate={new Date()} />
```

Controlled:

```tsx
<Gantt date={date} onDateChange={setDate} />
```

### Events

Uncontrolled:

```tsx
<Gantt defaultEvents={events} />
```

Controlled:

```tsx
<Gantt events={events} onEventsChange={setEvents} />
```

Với data lấy từ API, thường dùng controlled hoặc truyền `defaultEvents` khi component chỉ đọc.

### Interaction

Tắt drag/resize/select slot toàn bộ:

```tsx
<Gantt
  interactions={{
    drag: false,
    resize: false,
    selectSlot: false,
  }}
/>
```

Tắt riêng từng event:

```ts
{
  readOnly: true,
  draggable: false,
  resizable: false,
}
```

### Resource Schedule Mode

```tsx
<Gantt scheduleMode="multiple" />
```

Hoặc set riêng từng resource:

```ts
{
  id: 'asset-1',
  title: 'SN001',
  scheduleMode: 'single',
}
```

Ý nghĩa:

| Mode | Ý nghĩa |
| --- | --- |
| `single` | Một row chỉ có một lane, không phù hợp event overlap |
| `multiple` | Event overlap sẽ xếp thành nhiều lane |

Với availability timeline nên dùng `multiple`, vì một asset có thể có nhiều block hiển thị trong khoảng xem.

### Time Zone Và Locale

```tsx
import { vi } from 'date-fns/locale';

<Gantt timeZone="Asia/Ho_Chi_Minh" locale={vi} weekStartsOn={1} />
```

`timeZone` ảnh hưởng cách timeline chia ngày/tuần và hiển thị mốc thời gian.

### Timeline Lines

```tsx
<Gantt timelineLines="both" />
```

Các giá trị:

| Value | Ý nghĩa |
| --- | --- |
| `vertical` | Chỉ kẻ line theo đơn vị thời gian |
| `both` | Kẻ cả vertical và horizontal |
| `none` | Tắt line |
| `{ vertical, horizontal }` | Config riêng từng trục |

Ví dụ:

```tsx
<Gantt timelineLines={{ vertical: 'dashed', horizontal: true }} />
```

### Bar Label

```tsx
<Gantt barLabel="inside" />
```

Các giá trị:

| Value | Ý nghĩa |
| --- | --- |
| `inside` | Label nằm trong bar |
| `outside` | Label nằm ngoài bar |
| `auto` | Bar ngắn thì đẩy label ra ngoài |

### Tree Panel

```tsx
<Gantt
  treePanel={{
    width: 340,
    minWidth: 260,
    maxWidth: 640,
    resizable: true,
    nameColumnWidth: 260,
  }}
/>
```

### Layout Metrics

```tsx
<Gantt
  metrics={{
    laneHeight: 1.25,
    laneGap: 0.1875,
    rowPadding: 0.5,
    minRowHeight: 2.5,
    unitWidths: {
      week: 10,
      month: 4,
    },
  }}
/>
```

### Loading

```tsx
<Gantt loading={query.isFetching} />
```

### Bounds

Giới hạn vùng điều hướng timeline:

```tsx
<Gantt
  rangeBounds={{
    min: new Date('2026-01-01'),
    max: new Date('2026-12-31'),
  }}
/>
```

## Callback Hay Dùng

### Click Event

```tsx
<Gantt
  onEventClick={(occurrence) => {
    const orderId = occurrence.event.data?.orderId;
    if (orderId) router.push(`/rental-orders/${orderId}`);
  }}
/>
```

### Update Event

```tsx
<Gantt
  onEventUpdate={(update) => {
    console.log(update.event.id, update.start, update.end);
    return true;
  }}
/>
```

Return:

| Return | Ý nghĩa |
| --- | --- |
| `false` | Reject/revert update |
| `true` hoặc `void` | Accept update |
| `{ start, end, allDay }` | Accept nhưng điều chỉnh lại thời gian |

### Range Change

Dùng để fetch data theo visible range thật của Gantt:

```tsx
<Gantt
  onRangeChange={({ range, scale }) => {
    console.log(scale, range.start, range.end);
  }}
/>
```

## Availability Timeline Example

Mapping API `availability/timeline` sang Gantt:

```tsx
const resources = data.items.map((row) => ({
  id: row.assetUnitId,
  title: `${row.serialNumber ?? 'Chua co serial'} · ${row.productName}`,
  scheduleMode: 'multiple',
}));

const events = data.items.flatMap((row) =>
  row.blocks.map((block) => ({
    id: `${row.assetUnitId}-${block.orderId}`,
    title: `${block.orderCode} - ${block.customerName}`,
    start: new Date(block.startDate),
    end: new Date(block.blockedEndDate),
    resourceId: row.assetUnitId,
    color: statusColor[block.status] ?? 'var(--color-primary)',
    readOnly: true,
    draggable: false,
    resizable: false,
    data: {
      ...block,
      serialNumber: row.serialNumber,
      productName: row.productName,
      sku: row.sku,
    },
  })),
);
```

Render:

```tsx
<Gantt
  defaultEvents={events}
  resources={resources}
  defaultScale="month"
  timelineLines="both"
  barLabel="inside"
  className="h-[calc(100dvh-280px)]"
>
  <GanttNav />
  <GanttView />
</Gantt>
```

## Gợi Ý Config Theo Use Case

### Availability / Booking Timeline

```tsx
<Gantt
  defaultEvents={events}
  resources={resources}
  defaultScale="month"
  interactions={{ drag: false, resize: false, selectSlot: false }}
  scheduleMode="multiple"
  timelineLines="both"
  barLabel="inside"
/>
```

### Task Planning Có Drag/Resize

```tsx
<Gantt
  events={events}
  onEventsChange={setEvents}
  resources={resources}
  defaultScale="week"
  interactions={{ drag: true, resize: true, selectSlot: true }}
  overlap="clamp"
/>
```

### Read-only Report

```tsx
<Gantt
  defaultEvents={events}
  resources={resources}
  defaultScale="quarter"
  interactions={{ drag: false, resize: false, selectSlot: false }}
  zoomControl={false}
  rowCheckboxes={false}
  barLabel="auto"
/>
```

## File Map

| File | Vai trò |
| --- | --- |
| `gantt.tsx` | Root provider, state, config, hooks public |
| `gantt-view.tsx` | Timeline grid, tree panel, layout, bars |
| `gantt-nav.tsx` | Nav, scale switcher, date picker |
| `gantt-bar.tsx` | Render từng event bar |
| `gantt-dnd.tsx` | Drag/resize/select-slot gestures |
| `gantt-lib.tsx` | Date range, packing, helpers |
| `gantt-types.tsx` | Public types |
| `gantt-i18n.tsx` | Labels/formats/i18n |
| `gantt-recurrence.tsx` | Recurring event expansion |

## Lưu Ý

- `start` và `end` của event phải là `Date`, không truyền string trực tiếp.
- `end` nên hiểu là exclusive instant.
- Nếu event không hiện, kiểm tra `resourceId` có khớp `resources[].id` không.
- Nếu chỉ xem timeline, nên tắt interaction để tránh user kéo nhầm.
- Với màn filter theo ngày, normalize `startDate` đầu ngày và `endDate` cuối ngày trước khi gọi API.
- Với dữ liệu API có timezone, nên parse rõ ở layer hook trước khi map sang `GanttEvent`.

## Rental Admin Preset

Dự án rental admin dùng preset tại `gantt-config.ts` để tránh mỗi màn truyền lại locale, timezone, i18n và readonly config.

```tsx
import {
  RENTAL_GANTT_DEFAULT_SCALE,
  RENTAL_GANTT_I18N,
  RENTAL_GANTT_LOCALE,
  RENTAL_GANTT_READONLY_CONFIG,
  RENTAL_GANTT_TIME_ZONE,
} from '@/components/reui/gantt/gantt-config';

<Gantt
  defaultEvents={events}
  resources={resources}
  defaultScale={RENTAL_GANTT_DEFAULT_SCALE}
  locale={RENTAL_GANTT_LOCALE}
  timeZone={RENTAL_GANTT_TIME_ZONE}
  i18n={RENTAL_GANTT_I18N}
  {...RENTAL_GANTT_READONLY_CONFIG}
>
  <GanttNav />
  <GanttView />
</Gantt>
```

Preset này phù hợp các màn xem lịch thuê/read-only:

- timezone cố định `Asia/Ho_Chi_Minh`
- locale tiếng Việt `vi`
- giờ dạng 24h theo `LOCALE.dateFormats.time`
- tắt drag, resize, select slot
- tắt checkbox row và summary bar
- bật off days, offscreen indicators, grid line `both`
