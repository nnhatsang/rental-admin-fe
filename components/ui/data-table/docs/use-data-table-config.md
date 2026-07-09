# useDataTable Config Reference

Tài liệu này giải thích các config trong `core/use-data-table.ts`.

Mục tiêu: khi nhìn vào một màn dùng `useDataTable`, biết option nào thật sự cần, option nào chỉ là tính năng nâng cao, và default hiện tại là gì.

## Cách đọc nhanh

`useDataTable(options)` nhận 2 nhóm option:

- TanStack Table options: `data`, `columns`, `state`, `manualPagination`, `manualSorting`, `manualFiltering`, `pageCount`, `getRowId`, `onPaginationChange`, ...
- DataTable UI options: các option riêng như `enableExport`, `enableColumnFilters`, `enableEditing`, `positionGlobalFilter`, ...

Hook sẽ:

1. Merge `localization` và `icons` từ built-in defaults, `DataTableConfigProvider`, rồi tới option truyền vào.
2. Tạo state UI nội bộ như density, fullscreen, filter modes, advanced filter, editing draft.
3. Inject cột hệ thống khi cần: selection, actions, expand, row number, row drag.
4. Gọi `useReactTable`.
5. Gắn config UI vào `table.cnTable`.

## Config tối thiểu nên dùng cho CRUD server-side

```tsx
const table = useDataTable({
  data,
  columns,
  pageCount,
  state: {
    pagination,
    sorting,
    columnFilters,
    globalFilter,
  },
  getRowId: (row) => row.id,
  manualPagination: true,
  manualSorting: true,
  manualFiltering: true,
  enableGlobalFilter: true,
  enableColumnFilters: true,
  enableColumnFilterModes: false,
  enableExport: true,
  exportFileName: "users",
  isLoading,
  showLoadingOverlay: isFetching,
  onPaginationChange,
  onSortingChange,
  onColumnFiltersChange,
  onGlobalFilterChange,
})
```

Với màn CRUD bình thường, không nên bật sẵn grouping, editing trong table, DnD, virtualization, advanced filter nếu chưa có nhu cầu rõ.

## Nhóm core/TanStack passthrough

Các option này là của `@tanstack/react-table`, `useDataTable` chỉ truyền tiếp hoặc gắn default hợp lý.

| Option | Default trong hook | Dùng khi nào | Ghi chú |
| --- | --- | --- | --- |
| `data` | Bắt buộc | Dữ liệu table | Thường là `response.data.items ?? []`. |
| `columns` | Bắt buộc | Định nghĩa cột | Có thể dùng `columnDef.meta` cho filter/edit/label. |
| `state` | Theo TanStack | Controlled table state | Dùng với `useTableQueryState` cho server-side. |
| `pageCount` | Theo TanStack | Server-side pagination | Cần khi `manualPagination: true`. |
| `getRowId` | Theo TanStack | Row có id ổn định | Nên luôn truyền với dữ liệu có `id`. |
| `manualPagination` | `false` của TanStack | Backend phân trang | Nếu bật, hook không tự tạo pagination row model. |
| `manualSorting` | `false` của TanStack | Backend sort | Nếu bật, sort state chỉ dùng để gọi API. |
| `manualFiltering` | `false` của TanStack | Backend filter/search | Nếu bật, client không tự filter rows. |
| `onPaginationChange` | Theo TanStack | Controlled pagination | Dùng từ `useTableQueryState`. |
| `onSortingChange` | Theo TanStack | Controlled sorting | Dùng từ `useTableQueryState`. |
| `onColumnFiltersChange` | Theo TanStack | Controlled column filters | Dùng từ `useTableQueryState`. |
| `onGlobalFilterChange` | Theo TanStack | Controlled global search | Dùng từ `useTableQueryState`. |
| `meta` | Theo TanStack | Truyền handlers xuống column cell | Ví dụ action edit/delete trong column. |
| `defaultColumn` | `{ filterFn: dynamicFilterFn }` + custom | Default cho mọi cột | Hook tự gắn filterFn động. |
| `autoResetPageIndex` | `false` | Tự reset page khi data/filter đổi | Hook tự reset page bằng effect để tránh warning React 19. |
| `columnResizeMode` | `"onChange"` | Resize cột | Chỉ có ý nghĩa khi `enableColumnResizing`. |
| `keepPinnedRows` | `true` | Row pinning | Chỉ có ý nghĩa khi `enableRowPinning`. |

