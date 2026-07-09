# Data Table UI Component Guide

Tài liệu này hướng dẫn cách dùng bộ `components/ui/data-table`. Đây là table nâng cao được build trên `@tanstack/react-table`, có thêm toolbar, filter UI, column actions, row selection, editing, export, grouping, pinning, resizing, virtualization và localization.

> Lưu ý: repo hiện cũng có `components/shared/data-table`. Wrapper đó đang được một số màn cũ dùng với `useReactTable` trực tiếp. Khi build màn mới cần tính năng nâng cao, ưu tiên dùng cặp `useDataTable` + `DataTable` từ `@/components/ui/data-table`.

Tài liệu liên quan:

- `use-data-table-config.md`: reference đầy đủ các config trong `useDataTable`.
- `module-table-questionnaire.md`: bộ câu hỏi cần trả lời trước khi tạo module mới có table.
- `data-table-feature-audit.md`: bản đồ tính năng và gợi ý phần có thể tắt/tách/bỏ.

## Public API

Import từ entrypoint:

```tsx
import {
  DataTable,
  DataTableConfigProvider,
  exportToCsv,
  exportToExcel,
  useDataTable,
  type DataTableFilterOption,
  type DataTableInstance,
  type UseDataTableOptions,
} from "@/components/ui/data-table"
```

Các phần chính:

- `useDataTable(options)`: tạo TanStack table instance và gắn thêm config UI vào `table.cnTable`.
- `DataTable`: render table từ instance đã tạo bởi `useDataTable`.
- `DataTableConfigProvider`: cấu hình `icons` và `localization` mặc định cho nhiều table.
- `exportToCsv`, `exportToExcel`: export dữ liệu theo scope `selected`, `filtered`, `all`, hoặc `page`.

## Basic Usage

```tsx
"use client"

import { DataTable, useDataTable } from "@/components/ui/data-table"
import type { ColumnDef } from "@tanstack/react-table"

type UserRow = {
  id: string
  fullName: string
  email: string
  status: "ACTIVE" | "LOCKED" | "BANNED"
}

const columns: ColumnDef<UserRow>[] = [
  {
    accessorKey: "fullName",
    header: "Ho ten",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "status",
    header: "Trang thai",
    meta: {
      variant: "select",
      options: [
        { label: "Active", value: "ACTIVE" },
        { label: "Locked", value: "LOCKED" },
        { label: "Banned", value: "BANNED" },
      ],
    },
  },
]

export function UsersTable({ data }: { data: UserRow[] }) {
  const table = useDataTable({
    data,
    columns,
    getRowId: (row) => row.id,
    initialState: {
      pagination: { pageSize: 10 },
    },
  })

  return <DataTable table={table} pageSizeOptions={[10, 20, 50]} />
}
```

`DataTable` nhận các props chính:

- `table`: instance trả về từ `useDataTable`.
- `pageSizeOptions`: danh sách page size cho pagination.
- `surfaceClassName`: class cho vùng scroll table, thường dùng để set chiều cao.
- Các props còn lại là props của `div` root.

## Column Meta

Component mở rộng `ColumnDef.meta` của TanStack. Dùng `meta` để cấu hình UI theo từng cột:

```tsx
{
  accessorKey: "createdAt",
  header: "Ngay tao",
  meta: {
    variant: "date-range",
    filterMode: "betweenDates",
    align: "center",
    label: "Ngay tao",
  },
}
```

Các field thường dùng:

- `variant`: loại filter UI. Hỗ trợ `text`, `select`, `multi-select`, `checkbox`, `range`, `range-slider`, `date`, `date-range`.
- `options`: danh sách option cho `select` hoặc `multi-select`.
- `filterMode`: mode filter mặc định của cột.
- `enableColumnFilterModes`: bật/tắt menu đổi filter mode riêng cho cột.
- `columnFilterModeOptions`: giới hạn các mode được chọn.
- `renderColumnFilter`: custom filter UI cho cột.
- `enableEditing`: bật/tắt editing cho cột.
- `editVariant`: editor inline, gồm `text`, `number`, `select`.
- `editSelectOptions`: option cho editor `select`.
- `renderEditCell`: custom editor.
- `validate`: validate giá trị edit, trả về message lỗi hoặc `undefined`.
- `enableClickToCopy`: bật copy nhanh trên cell.
- `align`: `left`, `center`, `right`.
- `disableHighlight`: không highlight text match filter.
- `disableColumnActions`: ẩn menu actions ở header.
- `label`: nhãn dùng trong menu khi `header` không phải string.

