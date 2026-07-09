# Data Table Feature Audit

Tài liệu này dùng để hiểu nhanh component `components/ui/data-table` đang làm gì, tính năng nào là lõi, tính năng nào là mở rộng, và phần nào có thể cân nhắc bỏ bớt nếu muốn giảm độ phức tạp.

## Mục tiêu của component

`data-table` là một wrapper nâng cao quanh `@tanstack/react-table`.

Thay vì chỉ render bảng, component này đang gom nhiều nhóm trách nhiệm:

- Tạo table instance qua `useDataTable`.
- Render UI table qua `DataTable`.
- Quản lý toolbar, search, filter, pagination, export.
- Tự inject các cột hệ thống như select, action, row number, row drag, expand.
- Quản lý nhiều trạng thái UI riêng trong `table.cnTable`.
- Hỗ trợ các tính năng nâng cao như editing, grouping, pinning, resizing, virtualization.

Điểm cần lưu ý: component này đang giống một "table framework" nội bộ hơn là một UI component nhỏ.

## Cấu trúc thư mục

| Khu vực | Vai trò |
| --- | --- |
| `core/` | API lõi: `DataTable`, `useDataTable`, types, localization, icons, config provider. |
| `components/body/` | Render body row/cell, empty state, skeleton, footer, click-to-copy, row DnD. |
| `components/head/` | Header, filter row, column header, filter variants. |
| `components/toolbar/` | Top/bottom toolbar, pagination, global search, grouping zone, view options, alert banner. |
| `components/menus/` | Column actions, export menu, filter mode menu, advanced filter panel. |
| `components/editing/` | Inline cell edit, row/create edit, modal edit. |
| `hooks/` | State phụ trợ: editing, filter modes, global filter mode, DnD, virtualizers, grid navigation. |
| `fns/` | Filter functions, filter factories, advanced filter, ranked search row model. |
| `injected-columns/` | Các cột tự thêm vào table: selection, actions, expand, row number, row drag. |
| `utils/` | Export CSV/Excel, column style helpers. |
| `helpers/` | Helper lấy key/label, mode filter, đo width, kiểm tra editable. |
| `docs/` | Tài liệu sử dụng và audit tính năng. |

## Public API hiện có

Export chính từ `index.ts`:

- `DataTable`
- `useDataTable`
- `DataTableConfigProvider`
- `useDataTableConfigContext`
- `defaultIcons`
- `defaultLocalization`
- `exportToCsv`
- `exportToExcel`
- Các type public như `UseDataTableOptions`, `DataTableInstance`, `FilterVariant`, `FilterMode`, `AdvancedFilterGroup`, `Density`, `EditDisplayMode`.

API thực tế có 2 lớp:

- TanStack options: `data`, `columns`, `state`, `manualPagination`, `manualSorting`, `manualFiltering`, `getRowId`, `pageCount`, `meta`, ...
- UI options riêng: `enableExport`, `enableColumnFilters`, `enableEditing`, `enableGrouping`, `enableColumnResizing`, `positionGlobalFilter`, ...

## Luồng hoạt động chính

1. Màn hình gọi `useDataTable({ data, columns, ...options })`.
2. `useDataTable` merge config mặc định, config provider và options của màn hình.
3. Hook tạo thêm các state UI như density, fullscreen, filter mode, advanced filter, editing draft.
4. Hook inject thêm cột hệ thống nếu cần, ví dụ selection/action/expand/row number.
5. Hook gọi `useReactTable` của TanStack.
6. Hook gắn config nội bộ vào `table.cnTable`.
7. Màn hình render `<DataTable table={table} />`.
8. `DataTable` đọc `table.cnTable` để render toolbar, surface, header, body, footer, pagination, modal edit.

## Tính năng đang dùng trong project

Theo tìm kiếm hiện tại, `components/ui/data-table` đang được dùng ở:

- `modules/users`
- `modules/roles`

Hai màn này đang dùng các nhóm sau:

| Tính năng | Users | Roles | Ghi chú |
| --- | --- | --- | --- |
| Server-side pagination | Có | Có | `manualPagination: true`, `pageCount`. |
| Server-side sorting | Có | Có | `manualSorting: true`. |
| Server-side filtering/search | Có | Có | `manualFiltering: true`, global search qua query state. |
| Row selection | Có | Có | `enableRowSelection: true`. |
| Global search | Có | Có | `enableGlobalFilter: true`. |
| Column filter | Có | Tắt | Users filter `activityStatus`; Roles tắt. |
| Column filter mode menu | Tắt | Tắt | `enableColumnFilterModes: false`. |
| Export | Có | Có | `enableExport: true`. |
| Loading overlay | Có | Có | `isLoading`, `showLoadingOverlay`. |
| Editing trong table | Tắt | Không dùng | CRUD form nằm ngoài table. |
| Grouping | Không dùng | Không dùng | Chưa thấy màn dùng. |
| Row ordering | Không dùng | Không dùng | Chưa thấy màn dùng. |
| Column ordering/pinning/resizing | Không bật | Không bật | Chưa thấy màn dùng. |
| Virtualization | Không dùng | Không dùng | Chưa thấy màn dùng. |
| Advanced filter | Không dùng | Không dùng | Chưa thấy màn dùng. |

Kết luận ngắn: nhu cầu hiện tại là bảng admin server-side cơ bản, không phải full spreadsheet/grid.

## Danh sách tính năng đầy đủ

### 1. Core table

| Tính năng | Option/API | File chính | Mức cần thiết |
| --- | --- | --- | --- |
| Tạo TanStack instance | `useDataTable` | `core/use-data-table.ts` | Lõi |
| Render table | `DataTable` | `core/data-table.tsx` | Lõi |
| Public type/API | `index.ts`, `core/types.ts` | `index.ts`, `core/types.ts` | Lõi |
| Config global | `DataTableConfigProvider` | `core/config-context.tsx` | Có thể giữ |
| Localization | `localization` | `core/localization.ts` | Nên giữ |
| Custom icons | `icons` | `core/icons.tsx` | Có thể giữ |

### 2. Pagination và server-side mode

| Tính năng | Option/API | File chính | Mức cần thiết |
| --- | --- | --- | --- |
| Pagination UI | `enablePagination`, `pageSizeOptions` | `components/toolbar/data-table-pagination.tsx` | Lõi hiện tại |
| Vị trí pagination | `positionPagination` | `core/data-table.tsx`, `data-table-bottom-toolbar.tsx` | Có thể đơn giản hóa |
| Kiểu pagination pages/default/custom | `paginationDisplayMode` | `data-table-pagination.tsx` | Có thể bỏ bớt nếu chỉ dùng default |
| Manual pagination | TanStack `manualPagination`, `pageCount` | `core/use-data-table.ts` | Lõi hiện tại |

### 3. Search và filter

| Tính năng | Option/API | File chính | Mức cần thiết |
| --- | --- | --- | --- |
| Global search | `enableGlobalFilter` | `data-table-global-filter.tsx` | Lõi hiện tại |
| Global filter modes | `enableGlobalFilterModes`, `defaultGlobalFilterMode` | `use-global-filter-mode.ts`, `filter-fns.ts` | Có thể đơn giản hóa |
| Ranked fuzzy results | `enableGlobalFilterRankedResults` | `ranked-row-model.ts` | Có thể bỏ nếu backend search là chính |
| Column filters | `enableColumnFilters`, `meta.variant` | `data-table-column-filter.tsx` | Cần cho Users |
| Filter variants | `text`, `select`, `multi-select`, `checkbox`, `range`, `range-slider`, `date`, `date-range` | `components/head/filter-variants/` | Có thể giữ subset |
| Column filter mode menu | `enableColumnFilterModes` | `data-table-filter-mode-menu.tsx` | Có thể bỏ/tắt mặc định |
| Advanced filter panel | `enableAdvancedFilter` | `data-table-filter-panel.tsx`, `advanced-filter.ts` | Ứng viên bỏ mạnh |
| Highlight match | `enableFilterMatchHighlighting` | `render-body-cell.tsx`, `highlight.tsx` | Nice-to-have |
| Faceted values | `enableFacetedValues` | `core/use-data-table.ts` | Có thể tắt khi server-side |

### 4. Toolbar