## Config localization/icons

| Option | Default | Dùng khi nào | Ghi chú |
| --- | --- | --- | --- |
| `localization` | `defaultLocalization` | Đổi text UI từng table | Merge sau provider, nên override được từng màn. |
| `icons` | `defaultIcons` | Đổi icon từng table | Ít dùng, chủ yếu để đổi icon library. |
| `DataTableConfigProvider` | Không bắt buộc | Set text/icon mặc định cho một vùng app | Thứ tự merge: built-in defaults < provider < `useDataTable` option. |

## Config loading/saving

| Option | Default | Dùng khi nào | Ghi chú |
| --- | --- | --- | --- |
| `isLoading` | `false` | Lần đầu load data | Tự bật progress, skeleton, overlay nếu không override. |
| `isSaving` | `false` | Đang mutation/save | Tự bật progress bar nhưng không đổi body sang skeleton. |
| `showProgressBars` | `isLoading || isSaving` | Muốn ép bật/tắt progress bar | Render thanh loading trên surface. |
| `showSkeletons` | `isLoading` | Muốn skeleton rows | Thường dùng khi table chưa có data. |
| `showLoadingOverlay` | `isLoading` | Đang refetch nhưng vẫn giữ rows cũ | Users/Roles đang dùng `showLoadingOverlay: isFetching`. |

Khuyến nghị: với React Query, dùng `isLoading` cho lần đầu và `showLoadingOverlay: isFetching` cho refetch.

## Config toolbar/layout

| Option | Default | Dùng khi nào | Ghi chú |
| --- | --- | --- | --- |
| `title` | `undefined` | Tiêu đề nhỏ trong toolbar | Nếu page layout đã có title thì có thể bỏ. |
| `enableTopToolbar` | `true` | Hiện toolbar trên | Tắt nếu tự render toolbar ngoài. |
| `enableBottomToolbar` | `true` | Hiện toolbar dưới | Chủ yếu chứa pagination/custom actions. |
| `enableToolbarInternalActions` | `true` | Hiện cụm search/filter/view/export/density/fullscreen | Tắt để toolbar chỉ còn title/custom actions. |
| `renderToolbarActions` | `undefined` | Thêm action bên trái toolbar | Ví dụ bulk action, button create. |
| `renderToolbarInternalActions` | `undefined` | Thay toàn bộ cụm action mặc định | Dùng khi muốn tự kiểm soát search/export/icons. |
| `renderTopToolbar` | `undefined` | Thay toàn bộ top toolbar | Escape hatch, dùng ít. |
| `renderBottomToolbar` | `undefined` | Thay toàn bộ bottom toolbar | Escape hatch, dùng ít. |
| `renderBottomToolbarCustomActions` | `undefined` | Thêm nội dung bên trái pagination | Ví dụ summary count. |
| `renderCaption` | `undefined` | Render `<caption>` | Dùng cho accessibility hoặc summary. |
| `renderEmpty` | Text localization | Custom empty state | Nên dùng nếu màn cần empty UI riêng. |

## Config density/fullscreen/controlled UI state

| Option | Default | Dùng khi nào | Ghi chú |
| --- | --- | --- | --- |
| `defaultDensity` | `"comfortable"` | Initial density uncontrolled | Giá trị: `"compact"`, `"comfortable"`, `"spacious"`. |
| `density` | `undefined` | Controlled density | Đi kèm `onDensityChange`. |
| `onDensityChange` | `undefined` | Lưu density ra state ngoài | Ít dùng. |
| `enableDensityToggle` | `true` | Hiện nút đổi density | Có thể tắt cho CRUD đơn giản. |
| `isFullscreen` | `undefined` | Controlled fullscreen | Đi kèm `onIsFullscreenChange`. |
| `onIsFullscreenChange` | `undefined` | Lưu fullscreen ra state ngoài | Ít dùng. |
| `enableFullscreenToggle` | `true` | Hiện nút fullscreen | Có thể tắt nếu UI quá nhiều nút. |