## Filters

Table có 3 lớp filter:

- Global search trong toolbar.
- Column filter theo từng cột.
- Advanced filter panel, nếu bật `enableAdvancedFilter`.

Filter variants:

| Variant | Giá trị phù hợp | Ghi chú |
| --- | --- | --- |
| `text` | string | Default nếu không khai báo `meta.variant`. |
| `select` | string | Dùng `meta.options`, nếu thiếu có thể lấy faceted unique values. |
| `multi-select` | string | Dùng nhiều option. |
| `checkbox` | boolean | Dùng filter boolean. |
| `range` | number | Nhập min/max. |
| `range-slider` | number | Slider min/max, cần faceted min/max để UX tốt. |
| `date` | date/string date | Filter trước/sau/bằng ngày. |
| `date-range` | date/string date | Filter khoảng ngày. |

Filter modes public:

- Text/global: `fuzzy`, `contains`, `startsWith`, `endsWith`, `equals`, `notEquals`.
- Empty check: `empty`, `notEmpty`.
- Number: `between`, `betweenInclusive`, `greaterThan`, `greaterThanOrEqualTo`, `lessThan`, `lessThanOrEqualTo`.
- Date: `before`, `after`, `betweenDates`.
- Fixed internal modes: `equalsString`, `arrIncludesSome`, `equalsBool`.

Bật filter row mặc định:

```tsx
const table = useDataTable({
  data,
  columns,
  defaultShowColumnFilters: true,
  enableColumnFilterModes: true,
})
```

Bật advanced filter:

```tsx
const table = useDataTable({
  data,
  columns,
  enableAdvancedFilter: true,
})
```

Với API server-side, thường bật `manualFiltering: true` và tự map `columnFilters`, `globalFilter` sang query API. Khi `manualFiltering` bật, table không tự filter client-side.

## Server-side Pagination, Sorting, Filtering

Mẫu dùng với API phân trang:

```tsx
"use client"

import * as React from "react"
import { DataTable, useDataTable } from "@/components/ui/data-table"
import type {
  ColumnDef,
  ColumnFiltersState,
  PaginationState,
  SortingState,
} from "@tanstack/react-table"

type ProductRow = {
  id: string
  name: string
  status: string
  createdAt: string
}

export function ProductsTable({
  rows,
  totalPages,
  isLoading,
}: {
  rows: ProductRow[]
  totalPages: number
  isLoading: boolean
}) {
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] =
    React.useState<ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = React.useState("")

  const columns = React.useMemo<ColumnDef<ProductRow>[]>(
    () => [
      { accessorKey: "name", header: "Ten san pham" },
      {
        accessorKey: "status",
        header: "Trang thai",
        meta: {
          variant: "select",
          options: [
            { label: "Active", value: "ACTIVE" },
            { label: "Inactive", value: "INACTIVE" },
          ],
        },
      },
      {
        accessorKey: "createdAt",
        header: "Ngay tao",
        meta: { variant: "date-range" },
      },
    ],
    []
  )

  const table = useDataTable({
    data: rows,
    columns,
    pageCount: totalPages,
    state: {
      pagination,
      sorting,
      columnFilters,
      globalFilter,
    },
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    getRowId: (row) => row.id,
    isLoading,
    enableRowSelection: true,
  })

  return <DataTable table={table} pageSizeOptions={[10, 20, 50]} />
}
```

Khi state thay đổi, hook query nên lấy các giá trị này để gọi API:

- `pagination.pageIndex + 1`: page hiện tại nếu backend dùng base 1.
- `pagination.pageSize`: số dòng mỗi page.
- `sorting[0]?.id`, `sorting[0]?.desc`: sort field và direction.
- `globalFilter`: search keyword.
- `columnFilters`: filter theo cột.

## Standard Query Param Hook

Với các màn admin gọi API theo query params, dùng hook chung:

```tsx
import { useTableQueryState } from "@/hooks/use-table-query-state"
```

Hook này quản lý:

- `pagination`
- `sorting`
- `columnFilters`
- `globalFilter`
- `queryParams`: `{ page, perPage, search, sortBy, sort }`
- các handler query chuẩn cho `useDataTable`: `onPaginationChange`, `onSortingChange`, `onColumnFiltersChange`, `onGlobalFilterChange`

`rowSelection` là UI state của từng module, không nằm trong `useTableQueryState`. Nếu cần chọn nhiều dòng, tạo local state riêng bằng `useState<RowSelectionState>({})`.

