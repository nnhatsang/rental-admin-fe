# Module Table Questionnaire

Tài liệu này dùng trước khi tạo một module mới có table.

Mục tiêu: trả lời đủ câu hỏi trước, sau đó mới chọn config cho `useDataTable`. Cách này giúp table không bị bật quá nhiều tính năng không cần thiết.

## Cách dùng

Khi bắt đầu module mới, copy phần checklist này vào ghi chú/task của module và trả lời ngắn gọn.

Sau khi trả lời xong:

1. Chọn preset phù hợp ở cuối tài liệu.
2. Tạo `use-*-state.ts`.
3. Tạo `columns.tsx`.
4. Tạo dialogs/forms/actions nếu cần.
5. Truyền config tối thiểu vào `useDataTable`.

## 1. Thông tin module

| Câu hỏi | Trả lời |
| --- | --- |
| Module/entity này là gì? |  |
| Màn này là list chính, picker, hay embedded table? |  |
| Người dùng chính của màn này là ai? |  |
| Mục tiêu thao tác chính là xem, tạo/sửa/xóa, hay bulk manage? |  |
| Có cần sync state table lên URL không? |  |

## 2. Dữ liệu và API

| Câu hỏi | Trả lời |
| --- | --- |
| API endpoint list là gì? |  |
| Response có phân trang không? |  |
| Field chứa items là gì? |  |
| Field chứa pagination là gì? |  |
| Row id ổn định là field nào? |  |
| Page index backend bắt đầu từ 0 hay 1? |  |
| Page size mặc định là bao nhiêu? |  |
| Backend có hỗ trợ search không? |  |
| Query param search tên gì? |  |
| Backend có hỗ trợ sort không? |  |
| Query param sort format là gì? |  |
| Backend có hỗ trợ filter không? |  |
| Backend có hỗ trợ export toàn bộ data không? |  |

## 3. Query params cần map

Điền các query params sẽ gửi lên API.

| UI state | Query param | Type | Ví dụ | Ghi chú |
| --- | --- | --- | --- | --- |
| Page | `page` | number | `1` |  |
| Page size | `perPage` | number | `10` |  |
| Search | `search` | string | `abc` |  |
| Sort field | `sortBy` | string | `createdAt` |  |
| Sort direction | `sort` | string | `asc`, `desc` |  |
| Column filter |  |  |  |  |

Ví dụ:

| UI state | Query param | Type | Ví dụ | Ghi chú |
| --- | --- | --- | --- | --- |
| `activityStatus` | `status` | string | `ACTIVE` | Map từ column filter sang API. |
| `roles` | `roleCodes` | array | `ADMIN,STAFF` | Cần serialize/deserialize nếu sync URL. |
| `createdAt` | `fromDate/toDate` | date range | `2026-01-01` | Cân nhắc custom mapping. |

## 4. Cột table

Liệt kê toàn bộ cột trước khi code.

| Column id/accessor | Label | Sort? | Filter? | Filter type | Custom cell? | Export? | Ghi chú |
| --- | --- | --- | --- | --- | --- | --- | --- |
|  |  |  |  |  |  |  |  |

Filter type thường dùng:

- `text`
- `select`
- `multi-select`
- `checkbox`
- `range`
- `range-slider`
- `date`
- `date-range`

Ghi chú:

- Nếu header không phải string, nên khai báo `meta.label`.
- Nếu select/multi-select, nên khai báo `meta.options`.
- Nếu custom cell phức tạp, cân nhắc tắt highlight bằng `meta.disableHighlight`.

## 5. Row actions

| Câu hỏi | Trả lời |
| --- | --- |
| Có action từng row không? |  |
| Action nào cần có? |  |
| Action hiển thị dạng menu hay button inline? |  |
| Action nào nguy hiểm cần confirm dialog? |  |
| Action nào cần permission/role để hiển thị? |  |
| Có action đổi trạng thái nhanh không? |  |
| Có action mở detail page không? |  |

Ví dụ row actions:

- View detail
- Edit
- Delete
- Toggle status
- Reset password
- Assign role
- Duplicate

## 6. Bulk actions và selection

| Câu hỏi | Trả lời |
| --- | --- |
| Có cần chọn nhiều dòng không? |  |
| Chọn nhiều để làm gì? |  |
| Select all theo page hay toàn bộ rows? |  |
| Có cần clear selection sau mutation không? |  |
| Bulk action nào cần confirm? |  |
| Backend có API bulk không? |  |

Config liên quan:

```tsx
const [rowSelection, setRowSelection] = useState<RowSelectionState>({})

enableRowSelection: true
selectAllMode: "page"
onRowSelectionChange: setRowSelection
```

## 7. CRUD flow

| Câu hỏi | Trả lời |
| --- | --- |
| Create dùng page riêng, dialog, drawer, hay inline row? |  |
| Edit dùng page riêng, dialog, drawer, hay inline table? |  |
| Delete là soft delete hay hard delete? |  |
| Sau create/update/delete sẽ refetch list hay update cache? |  |
| Form validation dùng schema nào? |  |
| Có cần optimistic update không? |  |
| Có cần reset page sau mutation không? |  |

Khuyến nghị hiện tại: CRUD admin nên dùng dialog/form ngoài table. Nếu vậy giữ:

```tsx
enableEditing: false
```

Chỉ bật editing trong table khi nghiệp vụ thật sự giống spreadsheet.

## 8. Toolbar và UX