## Config global search

| Option | Default | Dùng khi nào | Ghi chú |
| --- | --- | --- | --- |
| `enableGlobalFilter` | `true` | Hiện global search | Với server-side, state nên đi qua API query. |
| `positionGlobalFilter` | `"right"` | Vị trí search | `"left"`, `"right"`, `"none"`. |
| `enableGlobalFilterModes` | `true` | Cho đổi mode search | Có thể tắt cho CRUD đơn giản. |
| `defaultGlobalFilterMode` | `"fuzzy"` | Mode ban đầu | Chỉ ảnh hưởng client filter. Server-side thường chỉ gửi keyword. |
| `globalFilterMode` | `undefined` | Controlled search mode | Đi kèm `onGlobalFilterModeChange`. |
| `onGlobalFilterModeChange` | `undefined` | Lưu mode ra ngoài | Ít dùng. |
| `enableGlobalFilterRankedResults` | `false` | Sort client rows theo độ match fuzzy | Không dùng khi `manualFiltering`/`manualSorting`. |
| `renderGlobalFilterModeMenuItems` | `undefined` | Custom menu mode global | Escape hatch. |

Khuyến nghị server-side: giữ `enableGlobalFilter: true`, tắt `enableGlobalFilterModes` nếu không muốn UI phức tạp.

## Config column filters

| Option | Default | Dùng khi nào | Ghi chú |
| --- | --- | --- | --- |
| `enableColumnFilters` | `true` trừ khi TanStack option là `false` | Bật filter theo cột | Đây là TanStack option nhưng hook đọc để render UI. |
| `defaultShowColumnFilters` | `false` | Initial hiện filter row | Nếu muốn filter row luôn mở. |
| `showColumnFilters` | `undefined` | Controlled filter row visibility | Đi kèm `onShowColumnFiltersChange`. |
| `onShowColumnFiltersChange` | `undefined` | Lưu trạng thái filter row | Ít dùng. |
| `columnFilterDisplayMode` | `"subheader"` | Vị trí filter UI | `"subheader"`, `"popover"`, `"custom"`. |
| `enableColumnFilterModes` | `true` | Cho đổi operator từng cột | Users/Roles đang tắt để UI gọn. |
| `renderColumnFilterModeMenuItems` | `undefined` | Custom menu mode cột | Escape hatch. |
| `enableFacetedValues` | `true` | Tự tính unique values/min-max cho select/range | Tự bỏ qua khi `manualFiltering`. |
| `enableFilterMatchHighlighting` | `true` | Highlight text match trong cells | Bỏ qua cột có custom `cell`. |

Column filter còn phụ thuộc `columnDef.meta`:

```tsx
{
  accessorKey: "status",
  header: "Trạng thái",
  meta: {
    variant: "select",
    options: [
      { label: "Active", value: "ACTIVE" },
      { label: "Banned", value: "BANNED" },
    ],
    filterMode: "equals",
    label: "Trạng thái",
  },
}
```

## Config advanced filter

| Option | Default | Dùng khi nào | Ghi chú |
| --- | --- | --- | --- |
| `enableAdvancedFilter` | `false` | Bảng cần nhiều điều kiện AND/OR | Tính năng nặng, chưa cần cho CRUD cơ bản. |
| `defaultAdvancedFilter` | `{ logic: "and", rules: [] }` trong hook con | Initial uncontrolled | Dùng khi muốn mở table với filter nâng cao sẵn. |
| `advancedFilter` | `undefined` | Controlled advanced filter | Đi kèm `onAdvancedFilterChange`. |
| `onAdvancedFilterChange` | `undefined` | Lưu advanced filter ra ngoài | Cần nếu muốn sync URL/API. |

Lưu ý: advanced filter hiện là client-side nếu không tự map sang API. Với `manualFiltering`, cần cân nhắc backend có hỗ trợ không.

## Config pagination