`search` trong `queryParams` được debounce mặc định `300ms`. UI input vẫn update ngay qua `globalFilter`, nhưng API query không bị gọi theo từng phím. Có thể đổi bằng `searchDebounceMs`.

Nếu muốn params nằm trên URL, bật `syncUrl: true`. Hook sẽ đọc initial state từ URL và tự `router.replace()` khi state đổi:

```txt
?page=2&perPage=20&search=abc&sortBy=fullName&sort=asc
```

Trong project hiện tại, `sort` dùng string theo `DefaultParamsRequest`: `asc` là ascending, `desc` là descending.

Pattern khuyến nghị:

```tsx
const extraQueryParams = useMemo(
  () => ({
    status,
    roleCode,
  }),
  [roleCode, status]
)

const tableQuery = useTableQueryState({
  initialPageSize: 10,
  searchDebounceMs: 300,
  syncUrl: true,
  extraQueryParams,
})
const [rowSelection, setRowSelection] = useState<RowSelectionState>({})

const params = useMemo(
  () => ({
    ...tableQuery.queryParams,
    status,
    roleCode,
  }),
  [roleCode, status, tableQuery.queryParams]
)

const { data, isLoading, isFetching } = useGetUsers(params)

const table = useDataTable({
  data: data?.data?.items ?? [],
  columns,
  pageCount: data?.data?.pagination?.totalPage ?? 1,
  state: {
    pagination: tableQuery.pagination,
    sorting: tableQuery.sorting,
    columnFilters: tableQuery.columnFilters,
    globalFilter: tableQuery.globalFilter,
    rowSelection,
  },
  onPaginationChange: tableQuery.onPaginationChange,
  onSortingChange: tableQuery.onSortingChange,
  onColumnFiltersChange: tableQuery.onColumnFiltersChange,
  onGlobalFilterChange: tableQuery.onGlobalFilterChange,
  onRowSelectionChange: setRowSelection,
  manualPagination: true,
  manualSorting: true,
  manualFiltering: true,
  enableRowSelection: true,
  isLoading,
  showLoadingOverlay: isFetching,
})
```

Khi có domain filter riêng như `status`, `roleCode`, gọi `tableQuery.resetPage()` sau khi đổi filter để quay về page đầu:

```tsx
const setStatus = (value: UserActivityStatus | undefined) => {
  setStatusRaw(value)
  tableQuery.resetPage()
}
```

Đọc initial domain filter từ URL trong module:

```tsx
const searchParams = useSearchParams()
const [status, setStatusRaw] = useState<UserActivityStatus | undefined>(() => {
  const value = searchParams.get("status")
  return isUserActivityStatus(value) ? value : undefined
})
const [roleCode, setRoleCodeRaw] = useState<string | undefined>(
  () => searchParams.get("roleCode") ?? undefined
)
```

## Row Selection

```tsx
const table = useDataTable({
  data,
  columns,
  enableRowSelection: true,
  selectAllMode: "page",
})
```

Các helper thường dùng:

```tsx
const selectedRows = table.getSelectedRowModel().rows
const selectedIds = selectedRows.map((row) => row.id)
```

`selectAllMode`:

- `page`: checkbox header chọn các dòng ở page hiện tại.
- `all`: checkbox header chọn toàn bộ rows trong model.

## Row Actions

Ưu tiên dùng `renderRowActionMenuItems` để table tự inject cột actions:

```tsx
import { DropdownMenuItem } from "@/components/ui/dropdown-menu"

const table = useDataTable({
  data,
  columns,
  renderRowActionMenuItems: ({ row }) => (
    <>
      <DropdownMenuItem onClick={() => openEdit(row.original)}>
        Chinh sua
      </DropdownMenuItem>
      <DropdownMenuItem
        variant="destructive"
        onClick={() => openDelete(row.original)}
      >
        Xoa
      </DropdownMenuItem>
    </>
  ),
})
```

Nếu cần UI actions inline thay vì menu, dùng `renderRowActions`.

## Editing

Bật edit cell:

```tsx
const table = useDataTable({
  data,
  columns,
  enableEditing: true,
  editDisplayMode: "cell",
  onEditCellSave: ({ row, column, value }) => {
    updateCell(row.original.id, column.id, value)
  },
})
```

Bật edit row/modal:

```tsx
const table = useDataTable({
  data,
  columns,
  enableEditing: true,
  editDisplayMode: "modal",
  onSaveRow: ({ row, values, exit }) => {
    updateRow(row.original.id, values)
    exit()
  },
})
```