| Tính năng | Option/API | File chính | Mức cần thiết |
| --- | --- | --- | --- |
| Top toolbar | `enableTopToolbar` | `data-table-toolbar.tsx` | Lõi |
| Bottom toolbar | `enableBottomToolbar` | `data-table-bottom-toolbar.tsx` | Lõi nếu dùng pagination |
| Toolbar custom actions | `renderToolbarActions` | `data-table-toolbar.tsx` | Nên giữ |
| Replace toolbar | `renderTopToolbar`, `renderBottomToolbar` | toolbar files | Có thể bỏ nếu không cần escape hatch |
| Internal actions cluster | `enableToolbarInternalActions` | `data-table-toolbar.tsx` | Có thể giữ |
| Density toggle | `enableDensityToggle`, `density` | `density-toggle.tsx` | Nice-to-have |
| Fullscreen toggle | `enableFullscreenToggle`, `isFullscreen` | `fullscreen-toggle.tsx` | Nice-to-have |
| View options/column visibility | `enableColumnActions` | `data-table-view-options.tsx` | Có thể giữ nếu nhiều cột |
| Selection alert banner | `positionToolbarAlertBanner` | `data-table-alert-banner.tsx` | Có thể giữ |

### 5. Columns

| Tính năng | Option/API | File chính | Mức cần thiết |
| --- | --- | --- | --- |
| Column actions menu | `enableColumnActions` | `data-table-column-actions.tsx` | Có thể giữ |
| Column visibility | TanStack column visibility | `data-table-view-options.tsx` | Có thể giữ |
| Column ordering DnD | `enableColumnOrdering` | `use-table-dnd.ts`, header DnD | Ứng viên bỏ nếu không dùng |
| Column pinning | `enableColumnPinning` | `column-styles.ts`, column actions | Ứng viên bỏ nếu không dùng |
| Column resizing | `enableColumnResizing` | `column-resize-handle.tsx`, `column-styles.ts` | Có thể giữ nếu cần UX bảng rộng |
| Column autosize | `enableColumnAutosize` | `measure-column-width.ts` | Nice-to-have |
| Sticky header | `enableStickyHeader` | `data-table-header.tsx` | Nên giữ |
| Sticky footer | `enableStickyFooter` | `data-table-footer.tsx` | Có thể bỏ nếu không dùng footer |

### 6. Rows

| Tính năng | Option/API | File chính | Mức cần thiết |
| --- | --- | --- | --- |
| Row selection | `enableRowSelection`, `selectAllMode`, `enableSelectAll` | `selection-column.tsx` | Lõi hiện tại |
| Row actions column | `renderRowActions`, `renderRowActionMenuItems` | `data-table-row-actions.tsx` | Nên giữ nếu muốn chuẩn hóa actions |
| Row numbers | `enableRowNumbers`, `rowNumberMode` | `row-number-column.tsx` | Nice-to-have |
| Row pinning | `enableRowPinning` | `row-number-column.tsx` | Ứng viên bỏ |
| Row ordering DnD | `enableRowOrdering`, `onRowOrderChange` | `row-drag-column.tsx`, `body/dnd/` | Ứng viên bỏ mạnh |
| Row click events | `onRowClick`, `onRowDoubleClick` | `data-table-body.tsx` | Có thể giữ |
| Cell click events | `onCellClick`, `onCellDoubleClick` | `data-table-body.tsx` | Có thể giữ |
| Keyboard navigation | `enableKeyboardNavigation` | `use-grid-navigation.ts` | Nice-to-have |

### 7. Editing và create row

| Tính năng | Option/API | File chính | Mức cần thiết |
| --- | --- | --- | --- |
| Cell edit | `enableEditing`, `editDisplayMode: "cell"` | `data-table-edit-cell.tsx` | Ứng viên bỏ nếu CRUD dùng form ngoài |
| Row edit | `editDisplayMode: "row"` | editing components | Ứng viên bỏ |
| Modal edit | `editDisplayMode: "modal"` | `data-table-edit-modal.tsx` | Ứng viên bỏ nếu đã có dialog riêng |
| Table/custom edit mode | `editDisplayMode: "table"`, `"custom"` | types/state | Ứng viên bỏ hoặc chưa hoàn thiện |
| Create row | `createDisplayMode`, `onCreateRow` | `data-table-create-row.tsx`, modal | Ứng viên bỏ |
| Edit field variants | `text`, `number`, `select` | `data-table-edit-field.tsx` | Chỉ cần nếu giữ editing |
| Per-column validation | `meta.validate` | edit components | Chỉ cần nếu giữ editing |

Hiện Users/Roles đều dùng dialog/form ngoài table, nên editing nội bộ là nhóm có thể tách hoặc bỏ đầu tiên.

### 8. Grouping, expanding, detail panel