| Option | Default | Dùng khi nào | Ghi chú |
| --- | --- | --- | --- |
| `enablePagination` | `true` | Bật pagination | Nếu tắt, table render toàn bộ rows model. |
| `positionPagination` | `"bottom"` | Vị trí pagination | `"top"`, `"bottom"`, `"both"`, `"none"`. |
| `paginationDisplayMode` | `"default"` | Kiểu controls | `"default"`, `"pages"`, `"custom"`. |
| `pageSizeOptions` | Prop của `<DataTable>` | Chọn page size | Không nằm trong `useDataTable`, truyền vào component render. |

Với backend pagination: bật `manualPagination: true`, truyền `pageCount`, controlled `pagination`.

## Config column actions/layout

| Option | Default | Dùng khi nào | Ghi chú |
| --- | --- | --- | --- |
| `enableColumnActions` | `true` | Hiện menu header/view options | Menu có sort/filter/hide/group/pin tùy feature. |
| `renderColumnActionsMenuItems` | `undefined` | Thêm item vào menu cột | Dùng khi có action riêng theo cột. |
| `enableColumnOrdering` | `false` | Kéo thả đổi thứ tự cột | Tính năng nâng cao, cần DnD. |
| `enableColumnPinning` | `false` | Pin trái/phải | Hữu ích cho bảng nhiều cột. |
| `enableColumnResizing` | `false` | Kéo resize cột | Hữu ích cho bảng rộng. |
| `enableColumnAutosize` | `enableColumnResizing` | Double click fit width | Chỉ có ý nghĩa khi resize bật. |
| `enableStickyHeader` | `true` | Header sticky trong surface | Nên giữ cho table scroll. |
| `enableStickyFooter` | `true` | Footer sticky | Chỉ thấy khi column có footer. |

Imperative helpers nằm ở `table.cnTable`:

```tsx
table.cnTable.autoSizeColumn("name")
table.cnTable.autoSizeAllColumns()
```

## Config row selection/actions

| Option | Default | Dùng khi nào | Ghi chú |
| --- | --- | --- | --- |
| `enableRowSelection` | `false` trừ khi truyền TanStack option | Chọn row/bulk action | Hook đọc từ `tableOptions.enableRowSelection`. |
| `selectAllMode` | `"page"` | Header checkbox chọn phạm vi nào | `"page"` hoặc `"all"`. |
| `enableSelectAll` | `true` | Hiện checkbox select all | Tắt nếu chỉ cho chọn từng row. |
| `positionToolbarAlertBanner` | `"top"` | Vị trí banner báo selected rows | `"top"`, `"bottom"`, `"none"`. |
| `renderRowActions` | `undefined` | Inject action column inline | Trả ReactNode trong cell action. |
| `renderRowActionMenuItems` | `undefined` | Inject action column dạng menu | Trả menu items, table tự render kebab column. |
| `positionActionsColumn` | `"last"` | Vị trí action column | `"first"` hoặc `"last"`. |
| `renderCellActionMenuItems` | `undefined` | Menu action theo cell | Ít dùng. |

Nếu màn đã tự có column actions trong `columns`, không cần `renderRowActions`.

Selection là UI state của module, không thuộc `useTableQueryState`. Khi cần chọn nhiều dòng, tự quản lý local:

```tsx
const [rowSelection, setRowSelection] = useState<RowSelectionState>({})

const table = useDataTable({
  // ...
  state: {
    ...queryState,
    rowSelection,
  },
  enableRowSelection: true,
  onRowSelectionChange: setRowSelection,
})
```

## Config row ordering/numbers/pinning

| Option | Default | Dùng khi nào | Ghi chú |
| --- | --- | --- | --- |
| `enableRowNumbers` | `false` | Hiện STT | Inject cột row number. |
| `rowNumberMode` | `"static"` | Cách tính STT | `"static"` theo view/page, `"original"` theo source index. |
| `enableRowPinning` | `false` | Pin row lên trên | Dùng kèm row number column. |
| `enableRowOrdering` | `false` | Kéo thả sắp xếp row | Inject row drag column. |
| `onRowOrderChange` | `undefined` | Xử lý reorder | Consumer phải tự reorder data hoặc gọi API. |

Lưu ý: row ordering không phù hợp với row virtualization.