Tạo mới row:

```tsx
const table = useDataTable({
  data,
  columns,
  enableEditing: true,
  createDisplayMode: "modal",
  createRowDefaults: {
    status: "ACTIVE",
  },
  onCreateRow: ({ values, exit }) => {
    createRow(values)
    exit()
  },
})

table.cnTable.beginCreate()
```

Column edit config:

```tsx
{
  accessorKey: "status",
  header: "Trang thai",
  meta: {
    enableEditing: true,
    editVariant: "select",
    editSelectOptions: [
      { label: "Active", value: "ACTIVE" },
      { label: "Inactive", value: "INACTIVE" },
    ],
    validate: (value) => (!value ? "Bat buoc chon trang thai" : undefined),
  },
}
```

## Export

Bật menu export trong toolbar:

```tsx
const table = useDataTable({
  data,
  columns,
  enableExport: true,
  exportFileName: "products",
})
```

Hoặc gọi thủ công:

```tsx
exportToCsv(table, { fileName: "products", scope: "filtered" })
exportToExcel(table, { fileName: "products", scope: "selected" })
```

Export chỉ lấy data columns có accessor hợp lệ và bỏ qua các cột inject như selection, row number, row drag, expand, row actions.

Scopes:

- `selected`: các dòng đang được chọn.
- `filtered`: các dòng sau filter.
- `all`: rows trước filter.
- `page`: rows đang render trong page hiện tại.

Nếu không truyền `scope`, export dùng `selected` khi có row được chọn, ngược lại dùng `filtered`.

## Toolbar

Options thường dùng:

```tsx
const table = useDataTable({
  data,
  columns,
  title: "Danh sach san pham",
  enableTopToolbar: true,
  enableBottomToolbar: true,
  enableToolbarInternalActions: true,
  enableDensityToggle: true,
  enableFullscreenToggle: true,
  positionGlobalFilter: "right",
  renderToolbarActions: ({ table }) => (
    <Button onClick={() => table.cnTable.beginCreate()}>Them moi</Button>
  ),
})
```

Render hooks:

- `renderToolbarActions`: thêm action vào vùng trái toolbar.
- `renderToolbarInternalActions`: thay cụm icon/action mặc định.
- `renderTopToolbar`: thay toàn bộ top toolbar.
- `renderBottomToolbar`: thay toàn bộ bottom toolbar.
- `renderBottomToolbarCustomActions`: thêm nội dung bên trái pagination.
- `renderCaption`: render `<caption>`.
- `renderEmpty`: custom empty state.

## Column Features

```tsx
const table = useDataTable({
  data,
  columns,
  enableColumnActions: true,
  enableColumnOrdering: true,
  enableColumnPinning: true,
  enableColumnResizing: true,
  enableColumnAutosize: true,
})
```

Ý nghĩa:

- `enableColumnActions`: menu header cho hide, pin, group, filter mode, ...
- `enableColumnOrdering`: kéo thả đổi thứ tự cột.
- `enableColumnPinning`: pin trái/phải.
- `enableColumnResizing`: kéo resize cột.
- `enableColumnAutosize`: double click resize handle để fit content.

Có thể gọi imperative:

```tsx
table.cnTable.autoSizeColumn("name")
table.cnTable.autoSizeAllColumns()
```

## Row Ordering, Pinning, Numbers

```tsx
const table = useDataTable({
  data,
  columns,
  enableRowOrdering: true,
  enableRowPinning: true,
  enableRowNumbers: true,
  rowNumberMode: "static",
  onRowOrderChange: (activeRowId, overRowId) => {
    reorderRows(activeRowId, overRowId)
  },
})
```

`rowNumberMode`:

- `static`: số thứ tự theo view hiện tại, có xét page.
- `original`: số thứ tự theo index trong source data.

Khi bật `enableRowOrdering`, consumer phải tự reorder data trong state/API ở `onRowOrderChange`.

## Grouping, Expanding, Detail Panel

Grouping:

```tsx
const table = useDataTable({
  data,
  columns,
  enableGrouping: true,
})
```

Detail panel:

```tsx
const table = useDataTable({
  data,
  columns,
  renderDetailPanel: ({ row }) => (
    <div className="p-4">{row.original.description}</div>
  ),
})
```

Tree/sub rows:

```tsx
const table = useDataTable({
  data,
  columns,
  getSubRows: (row) => row.children,
})
```