| Tính năng | Option/API | File chính | Mức cần thiết |
| --- | --- | --- | --- |
| Grouping | `enableGrouping` | `data-table-grouping.tsx`, `getGroupedRowModel` | Ứng viên bỏ mạnh |
| Drop-to-group zone | `positionToolbarDropZone` | `data-table-grouping.tsx` | Chỉ cần nếu giữ grouping |
| Aggregated/grouped cell render | `meta.renderGroupedCell`, `meta.renderAggregatedCell` | `render-body-cell.tsx` | Chỉ cần nếu giữ grouping |
| Tree rows/sub rows | `getSubRows`, `enableExpanding` | `expand-column.tsx` | Có thể giữ nếu roadmap cần tree |
| Detail panel | `renderDetailPanel` | `data-table-body.tsx` | Có thể giữ nếu cần expandable detail |

### 9. Virtualization

| Tính năng | Option/API | File chính | Mức cần thiết |
| --- | --- | --- | --- |
| Row virtualization | `enableRowVirtualization` | `use-table-virtualizers.tsx` | Chỉ cần bảng rất lớn client-side |
| Column virtualization | `enableColumnVirtualization` | `use-table-virtualizers.tsx` | Chỉ cần bảng rất nhiều cột |
| Virtualizer refs/options | `rowVirtualizerOptions`, `columnVirtualizerOptions`, refs | `core/types.ts` | Chỉ cần nếu giữ virtualization |

Vì Users/Roles đang server-side paginate page size 10-50, virtualization hiện chưa cần.

### 10. Export

| Tính năng | Option/API | File chính | Mức cần thiết |
| --- | --- | --- | --- |
| Export menu | `enableExport`, `exportFileName` | `data-table-export-menu.tsx` | Đang dùng |
| CSV export | `exportToCsv` | `export-utils.ts` | Đang dùng qua menu |
| Excel export | `exportToExcel` | `export-utils.ts` | Đang dùng qua menu |
| Export scopes | `selected`, `filtered`, `all`, `page` | `export-utils.ts` | Có thể đơn giản hóa |

Điểm cần kiểm tra thêm: với server-side pagination, scope `all` có thể gây hiểu nhầm vì table chỉ có data của page hiện tại nếu backend không cấp toàn bộ rows.

### 11. Loading, empty state, copy

| Tính năng | Option/API | File chính | Mức cần thiết |
| --- | --- | --- | --- |
| Progress bar | `showProgressBars`, `isLoading`, `isSaving` | `core/data-table.tsx` | Có thể giữ |
| Skeleton rows | `showSkeletons` | `skeleton-rows.tsx` | Có thể giữ |
| Loading overlay | `showLoadingOverlay` | `core/data-table.tsx` | Đang dùng |
| Empty state | `renderEmpty` | `data-table-body.tsx` | Nên giữ |
| Click to copy | `enableClickToCopy`, `meta.enableClickToCopy` | `click-to-copy.tsx` | Nice-to-have |

## Nhóm tính năng nên giữ cho admin CRUD hiện tại

Nếu mục tiêu là đơn giản hóa để phục vụ các màn admin như Users/Roles, nên giữ bộ lõi sau:

- `useDataTable` và `DataTable`.
- Manual pagination/sorting/filtering.
- Global search.
- Column filter dạng cơ bản: `text`, `select`, có thể thêm `date-range` nếu API dùng nhiều ngày.
- Row selection.
- Row actions hoặc action column tự viết.
- Export CSV/Excel.
- Loading/skeleton/empty state.
- Column visibility nếu bảng nhiều cột.
- Sticky header.
- Localization.