## Config grouping/expanding/detail

| Option | Default | Dùng khi nào | Ghi chú |
| --- | --- | --- | --- |
| `enableGrouping` | `false` | Group rows theo cột | Bật grouped row model và drop zone. |
| `positionToolbarDropZone` | `"top"` | Vị trí drop-to-group zone | `"top"`, `"bottom"`, `"both"`, `"none"`. |
| `enableExpanding` | Auto | Tree rows/detail panel/grouping | Auto bật khi có `renderDetailPanel`, `getSubRows`, hoặc grouping. |
| `renderDetailPanel` | `undefined` | Expand row để xem chi tiết | Tự inject expand column. |
| `positionExpandColumn` | `"first"` | Vị trí expand column | `"first"` hoặc `"last"`. |

Auto behavior:

- Có `renderDetailPanel` hoặc `getSubRows`: cần expand column.
- Có `enableGrouping`: bật expanded row model nhưng grouped rows tự có chevron trong grouped cell.

## Config editing/create row

| Option | Default | Dùng khi nào | Ghi chú |
| --- | --- | --- | --- |
| `enableEditing` | `false` | Edit trực tiếp trong table | Không cần nếu CRUD dùng dialog/form ngoài. |
| `editDisplayMode` | `"cell"` | Kiểu edit | `"cell"`, `"row"`, `"table"`, `"modal"`, `"custom"`. |
| `createDisplayMode` | `"modal"` | Kiểu create row | `"modal"`, `"row"`, `"custom"`. |
| `createRowDefaults` | `undefined` | Giá trị mặc định khi create | Seed vào `rowDraft`. |
| `onEditCellSave` | `undefined` | Save cell edit | Dùng với cell edit. |
| `onSaveRow` | `undefined` | Save row/modal edit | Nhận `values` và `exit`. |
| `onCreateRow` | `undefined` | Save create row | Nhận `values` và `exit`. |

Column edit phụ thuộc `columnDef.meta`:

```tsx
meta: {
  enableEditing: true,
  editVariant: "select",
  editSelectOptions: statusOptions,
  validate: (value) => (!value ? "Bắt buộc" : undefined),
}
```

Imperative helpers:

```tsx
table.cnTable.beginCreate()
table.cnTable.beginRowEdit(row)
table.cnTable.cancelEdit()
table.cnTable.setRowDraftValue("status", "ACTIVE")
```

## Config click/copy/events

| Option | Default | Dùng khi nào | Ghi chú |
| --- | --- | --- | --- |
| `enableClickToCopy` | `false` | Copy value khi click cell | Có thể override từng cột bằng `meta.enableClickToCopy`. |
| `onRowClick` | `undefined` | Click row | Nhận `{ row, table, event }`. |
| `onRowDoubleClick` | `undefined` | Double click row | Nhận `{ row, table, event }`. |
| `onCellClick` | `undefined` | Click cell | Nhận `{ cell, row, table, event }`. |
| `onCellDoubleClick` | `undefined` | Double click cell | Nhận `{ cell, row, table, event }`. |
| `enableKeyboardNavigation` | `true` | Arrow-key focus trong grid | Có thể tắt nếu không cần. |

## Config virtualization

| Option | Default | Dùng khi nào | Ghi chú |
| --- | --- | --- | --- |
| `enableRowVirtualization` | `false` | Nhiều rows client-side | Surface cần chiều cao giới hạn. |
| `enableColumnVirtualization` | `false` | Rất nhiều cột | Không nên dùng chung pinning/ordering. |
| `estimateRowHeight` | `52` | Ước lượng chiều cao row | Dùng cho row virtualizer. |
| `virtualOverscan` | `8` | Render dư rows/columns quanh viewport | Tăng nếu scroll thấy trắng. |
| `rowVirtualizerOptions` | `undefined` | Override virtualizer options | Object hoặc function `({ table }) => options`. |
| `columnVirtualizerOptions` | `undefined` | Override column virtualizer options | Object hoặc function. |
| `rowVirtualizerInstanceRef` | `undefined` | Điều khiển virtualizer | Ví dụ `scrollToIndex`. |
| `columnVirtualizerInstanceRef` | `undefined` | Điều khiển column virtualizer | Ít dùng. |