`enableExpanding` tự bật khi có `renderDetailPanel`, `getSubRows`, hoặc `enableGrouping`.

## Virtualization

Dùng khi table lớn hoặc rất nhiều cột:

```tsx
const table = useDataTable({
  data,
  columns,
  enableRowVirtualization: true,
  estimateRowHeight: 52,
  virtualOverscan: 8,
})

return (
  <DataTable
    table={table}
    surfaceClassName="max-h-[640px]"
  />
)
```

Column virtualization:

```tsx
const table = useDataTable({
  data,
  columns,
  enableColumnVirtualization: true,
})
```

Ghi chú:

- Row virtualization cần table surface có chiều cao giới hạn.
- Row virtualization không phù hợp với row drag-and-drop.
- Column virtualization áp dụng fixed column widths và không nên kết hợp với column pinning/ordering.

## Loading and Saving States

```tsx
const table = useDataTable({
  data,
  columns,
  isLoading,
  isSaving,
  showProgressBars: true,
  showSkeletons: isLoading,
  showLoadingOverlay: isFetching,
})
```

Mặc định:

- `showProgressBars = isLoading || isSaving`.
- `showSkeletons = isLoading`.
- `showLoadingOverlay = isLoading`.

## Localization and Icons

Cấu hình cho một table:

```tsx
const table = useDataTable({
  data,
  columns,
  localization: {
    search: "Tim kiem",
    noRecordsToDisplay: "Khong co du lieu",
    rowsPerPage: "So dong moi trang",
  },
})
```

Cấu hình global cho một vùng app:

```tsx
import { DataTableConfigProvider } from "@/components/ui/data-table"

export function AdminTableProvider({ children }: { children: React.ReactNode }) {
  return (
    <DataTableConfigProvider
      localization={{
        search: "Tim kiem",
        noRecordsToDisplay: "Khong co du lieu",
      }}
    >
      {children}
    </DataTableConfigProvider>
  )
}
```

Thứ tự merge config:

```txt
built-in defaults < DataTableConfigProvider < useDataTable options
```

## Accessing table.cnTable

`table.cnTable` chứa state/UI helper riêng của component:

- `density`, `setDensity`
- `isFullscreen`, `setIsFullscreen`
- `showColumnFilters`, `setShowColumnFilters`
- `globalFilterMode`, `setGlobalFilterMode`
- `advancedFilter`, `setAdvancedFilter`
- `showAdvancedFilterPanel`, `setShowAdvancedFilterPanel`
- `beginCreate`, `beginRowEdit`, `cancelEdit`
- `rowDraft`, `setRowDraftValue`
- `autoSizeColumn`, `autoSizeAllColumns`
- `refs.tableContainerRef`, `refs.searchInputRef`, ...

Ví dụ focus ô search:

```tsx
table.cnTable.refs.searchInputRef.current?.focus()
```

Ví dụ bật/tắt filter row:

```tsx
table.cnTable.setShowColumnFilters((value) => !value)
```

## Migration From shared/data-table

Màn users hiện đang dùng pattern cũ:

- `useReactTable` trong hook state.
- `DataTable` từ `@/components/shared/data-table`.
- Một import `useDataTable` từ `@/components/ui/data-table` trong `modules/users/index.tsx` nhưng instance tạo ra chưa được dùng để render.

Khi migrate sang table nâng cao:

1. Đổi import render sang `DataTable` từ `@/components/ui/data-table`.
2. Đổi `useReactTable` sang `useDataTable`.
3. Giữ các TanStack options cũ như `data`, `columns`, `state`, `manualPagination`, `onPaginationChange`, `getRowId`, `meta`.
4. Thêm các UI options cần thiết như `isLoading`, `enableRowSelection`, `enableColumnResizing`, `enableExport`.
5. Với actions, cân nhắc chuyển cột `actions` tự viết sang `renderRowActionMenuItems`.

Ví dụ chuyển nhanh:

```tsx
import { DataTable, useDataTable } from "@/components/ui/data-table"

const table = useDataTable<IUserOut>({
  data: usersData,
  columns: userColumns,
  pageCount,
  state: { pagination, rowSelection },
  getRowId: (row) => row.id,
  manualPagination: true,
  enableRowSelection: true,
  onPaginationChange: setPagination,
  onRowSelectionChange: setRowSelection,
  meta: { handlers },
  isLoading,
})

return <DataTable table={table} pageSizeOptions={[10, 20, 50]} />
```

## Recommended Defaults For Admin Screens