Config gợi ý:

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
    rowSelection,
  },
  getRowId: (row) => row.id,
  manualPagination: true,
  manualSorting: true,
  manualFiltering: true,
  enableRowSelection: true,
  enableGlobalFilter: true,
  enableColumnFilters: true,
  enableColumnFilterModes: false,
  enableExport: true,
  isLoading,
  showLoadingOverlay: isFetching,
})
```

## Nhóm có thể tắt mặc định

Các tính năng này có thể giữ trong code nhưng không nên bật mặc định:

- `enableColumnFilterModes`
- `enableGlobalFilterModes`
- `enableDensityToggle`
- `enableFullscreenToggle`
- `enableColumnResizing`
- `enableColumnPinning`
- `enableColumnOrdering`
- `enableRowNumbers`
- `enableClickToCopy`
- `enableFilterMatchHighlighting`
- `enableKeyboardNavigation`

Lý do: chúng làm UI nhiều nút hơn, khiến người dùng khó biết bắt đầu từ đâu, nhưng vẫn có giá trị cho một vài bảng đặc biệt.

## Nhóm nên cân nhắc tách khỏi component chính

Các nhóm này làm code phình lớn và hiện chưa thấy nhu cầu thực tế trong Users/Roles:

- Editing/create row nội bộ table.
- Advanced filter panel.
- Grouping và drop-to-group zone.
- Row ordering DnD.
- Row pinning.
- Column virtualization.
- Row virtualization.
- Ranked fuzzy result client-side.

Nếu chưa muốn xóa ngay, có thể tách thành module/plugin nội bộ:

- `data-table/editing`
- `data-table/grouping`
- `data-table/virtualization`
- `data-table/advanced-filter`
- `data-table/dnd`

Sau đó `useDataTable` lõi chỉ giữ table state phổ thông, còn feature nâng cao được bật qua wrapper riêng.

## Thứ tự cắt giảm đề xuất

### Bước 1: Giảm nhiễu UI, ít rủi ro

- Tắt `enableColumnFilterModes` mặc định trong các màn admin.
- Tắt global filter mode menu nếu không cần đổi giữa fuzzy/contains.
- Tắt density/fullscreen nếu người dùng không dùng.
- Giữ column visibility/export/search/pagination.

Rủi ro thấp vì hầu như chỉ thay đổi nút hiển thị.

### Bước 2: Chuẩn hóa preset

Tạo preset dùng chung cho CRUD:

```ts
const adminCrudTableDefaults = {
  manualPagination: true,
  manualSorting: true,
  manualFiltering: true,
  enableRowSelection: true,
  enableGlobalFilter: true,
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
}
```

Cách này giúp màn mới không cần đọc toàn bộ option list.

### Bước 3: Tách hoặc xóa feature chưa dùng

Ưu tiên theo độ phức tạp:

1. Advanced filter.
2. Editing/create row nội bộ.
3. Grouping/drop zone.
4. Row ordering DnD.
5. Virtualization.
6. Column ordering/pinning nếu không có yêu cầu UX cụ thể.

Trước khi xóa, nên `rg` toàn repo theo option tương ứng để chắc không có màn nào đang dùng.

## Decision matrix

| Nhóm | Giữ | Tắt mặc định | Tách module | Xóa nếu không dùng |
| --- | --- | --- | --- | --- |
| Core render/hook | Có | Không | Không | Không |
| Pagination server-side | Có | Không | Không | Không |
| Global search | Có | Không | Không | Không |
| Column filter basic | Có | Không | Không | Không |
| Row selection | Có | Không | Không | Không |
| Export | Có | Không | Không | Không |
| Loading/empty | Có | Không | Không | Không |
| Column visibility/actions | Có | Có thể | Không | Không vội |
| Density/fullscreen | Có thể | Có | Không | Có thể |
| Filter mode menus | Có thể | Có | Không | Có thể |
| Advanced filter | Không cần hiện tại | Có | Có | Có |
| Editing/create row | Không cần hiện tại | Có | Có | Có |
| Grouping | Không cần hiện tại | Có | Có | Có |
| Row ordering/pinning | Không cần hiện tại | Có | Có | Có |
| Virtualization | Không cần hiện tại | Có | Có | Có |

## Checklist khi đánh giá một tính năng có nên giữ

- Có màn nào đang bật option đó không?
- Người dùng cuối có thấy tính năng này trong UI không?
- Nếu bỏ, CRUD Users/Roles có hỏng không?
- Backend có hỗ trợ dữ liệu cần thiết không, ví dụ export all, faceted values, advanced filter?
- Tính năng có làm toolbar/header thêm nút khó hiểu không?
- Có test hoặc story nào bảo vệ tính năng không?
- Có thể thay bằng pattern đơn giản hơn ở màn hình không?

## Tóm tắt quyết định nhanh

Nếu mục tiêu là "bảng admin dễ hiểu, dễ bảo trì", nên xem component này theo 2 tầng:

- Tầng lõi: pagination, search, filter cơ bản, selection, export, loading.
- Tầng nâng cao: editing, grouping, DnD, virtualization, advanced filter, pinning/resizing.

Hiện tại project mới dùng tầng lõi. Tầng nâng cao nên tắt mặc định hoặc tách ra để tránh mỗi màn CRUD phải hiểu quá nhiều option.