Với server-side page size 10-50 như Users/Roles, không cần virtualization.

## Config export

| Option | Default | Dùng khi nào | Ghi chú |
| --- | --- | --- | --- |
| `enableExport` | `false` | Hiện menu export | Users/Roles đang bật. |
| `exportFileName` | `"export"` trong export util/menu | Tên file không gồm extension | Ví dụ `"users"`, `"roles"`. |

Lưu ý server-side: export scope `"all"` chỉ là toàn bộ rows mà table đang có trong client, không phải toàn bộ data trong database nếu API chỉ trả một page.

## Các field quan trọng trong `table.cnTable`

Sau khi gọi `useDataTable`, hook gắn config vào instance:

```tsx
table.cnTable
```

Các field thường dùng:

| Field | Ý nghĩa |
| --- | --- |
| `density`, `setDensity` | Đọc/set density. |
| `isFullscreen`, `setIsFullscreen` | Đọc/set fullscreen. |
| `showColumnFilters`, `setShowColumnFilters` | Đọc/set filter row. |
| `globalFilterMode`, `setGlobalFilterMode` | Đọc/set global filter mode. |
| `advancedFilter`, `setAdvancedFilter` | Đọc/set advanced filter. |
| `showAdvancedFilterPanel`, `setShowAdvancedFilterPanel` | Đọc/set panel nâng cao. |
| `beginCreate`, `beginRowEdit`, `cancelEdit` | Điều khiển editing/create. |
| `rowDraft`, `setRowDraftValue` | Draft values trong edit/create. |
| `autoSizeColumn`, `autoSizeAllColumns` | Autosize column. |
| `refs.tableContainerRef` | Scroll container. |
| `refs.searchInputRef` | Input global search. |

## Preset khuyến nghị

### Admin CRUD đơn giản

```tsx
const table = useDataTable({
  data,
  columns,
  pageCount,
  state,
  getRowId: (row) => row.id,
  manualPagination: true,
  manualSorting: true,
  manualFiltering: true,
  enableRowSelection: true,
  enableGlobalFilter: true,
  enableGlobalFilterModes: false,
  enableColumnFilters: true,
  enableColumnFilterModes: false,
  enableAdvancedFilter: false,
  enableGrouping: false,
  enableRowOrdering: false,
  enableColumnOrdering: false,
  enableColumnPinning: false,
  enableRowVirtualization: false,
  enableColumnVirtualization: false,
  enableEditing: false,
  enableExport: true,
  isLoading,
  showLoadingOverlay: isFetching,
})
```

### Bảng nhiều cột

```tsx
const table = useDataTable({
  data,
  columns,
  enableColumnActions: true,
  enableColumnResizing: true,
  enableColumnAutosize: true,
  enableColumnPinning: true,
  enableStickyHeader: true,
})
```

### Bảng client-side nhiều rows

```tsx
const table = useDataTable({
  data,
  columns,
  enableRowVirtualization: true,
  estimateRowHeight: 52,
  virtualOverscan: 8,
})

return <DataTable table={table} surfaceClassName="max-h-[640px]" />
```

## Checklist chọn config

- API đã phân trang chưa? Nếu có, bật `manualPagination` và truyền `pageCount`.
- API đã sort/filter chưa? Nếu có, bật `manualSorting`/`manualFiltering`.
- Có cần chọn nhiều dòng không? Nếu có, bật `enableRowSelection`.
- Có filter theo cột không? Nếu chỉ có vài cột, khai báo `meta.variant/options` ở cột đó.
- Có cần export không? Nếu có, bật `enableExport`, nhưng kiểm tra export page/all có đúng kỳ vọng không.
- Có đang dùng dialog CRUD ngoài table không? Nếu có, để `enableEditing: false`.
- Có thật sự cần grouping/DnD/virtualization không? Nếu chưa, để tắt.
- Toolbar có quá nhiều nút không? Tắt `enableColumnFilterModes`, `enableGlobalFilterModes`, `enableDensityToggle`, `enableFullscreenToggle` trước.