| Câu hỏi | Trả lời |
| --- | --- |
| Có cần global search không? |  |
| Search nằm trái hay phải toolbar? |  |
| Có cần filter row luôn mở không? |  |
| Có cần column visibility không? |  |
| Có cần export không? |  |
| Có cần density toggle không? |  |
| Có cần fullscreen toggle không? |  |
| Có cần custom empty state không? |  |
| Có cần hiển thị total count ngoài pagination không? |  |

Config gọn cho CRUD:

```tsx
enableGlobalFilter: true
enableGlobalFilterModes: false
enableColumnFilters: true
enableColumnFilterModes: false
enableDensityToggle: false
enableFullscreenToggle: false
```

## 9. Loading và empty state

| Câu hỏi | Trả lời |
| --- | --- |
| Lần đầu load dùng skeleton hay spinner? |  |
| Refetch giữ rows cũ hay clear table? |  |
| Empty state text là gì? |  |
| Empty state có button create không? |  |
| Có phân biệt empty do filter và empty do chưa có data không? |  |

Config thường dùng:

```tsx
isLoading
showLoadingOverlay: isFetching
renderEmpty: ({ table }) => ...
```

## 10. Tính năng nâng cao

Chỉ bật nếu có câu trả lời rõ ràng.

| Tính năng | Có cần không? | Lý do |
| --- | --- | --- |
| Inline editing |  |  |
| Create row trong table |  |  |
| Advanced filter |  |  |
| Grouping |  |  |
| Detail panel/expand row |  |  |
| Tree/sub rows |  |  |
| Row ordering kéo thả |  |  |
| Row pinning |  |  |
| Row numbers |  |  |
| Column ordering kéo thả |  |  |
| Column pinning |  |  |
| Column resizing/autosize |  |  |
| Row virtualization |  |  |
| Column virtualization |  |  |
| Click to copy |  |  |
| Keyboard navigation |  |  |

Nếu không có lý do rõ, giữ default tắt cho các nhóm này:

```tsx
enableAdvancedFilter: false
enableGrouping: false
enableRowOrdering: false
enableColumnOrdering: false
enableColumnPinning: false
enableRowVirtualization: false
enableColumnVirtualization: false
enableEditing: false
```

## 11. Permission và visibility

| Câu hỏi | Trả lời |
| --- | --- |
| Ai được xem module này? |  |
| Ai được create? |  |
| Ai được edit? |  |
| Ai được delete? |  |
| Action nào cần ẩn theo permission? |  |
| Cột nào cần ẩn theo permission? |  |
| Có dữ liệu nhạy cảm cần mask không? |  |

Nên xử lý permission ở module/columns/actions, không nhét logic permission chung vào data-table nếu không cần.

## 12. Preset quyết định

Sau khi trả lời checklist, chọn một preset.

### `adminCrudBasic`

Dùng khi module chỉ cần list/search/sort/filter/pagination/action.

```tsx
const table = useDataTable({
  data,
  columns,
  pageCount,
  state: {
    pagination: tableQuery.pagination,
    sorting: tableQuery.sorting,
    columnFilters: tableQuery.columnFilters,
    globalFilter: tableQuery.globalFilter,
  },
  getRowId: (row) => row.id,
  manualPagination: true,
  manualSorting: true,
  manualFiltering: true,
  enableGlobalFilter: true,
  enableGlobalFilterModes: false,
  enableColumnFilters: true,
  enableColumnFilterModes: false,
  enableEditing: false,
  isLoading,
  showLoadingOverlay: isFetching,
  onPaginationChange: tableQuery.onPaginationChange,
  onSortingChange: tableQuery.onSortingChange,
  onColumnFiltersChange: tableQuery.onColumnFiltersChange,
  onGlobalFilterChange: tableQuery.onGlobalFilterChange,
})
```

### `adminCrudSelectable`

Dùng khi cần chọn nhiều dòng hoặc bulk action.

```tsx
const table = useDataTable({
  ...adminCrudBasicOptions,
  state: {
    ...adminCrudBasicOptions.state,
    rowSelection,
  },
  enableRowSelection: true,
  selectAllMode: "page",
  onRowSelectionChange: setRowSelection,
})
```

### `adminCrudExportable`

Dùng khi cần export data table hiện tại.

```tsx
const table = useDataTable({
  ...adminCrudSelectableOptions,
  enableExport: true,
  exportFileName: "module-name",
})
```

Lưu ý: nếu backend phân trang, export `"all"` chỉ là toàn bộ rows đang có ở client nếu không có API export riêng.

### `adminGridWide`

Dùng khi bảng nhiều cột, cần resize/pin.

```tsx
const table = useDataTable({
  ...adminCrudExportableOptions,
  enableColumnActions: true,
  enableColumnResizing: true,
  enableColumnAutosize: true,
  enableColumnPinning: true,
})
```

### `adminGridAdvanced`

Chỉ dùng khi đã xác nhận nghiệp vụ cần tính năng nâng cao.

```tsx
const table = useDataTable({
  ...adminCrudExportableOptions,
  enableAdvancedFilter: true,
  enableGrouping: true,
  renderDetailPanel: ({ row }) => <DetailPanel row={row.original} />,
})
```

## 13. Output mong muốn sau questionnaire

Sau khi trả lời xong, nên có kết luận ngắn dạng:

```txt
Module: Users
Preset: adminCrudExportable
Row id: id
Server-side: pagination + sorting + filtering
URL sync: yes
Search param: search
Sort params: sortBy, sort
Column filters:
- activityStatus -> status, select
Row actions:
- edit
- delete
- reset password
- toggle status
Bulk actions:
- delete selected, page select only
Advanced features:
- none
```

Khi có output này, việc tạo module sẽ rõ ràng hơn nhiều và config `useDataTable` sẽ không bị phình.