Với các màn CRUD trong admin dashboard:

```tsx
const table = useDataTable({
  data,
  columns,
  getRowId: (row) => row.id,
  isLoading,
  enableRowSelection: true,
  enableColumnActions: true,
  enableColumnResizing: true,
  enableColumnPinning: true,
  enableGlobalFilter: true,
  enableColumnFilterModes: true,
  enableExport: true,
  defaultDensity: "comfortable",
  initialState: {
    pagination: { pageSize: 10 },
  },
})
```

Với API backend đã phân trang:

```tsx
manualPagination: true
manualSorting: true
manualFiltering: true
pageCount: totalPages
state: { pagination, sorting, columnFilters, globalFilter }
```

## Simple CRUD Pattern

Với màn CRUD đơn giản, không truyền quá nhiều option vào `useDataTable`. Chỉ giữ 4 nhóm chính:

- Global search: dùng `globalFilter` từ `useTableQueryState`.
- Column filter: chỉ cột nào khai báo `meta.variant/options` mới filter.
- Edit: chỉ cột nào khai báo `meta.enableEditing/editVariant` mới edit.
- Export: bật `enableExport`.

Ví dụ column status dùng Select shadcn built-in của data-table:

```tsx
const statusOptions = [
  { label: "Hoạt động", value: "ACTIVE" },
  { label: "Bị cấm", value: "BANNED" },
  { label: "Bị khóa", value: "LOCKED" },
  { label: "Chưa kích hoạt", value: "INACTIVE" },
]

const columns: ColumnDef<UserRow>[] = [
  {
    accessorKey: "fullName",
    header: "Họ và tên / Email",
    enableColumnFilter: false,
    meta: { label: "Họ và tên", enableEditing: false },
  },
  {
    accessorKey: "activityStatus",
    header: "Trạng thái",
    meta: {
      label: "Trạng thái",
      variant: "select",
      options: statusOptions,
      editVariant: "select",
      editSelectOptions: statusOptions,
      enableEditing: true,
    },
    enableSorting: false,
  },
]
```

Ví dụ hook module map filter cột `activityStatus` sang query param `status`:

```tsx
const tableQuery = useTableQueryState({
  initialPageSize: 10,
  initialColumnFilters: initialStatus
    ? [{ id: "activityStatus", value: initialStatus }]
    : [],
  columnFilterQueryParamMap: { activityStatus: "status" },
  syncUrl: true,
})
const [rowSelection, setRowSelection] = useState<RowSelectionState>({})

const statusFilter = tableQuery.columnFilters.find(
  (filter) => filter.id === "activityStatus"
)?.value

const params = {
  ...tableQuery.queryParams,
  status: typeof statusFilter === "string" ? statusFilter : undefined,
}

const table = useDataTable({
  data,
  columns,
  pageCount,
  state: {
    pagination: tableQuery.pagination,
    rowSelection,
    sorting: tableQuery.sorting,
    columnFilters: tableQuery.columnFilters,
    globalFilter: tableQuery.globalFilter,
  },
  manualPagination: true,
  manualSorting: true,
  manualFiltering: true,
  enableColumnFilters: true,
  enableColumnFilterModes: false,
  enableGlobalFilter: true,
  enableEditing: true,
  editDisplayMode: "cell",
  enableExport: true,
  onPaginationChange: tableQuery.onPaginationChange,
  onSortingChange: tableQuery.onSortingChange,
  onColumnFiltersChange: tableQuery.onColumnFiltersChange,
  onGlobalFilterChange: tableQuery.onGlobalFilterChange,
  onRowSelectionChange: setRowSelection,
})
```

## Checklist Before Shipping A New Table

- Có `getRowId`, không phụ thuộc index nếu row có `id`.
- Nếu API phân trang, đã bật `manualPagination` và truyền `pageCount`.
- Nếu API filter/sort, đã bật `manualFiltering`/`manualSorting` và map state sang query.
- Column có custom cell phức tạp nên khai báo `meta.label` để menu/filter/export hiển thị tên dễ hiểu.
- Select/multi-select filter nên khai báo `meta.options` để không phụ thuộc faceted values từ page hiện tại.
- Date/range filter cần đảm bảo value trong row parse được sang `Date` hoặc number.
- Action nguy hiểm như delete phải đặt trong menu item destructive và có confirm dialog.
- Với row virtualization, table surface phải có `max-height`.
- Không import lẫn `components/shared/data-table` khi đã dùng `useDataTable` nâng cao.
