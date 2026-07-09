import type * as React from 'react';
import type { Cell, Column, Row, RowData, Table, TableOptions } from '@tanstack/react-table';

import type { Virtualizer, VirtualizerOptions } from '@tanstack/react-virtual';

import type { DataTableLocalization } from './localization';
import type { FilterMode, GlobalFilterMode } from '../fns/filter-fns';
import type { DataTableIcons } from './icons';

// Re-export trong public type: các type này mô tả cấu hình filter trong
// `columnDef.meta`, còn các hàm filter chạy runtime vẫn giữ nội bộ.
export type { FilterMode, GlobalFilterMode } from '../fns/filter-fns';

export type Density = 'compact' | 'comfortable' | 'spacious';

/** Đối tượng `@tanstack/react-virtual` dùng để ảo hóa các dòng trong tbody. */
export type DataTableRowVirtualizer = Virtualizer<HTMLDivElement, HTMLTableRowElement>;
/** Đối tượng `@tanstack/react-virtual` dùng để ảo hóa các cột. */
export type DataTableColumnVirtualizer = Virtualizer<HTMLDivElement, HTMLTableCellElement>;

/** Một giá trị trực tiếp, hoặc hàm nhận table instance rồi trả về giá trị đó. */
type ValueOrFunc<TData extends RowData, TValue> = TValue | ((props: { table: DataTableInstance<TData> }) => TValue);

/** Một phần option truyền thêm và gộp vào lệnh gọi `useVirtualizer` cho dòng. */
export type RowVirtualizerOptions<TData extends RowData> = ValueOrFunc<
  TData,
  Partial<VirtualizerOptions<HTMLDivElement, HTMLTableRowElement>>
>;
/** Một phần option truyền thêm và gộp vào lệnh gọi `useVirtualizer` cho cột. */
export type ColumnVirtualizerOptions<TData extends RowData> = ValueOrFunc<
  TData,
  Partial<VirtualizerOptions<HTMLDivElement, HTMLTableCellElement>>
>;

/**
 * DOM refs tới các phần cấu trúc của table, được expose qua
 * `table.cnTable.refs` để xử lý thủ công như focus, đo kích thước, scroll.
 * Mỗi ref được gán sau khi component mount và có thể là `null` nếu phần tử đó
 * không được render.
 */
export interface DataTableRefs {
  /** Wrapper ngoài cùng `data-slot="data-table"`. Luôn tồn tại. */
  tablePaperRef: React.RefObject<HTMLDivElement | null>;
  /** Container scroll (`data-slot="data-table-surface"`), dùng chung cho cả hai trục. Luôn tồn tại. */
  tableContainerRef: React.RefObject<HTMLDivElement | null>;
  /** Root của top toolbar (`data-slot="data-table-toolbar"`). `null` khi top toolbar bị tắt hoặc bị thay bằng `renderTopToolbar`. */
  topToolbarRef: React.RefObject<HTMLDivElement | null>;
  /** Root của bottom toolbar (`data-slot="data-table-bottom-toolbar"`). `null` khi không có bottom toolbar hoặc bị thay bằng `renderBottomToolbar`. */
  bottomToolbarRef: React.RefObject<HTMLDivElement | null>;
  /** Phần tử `<thead>`. Luôn tồn tại. */
  tableHeadRef: React.RefObject<HTMLTableSectionElement | null>;
  /** Phần tử `<tfoot>`. `null` nếu không có cột nào khai báo `footer`. */
  tableFooterRef: React.RefObject<HTMLTableSectionElement | null>;
  /** Ô `<input>` tìm kiếm toàn bảng. `null` cho tới khi ô search được mở rộng. */
  searchInputRef: React.RefObject<HTMLInputElement | null>;
}

/** Các kiểu UI filter. */
export type FilterVariant =
  | 'text'
  | 'select'
  | 'multi-select'
  | 'checkbox'
  | 'range'
  | 'range-slider'
  | 'date'
  | 'date-range';

export interface DataTableFilterOption {
  label: string;
  value: string;
  icon?: React.ComponentType<{ className?: string }>;
}

/** Các toán tử trong advanced filter. Mỗi cột chỉ dùng được toán tử phù hợp với `meta.variant` của cột đó. */
export type AdvancedFilterOperator =
  | 'isEmpty'
  | 'isNotEmpty'
  | 'equals'
  | 'notEquals'
  | 'contains'
  | 'notContains'
  | 'startsWith'
  | 'endsWith'
  | 'greaterThan'
  | 'greaterThanOrEqual'
  | 'lessThan'
  | 'lessThanOrEqual'
  | 'between';

/** Một điều kiện advanced filter: cột + toán tử + giá trị. */
export interface AdvancedFilterRule {
  /** Key ổn định cho React và thao tác chỉnh sửa. */
  id: string;
  columnId: string;
  operator: AdvancedFilterOperator;
  /** Giá trị dùng để so sánh (string / number / Date / undefined). */
  value: unknown;
  /** Giá trị cận trên, chỉ dùng với toán tử `between`. */
  value2?: unknown;
}

/** Advanced filter đầy đủ: danh sách rule phẳng, nối với nhau bằng một kiểu logic. */
export interface AdvancedFilterGroup {
  logic: 'and' | 'or';
  rules: AdvancedFilterRule[];
}

export type EditDisplayMode = 'cell' | 'row' | 'table' | 'modal' | 'custom';

/** Cách hiển thị form tạo mới, tách riêng với {@link EditDisplayMode}. */
export type CreateDisplayMode = 'modal' | 'row' | 'custom';

/** Cách render phần điều khiển phân trang. `"pages"` là các nút số trang. */
export type PaginationDisplayMode = 'default' | 'pages' | 'custom';

/** Vị trí đặt input filter của cột: dòng filter dưới header hoặc popover mở từ header từng cột. */
export type ColumnFilterDisplayMode = 'subheader' | 'popover' | 'custom';

/** Ô đang được chỉnh sửa khi dùng chế độ edit theo cell. */
export interface EditingCell {
  rowId: string;
  columnId: string;
}

/** Các kiểu field dùng cho editor inline. */
export type EditVariant = 'text' | 'number' | 'select';

// Cấu hình riêng cho từng cột nằm trong `columnDef.meta`. Mở rộng interface
// `ColumnMeta` của TanStack để mọi nơi đọc `meta` đều có type rõ ràng.
declare module '@tanstack/react-table' {
  interface ColumnMeta<TData extends RowData, TValue> {
    /** Kiểu UI filter được render ở dòng filter. Mặc định là "text". */
    variant?: FilterVariant;
    /** Danh sách option cho filter `select` / `multi-select`. Nếu bỏ trống, option sẽ được suy ra từ các giá trị unique đã facet. */
    options?: DataTableFilterOption[];
    /** Filter mode mặc định của cột này, ghi đè mặc định theo variant. */
    filterMode?: FilterMode;
    /** Bật/tắt menu chọn filter mode riêng cho cột này; mặc định dùng theo table. */
    enableColumnFilterModes?: boolean;
    /** UI filter tự custom cho cột này. Nếu có, nó sẽ thay UI theo variant. */
    renderColumnFilter?: (props: { column: Column<TData, TValue>; table: DataTableInstance<TData> }) => React.ReactNode;
    /** Giới hạn và sắp xếp các mode trong menu filter của cột này. Nên bao gồm mode mặc định của cột. */
    columnFilterModeOptions?: FilterMode[];
    /** Cho phép chỉnh sửa cột này. Mặc định là true khi table bật editing. */
    enableEditing?: boolean;
    /** Kiểu editor inline. Mặc định là "text". */
    editVariant?: EditVariant;
    /** Option cho editor kiểu "select". */
    editSelectOptions?: DataTableFilterOption[];
    /** Editor inline tự custom cho cột này. Khi cell/row đang edit, editor này sẽ thay editor mặc định; quản lý giá trị qua `table.cnTable`. */
    renderEditCell?: (props: CellRenderProps<TData, TValue>) => React.ReactNode;
    /** Render custom cho cell header nhóm của cột này khi đang group. */
    renderGroupedCell?: (props: CellRenderProps<TData, TValue>) => React.ReactNode;
    /** Render custom cho cell tổng hợp của cột này khi đang group. Ghi đè `columnDef.aggregatedCell` của TanStack. */
    renderAggregatedCell?: (props: CellRenderProps<TData, TValue>) => React.ReactNode;
    /** Render custom cho placeholder cell trong row đã group. Mặc định để trống. */
    renderPlaceholderCell?: (props: CellRenderProps<TData, TValue>) => React.ReactNode;
    /** Validate giá trị vừa sửa; trả về message lỗi hoặc `undefined` nếu hợp lệ. */
    validate?: (value: unknown) => string | undefined;
    /** Hiển thị thao tác bấm để copy trên các cell của cột này. */
    enableClickToCopy?: boolean;
    /** Căn ngang cho label header và các cell body. */
    align?: 'left' | 'center' | 'right';
    /** Không highlight đoạn khớp tìm kiếm trên cột này. */
    disableHighlight?: boolean;
    /** Ẩn menu thao tác cột cho cột này. */
    disableColumnActions?: boolean;
    /** Nhãn dễ đọc dùng trong menu khi header không phải chuỗi đơn giản. */
    label?: string;
  }
}

export interface DataTableSlotProps<TData extends RowData> {
  table: DataTableInstance<TData>;
}

export interface RowEvent<TData extends RowData> {
  row: Row<TData>;
  table: DataTableInstance<TData>;
  event: React.MouseEvent<HTMLTableRowElement>;
}

export interface CellEvent<TData extends RowData> {
  cell: Cell<TData, unknown>;
  row: Row<TData>;
  table: DataTableInstance<TData>;
  event: React.MouseEvent<HTMLTableCellElement>;
}

/** Props truyền vào các hook render cell theo từng cột trong `columnDef.meta`. */
export interface CellRenderProps<TData extends RowData, TValue = unknown> {
  cell: Cell<TData, TValue>;
  row: Row<TData>;
  column: Column<TData, TValue>;
  table: DataTableInstance<TData>;
}

/**
 * Cấu hình và state UI của data table, được gắn vào TanStack table instance
 * dưới `table.cnTable`. Các sub-component đọc trực tiếp từ instance này thay
 * vì truyền props qua nhiều tầng.
 */
export interface DataTableConfig<TData extends RowData> {
  localization: DataTableLocalization;
  icons: DataTableIcons;
  density: Density;
  setDensity: React.Dispatch<React.SetStateAction<Density>>;
  isFullscreen: boolean;
  setIsFullscreen: React.Dispatch<React.SetStateAction<boolean>>;
  showColumnFilters: boolean;
  setShowColumnFilters: React.Dispatch<React.SetStateAction<boolean>>;
  /** Filter mode hiện tại theo từng column id. */
  columnFilterModes: Record<string, FilterMode>;
  /** Đổi filter mode của một cột; reset giá trị filter nếu giá trị cũ không còn hợp lệ. */
  setColumnFilterMode: (columnId: string, mode: FilterMode) => void;
  globalFilterMode: GlobalFilterMode;
  setGlobalFilterMode: (mode: GlobalFilterMode) => void;
  enableGlobalFilter: boolean;
  enableGlobalFilterModes: boolean;
  /** Panel filter nâng cao dùng AND/OR, hoạt động độc lập và cộng thêm với filter từng cột + global search. */
  enableAdvancedFilter: boolean;
  advancedFilter: AdvancedFilterGroup;
  setAdvancedFilter: React.Dispatch<React.SetStateAction<AdvancedFilterGroup>>;
  showAdvancedFilterPanel: boolean;
  setShowAdvancedFilterPanel: React.Dispatch<React.SetStateAction<boolean>>;
  isLoading: boolean;
  isSaving: boolean;
  showProgressBars: boolean;
  showSkeletons: boolean;
  showLoadingOverlay: boolean;
  enableFacetedValues: boolean;
  enableColumnActions: boolean;
  enableColumnFilters: boolean;
  enableColumnFilterModes: boolean;
  enableFilterMatchHighlighting: boolean;
  /** Các column id có cell renderer tự custom, sẽ bỏ qua auto-highlight. */
  columnsWithCustomCell: ReadonlySet<string>;
  enableColumnOrdering: boolean;
  enableColumnPinning: boolean;
  enableColumnResizing: boolean;
  enableColumnAutosize: boolean;
  /** Tự chỉnh width một cột để vừa giá trị hiển thị rộng nhất (header + data). */
  autoSizeColumn: (columnId: string) => void;
  /** Tự chỉnh width cho mọi cột đang hiển thị và có thể resize. */
  autoSizeAllColumns: () => void;
  enableRowOrdering: boolean;
  enableRowPinning: boolean;
  enableRowNumbers: boolean;
  rowNumberMode: 'static' | 'original';
  /** Gọi khi kéo thả để đổi thứ tự row; phía dùng component tự sắp xếp lại data. */
  onRowOrderChange?: (activeRowId: string, overRowId: string) => void;
  enableGrouping: boolean;
  enableExpanding: boolean;
  enableStickyFooter: boolean;
  renderDetailPanel?: (props: { row: Row<TData>; table: DataTableInstance<TData> }) => React.ReactNode;

  // Chỉnh sửa / thao tác
  enableEditing: boolean;
  editDisplayMode: EditDisplayMode;
  createDisplayMode: CreateDisplayMode;
  editingCell: EditingCell | null;
  setEditingCell: React.Dispatch<React.SetStateAction<EditingCell | null>>;
  editingRowId: string | null;
  isCreating: boolean;
  /** Giá trị nháp cho editor row/modal và form tạo mới, key theo column id. */
  rowDraft: Record<string, unknown>;
  setRowDraftValue: (columnId: string, value: unknown) => void;
  /** Bắt đầu edit row/modal cho một row, khởi tạo draft từ giá trị của row. */
  beginRowEdit: (row: Row<TData>) => void;
  /** Mở form tạo mới, khởi tạo draft từ `createRowDefaults`. */
  beginCreate: () => void;
  /** Thoát mọi trạng thái edit/tạo mới và bỏ draft hiện tại. */
  cancelEdit: () => void;
  enableClickToCopy: boolean;
  onEditCellSave?: (props: {
    row: Row<TData>;
    column: Column<TData, unknown>;
    value: unknown;
    table: DataTableInstance<TData>;
  }) => void;
  onSaveRow?: (props: {
    row: Row<TData>;
    values: Record<string, unknown>;
    table: DataTableInstance<TData>;
    exit: () => void;
  }) => void;
  onCreateRow?: (props: { values: Record<string, unknown>; table: DataTableInstance<TData>; exit: () => void }) => void;
  renderRowActions?: (props: { row: Row<TData>; table: DataTableInstance<TData> }) => React.ReactNode;
  renderCellActionMenuItems?: (props: {
    cell: Cell<TData, unknown>;
    row: Row<TData>;
    table: DataTableInstance<TData>;
  }) => React.ReactNode;
  renderRowActionMenuItems?: (props: { row: Row<TData>; table: DataTableInstance<TData> }) => React.ReactNode;
  renderColumnActionsMenuItems?: (props: {
    column: Column<TData, unknown>;
    table: DataTableInstance<TData>;
  }) => React.ReactNode;
  renderColumnFilterModeMenuItems?: (props: {
    column: Column<TData, unknown>;
    modes: FilterMode[];
    currentMode: FilterMode;
    onSelect: (mode: FilterMode) => void;
    table: DataTableInstance<TData>;
  }) => React.ReactNode;
  renderGlobalFilterModeMenuItems?: (props: {
    modes: GlobalFilterMode[];
    currentMode: GlobalFilterMode;
    onSelect: (mode: GlobalFilterMode) => void;
    table: DataTableInstance<TData>;
  }) => React.ReactNode;

  // Lắng nghe sự kiện
  onRowClick?: (props: RowEvent<TData>) => void;
  onRowDoubleClick?: (props: RowEvent<TData>) => void;
  onCellClick?: (props: CellEvent<TData>) => void;
  onCellDoubleClick?: (props: CellEvent<TData>) => void;

  /** DOM refs tới các phần cấu trúc của table, được gán sau khi mount. */
  refs: DataTableRefs;
  enableRowVirtualization: boolean;
  enableColumnVirtualization: boolean;
  estimateRowHeight: number;
  virtualOverscan: number;
  rowVirtualizerOptions?: RowVirtualizerOptions<TData>;
  columnVirtualizerOptions?: ColumnVirtualizerOptions<TData>;
  rowVirtualizerInstanceRef?: React.RefObject<DataTableRowVirtualizer | null>;
  columnVirtualizerInstanceRef?: React.RefObject<DataTableColumnVirtualizer | null>;
  enableExport: boolean;
  exportFileName?: string;
  enableStickyHeader: boolean;
  enablePagination: boolean;
  positionPagination: 'top' | 'bottom' | 'both' | 'none';
  paginationDisplayMode: PaginationDisplayMode;
  columnFilterDisplayMode: ColumnFilterDisplayMode;
  positionGlobalFilter: 'left' | 'right' | 'none';
  positionToolbarAlertBanner: 'top' | 'bottom' | 'none';
  positionToolbarDropZone: 'top' | 'bottom' | 'both' | 'none';
  enableRowSelection: boolean;
  enableTopToolbar: boolean;
  enableBottomToolbar: boolean;
  enableDensityToggle: boolean;
  enableFullscreenToggle: boolean;
  enableToolbarInternalActions: boolean;
  enableKeyboardNavigation: boolean;
  title?: React.ReactNode;
  description?: React.ReactNode;
  positionToolbarActions?: 'left' | 'top-right';
  styleSearchInput?: 'default' | 'expanded';

  renderToolbarActions?: (props: DataTableSlotProps<TData>) => React.ReactNode;
  renderTopToolbar?: (props: DataTableSlotProps<TData>) => React.ReactNode;
  renderBottomToolbar?: (props: DataTableSlotProps<TData>) => React.ReactNode;
  renderToolbarInternalActions?: (props: DataTableSlotProps<TData>) => React.ReactNode;
  renderBottomToolbarCustomActions?: (props: DataTableSlotProps<TData>) => React.ReactNode;
  renderCaption?: (props: DataTableSlotProps<TData>) => React.ReactNode;
  renderEmpty?: (props: DataTableSlotProps<TData>) => React.ReactNode;
}

/** TanStack table instance đã được bổ sung cấu hình `cnTable`. */
export type DataTableInstance<TData extends RowData = unknown> = Table<TData> & {
  cnTable: DataTableConfig<TData>;
};

/**
 * Options cho {@link useDataTable}. Mở rộng toàn bộ `TableOptions` của
 * TanStack để vẫn truyền được controlled state, các flag `manual*`, `getRowId`,
 * v.v. Đồng thời thêm các option về giao diện/tính năng của data table.
 * `getCoreRowModel` và các row model khác có default hợp lý nhưng vẫn có thể
 * ghi đè khi cần.
 */
export interface UseDataTableOptions<TData extends RowData> extends Omit<TableOptions<TData>, 'getCoreRowModel'> {
  getCoreRowModel?: TableOptions<TData>['getCoreRowModel'];
  localization?: Partial<DataTableLocalization>;
  /** Ghi đè một phần hoặc toàn bộ icon của table. */
  icons?: Partial<DataTableIcons>;
  /** Density ban đầu khi dùng uncontrolled. */
  defaultDensity?: Density;
  /** Có hiển thị dòng filter lúc đầu hay không khi dùng uncontrolled. */
  defaultShowColumnFilters?: boolean;
  /** Hiển thị trạng thái loading như progress bar, skeleton khi chưa có data, hoặc overlay làm mờ row hiện có. */
  isLoading?: boolean;
  /** Hiển thị progress bar khi đang save/mutation. Mặc định không thay row bằng skeleton. */
  isSaving?: boolean;
  /** Hiển thị progress bar phía trên. Mặc định: `isLoading || isSaving`. */
  showProgressBars?: boolean;
  /** Thay body bằng skeleton row khi table đang trống. Mặc định: `isLoading`. */
  showSkeletons?: boolean;
  /** Làm mờ các row hiện có bằng overlay khi loading. Mặc định: `isLoading`. */
  showLoadingOverlay?: boolean;
  /** Tính unique values và min/max đã facet để tự tạo option select và giới hạn range. Mặc định true. */
  enableFacetedValues?: boolean;
  enableColumnActions?: boolean;
  /** Hiển thị nút/menu chọn filter mode trong field filter. Mặc định true. */
  enableColumnFilterModes?: boolean;
  /** Highlight phần text khớp tìm kiếm trong cell. Mặc định true. */
  enableFilterMatchHighlighting?: boolean;
  /** Hiển thị ô global search có thể mở rộng trong toolbar. Mặc định true. */
  enableGlobalFilter?: boolean;
  /** Hiển thị menu chọn mode cho global search (fuzzy/contains/...). Mặc định true. */
  enableGlobalFilterModes?: boolean;
  /** Khi global search ở mode fuzzy, sắp xếp row theo độ khớp tốt nhất cho tới khi người dùng tự sort. Mặc định false để table không âm thầm đổi thứ tự row khi search. */
  enableGlobalFilterRankedResults?: boolean;
  /** Mode global search ban đầu. Mặc định "fuzzy". */
  defaultGlobalFilterMode?: GlobalFilterMode;
  /** Density controlled. Dùng cùng `onDensityChange`; bỏ trống để uncontrolled và lấy giá trị đầu từ `defaultDensity`. */
  density?: Density;
  /** Gọi mỗi khi density đổi, dù từ toolbar hay từ code. */
  onDensityChange?: (density: Density) => void;
  /** Trạng thái fullscreen controlled. Dùng cùng `onIsFullscreenChange`. */
  isFullscreen?: boolean;
  /** Gọi mỗi khi bật/tắt fullscreen. */
  onIsFullscreenChange?: (isFullscreen: boolean) => void;
  /** Trạng thái hiển thị dòng filter dạng controlled. Dùng cùng `onShowColumnFiltersChange`; bỏ trống để uncontrolled. */
  showColumnFilters?: boolean;
  /** Gọi mỗi khi dòng filter được hiện hoặc ẩn. */
  onShowColumnFiltersChange?: (showColumnFilters: boolean) => void;
  /** Bật panel advanced filter: nhiều rule nối bằng AND/OR và áp thêm lên filter từng cột. Mặc định false. */
  enableAdvancedFilter?: boolean;
  /** Advanced filter controlled. Dùng cùng `onAdvancedFilterChange`; bỏ trống để uncontrolled. */
  advancedFilter?: AdvancedFilterGroup;
  /** Advanced filter ban đầu khi dùng uncontrolled. */
  defaultAdvancedFilter?: AdvancedFilterGroup;
  /** Gọi mỗi khi advanced filter thay đổi. */
  onAdvancedFilterChange?: (filter: AdvancedFilterGroup) => void;
  /** Mode global search controlled. Dùng cùng `onGlobalFilterModeChange`; bỏ trống để uncontrolled. */
  globalFilterMode?: GlobalFilterMode;
  /** Gọi mỗi khi mode global search thay đổi. */
  onGlobalFilterModeChange?: (mode: GlobalFilterMode) => void;
  /** Cho phép kéo thả để đổi thứ tự cột, thêm grip vào mỗi header. */
  enableColumnOrdering?: boolean;
  /** Cho phép ghim cột trái/phải qua menu column-actions và sticky columns. */
  enableColumnPinning?: boolean;
  /** Cho phép resize cột bằng tay nắm ở mép cột. */
  enableColumnResizing?: boolean;
  /**
   * Double-click tay nắm resize để tự chỉnh cột vừa với giá trị rộng nhất.
   * Mặc định theo `enableColumnResizing`. Khi tắt, double-click sẽ reset cột
   * về kích thước mặc định.
   */
  enableColumnAutosize?: boolean;
  /** Cho phép kéo thả để đổi thứ tự row, thêm một cột drag-handle. */
  enableRowOrdering?: boolean;
  /** Cho phép ghim row lên trên qua nút pin trong cột số thứ tự. */
  enableRowPinning?: boolean;
  /** Thêm cột số thứ tự ở đầu table. */
  enableRowNumbers?: boolean;
  /** "static" đánh số theo view hiện tại và có tính pagination; "original" dùng index gốc của data. */
  rowNumberMode?: 'static' | 'original';
  /** Gọi khi kéo thả để đổi thứ tự row; phía dùng component tự sắp xếp lại data. */
  onRowOrderChange?: (activeRowId: string, overRowId: string) => void;
  /** Cho phép group row, gồm menu group-by, vùng thả để group và các row tổng hợp. */
  enableGrouping?: boolean;
  /** Cho phép expand row để hiển thị sub-row dạng cây hoặc detail panel. Tự bật khi có grouping hoặc khi truyền `renderDetailPanel`/`getSubRows`. */
  enableExpanding?: boolean;
  /** Ghim footer (cell tổng hợp/footer) ở đáy vùng table. Mặc định true để đồng bộ với sticky header. */
  enableStickyFooter?: boolean;
  /** Render detail panel có thể mở rộng cho từng row. */
  renderDetailPanel?: (props: { row: Row<TData>; table: DataTableInstance<TData> }) => React.ReactNode;

  // Chỉnh sửa / thao tác
  /** Bật chỉnh sửa inline. */
  enableEditing?: boolean;
  /** Cách hiển thị thao tác edit. Mặc định "cell". */
  editDisplayMode?: EditDisplayMode;
  /** Cách hiển thị form tạo mới, độc lập với `editDisplayMode`: `"modal"` (dialog, mặc định), `"row"` (một row inline ở đầu table), hoặc `"custom"` (tự render từ `isCreating` + `rowDraft`). */
  createDisplayMode?: CreateDisplayMode;
  /** Giá trị mặc định cho form tạo mới, key theo column id. */
  createRowDefaults?: Record<string, unknown>;
  /** Hiển thị thao tác bấm để copy trên mọi cell, có thể override theo từng cột qua meta. */
  enableClickToCopy?: boolean;
  onEditCellSave?: (props: {
    row: Row<TData>;
    column: Column<TData, unknown>;
    value: unknown;
    table: DataTableInstance<TData>;
  }) => void;
  onSaveRow?: (props: {
    row: Row<TData>;
    values: Record<string, unknown>;
    table: DataTableInstance<TData>;
    exit: () => void;
  }) => void;
  onCreateRow?: (props: { values: Record<string, unknown>; table: DataTableInstance<TData>; exit: () => void }) => void;
  renderRowActions?: (props: { row: Row<TData>; table: DataTableInstance<TData> }) => React.ReactNode;
  renderCellActionMenuItems?: (props: {
    cell: Cell<TData, unknown>;
    row: Row<TData>;
    table: DataTableInstance<TData>;
  }) => React.ReactNode;
  /** Render menu ba chấm trong cột row-actions. Trả về các menu item; cột actions sẽ được tự thêm. */
  renderRowActionMenuItems?: (props: { row: Row<TData>; table: DataTableInstance<TData> }) => React.ReactNode;
  /** Thêm item custom vào cuối mỗi menu column-actions; trước nhóm này sẽ có separator. */
  renderColumnActionsMenuItems?: (props: {
    column: Column<TData, unknown>;
    table: DataTableInstance<TData>;
  }) => React.ReactNode;
  /** Thay nhóm radio item trong menu filter-mode của cột. Tự render item và gọi `onSelect(mode)` để đổi mode. */
  renderColumnFilterModeMenuItems?: (props: {
    column: Column<TData, unknown>;
    modes: FilterMode[];
    currentMode: FilterMode;
    onSelect: (mode: FilterMode) => void;
    table: DataTableInstance<TData>;
  }) => React.ReactNode;
  /** Thay nhóm radio item trong menu mode của global search. Tự render item và gọi `onSelect(mode)` để đổi mode. */
  renderGlobalFilterModeMenuItems?: (props: {
    modes: GlobalFilterMode[];
    currentMode: GlobalFilterMode;
    onSelect: (mode: GlobalFilterMode) => void;
    table: DataTableInstance<TData>;
  }) => React.ReactNode;

  /** Gọi khi click / double-click một body row. */
  onRowClick?: (props: RowEvent<TData>) => void;
  onRowDoubleClick?: (props: RowEvent<TData>) => void;
  /** Gọi khi click / double-click một body cell. */
  onCellClick?: (props: CellEvent<TData>) => void;
  onCellDoubleClick?: (props: CellEvent<TData>) => void;

  /** Ảo hóa body row cho dataset lớn (khuyến nghị khi trên khoảng 100 row). Vùng surface của table sẽ là scroll container, nên cần đặt chiều cao giới hạn qua `className`/`style`. Tính năng này tắt row DnD. */
  enableRowVirtualization?: boolean;
  /** Ảo hóa cột cho table rất rộng. Áp dụng width cố định cho cột và không kết hợp với pinning/ordering cột. */
  enableColumnVirtualization?: boolean;
  /** Chiều cao row ước lượng (px) cho virtualizer. Mặc định 52. */
  estimateRowHeight?: number;
  /** Số row render thêm phía trên/dưới viewport. Mặc định 8. */
  virtualOverscan?: number;
  /** Một phần option `@tanstack/react-virtual` merge vào row virtualizer. Nhận object hoặc hàm `({ table }) => options`. */
  rowVirtualizerOptions?: RowVirtualizerOptions<TData>;
  /** Một phần option `@tanstack/react-virtual` merge vào column virtualizer. Nhận object hoặc hàm `({ table }) => options`. */
  columnVirtualizerOptions?: ColumnVirtualizerOptions<TData>;
  /** Ref được gán row `Virtualizer` instance để điều khiển thủ công (ví dụ `scrollToIndex`). Chỉ có khi bật `enableRowVirtualization`. */
  rowVirtualizerInstanceRef?: React.RefObject<DataTableRowVirtualizer | null>;
  /** Ref được gán column `Virtualizer` instance. Chỉ có khi bật `enableColumnVirtualization`. */
  columnVirtualizerInstanceRef?: React.RefObject<DataTableColumnVirtualizer | null>;
  /** Hiển thị menu export CSV/Excel trong toolbar. */
  enableExport?: boolean;
  /** Tên file gốc khi export, không gồm đuôi file. Mặc định "export". */
  exportFileName?: string;
  enableStickyHeader?: boolean;
  enablePagination?: boolean;
  /** Vị trí render điều khiển phân trang. Mặc định "bottom". `"none"` vẫn giữ pagination hoạt động nhưng ẩn controls. */
  positionPagination?: 'top' | 'bottom' | 'both' | 'none';
  /** Kiểu control phân trang: `"default"`, `"pages"` (nút số trang), hoặc `"custom"` (tự render qua `renderBottomToolbarCustomActions`). Mặc định "default". */
  paginationDisplayMode?: PaginationDisplayMode;
  /** Vị trí input filter của cột: `"subheader"` (mặc định), `"popover"` hoặc `"custom"` (tự render). */
  columnFilterDisplayMode?: ColumnFilterDisplayMode;
  /** Khu vực toolbar để render global search. Mặc định "right"; `"left"` đặt cạnh title/actions; `"none"` ẩn global search. */
  positionGlobalFilter?: 'left' | 'right' | 'none';
  /** Vị trí render banner thông báo khi có row được chọn. Mặc định "top". */
  positionToolbarAlertBanner?: 'top' | 'bottom' | 'none';
  /** Vị trí render vùng thả group-by khi bật grouping. Mặc định "top". */
  positionToolbarDropZone?: 'top' | 'bottom' | 'both' | 'none';
  /** Vị trí của cột row-actions được tự thêm. Mặc định "last". */
  positionActionsColumn?: 'first' | 'last';
  /** Vị trí của cột expand được tự thêm cho tree/detail panel. Mặc định "first". */
  positionExpandColumn?: 'first' | 'last';
  /** Phạm vi select-all của checkbox ở header: trang hiện tại (`"page"`, mặc định) hoặc toàn bộ row (`"all"`). */
  selectAllMode?: 'page' | 'all';
  /** Hiển thị checkbox select-all trong header của cột selection. Mặc định true. */
  enableSelectAll?: boolean;
  enableTopToolbar?: boolean;
  enableBottomToolbar?: boolean;
  /** Hiển thị nút đổi density trong toolbar. Mặc định true. */
  enableDensityToggle?: boolean;
  /** Hiển thị nút bật/tắt fullscreen trong toolbar. Mặc định true. */
  enableFullscreenToggle?: boolean;
  /** Hiển thị cụm icon action nội bộ của toolbar (search, filters, ẩn/hiện cột, export, density, fullscreen). Mặc định true. */
  enableToolbarInternalActions?: boolean;
  enableKeyboardNavigation?: boolean;
  title?: React.ReactNode;
  description?: React.ReactNode;
  /** Nội dung custom render ở vùng trái của top toolbar, cạnh title, ví dụ các nút bulk action. */
  renderToolbarActions?: (props: DataTableSlotProps<TData>) => React.ReactNode;
  positionToolbarActions?: 'left' | 'top-right';
  styleSearchInput?: 'default' | 'expanded';

  /** Thay toàn bộ top toolbar bằng nội dung custom. */
  renderTopToolbar?: (props: DataTableSlotProps<TData>) => React.ReactNode;
  /** Thay toàn bộ bottom toolbar, gồm vùng pagination, bằng nội dung custom. */
  renderBottomToolbar?: (props: DataTableSlotProps<TData>) => React.ReactNode;
  /** Thay cụm icon action nội bộ của top toolbar bằng nội dung custom. */
  renderToolbarInternalActions?: (props: DataTableSlotProps<TData>) => React.ReactNode;
  /** Nội dung custom render ở vùng trái của bottom toolbar, cạnh pagination. */
  renderBottomToolbarCustomActions?: (props: DataTableSlotProps<TData>) => React.ReactNode;
  /** Render `<caption>` cho table, ví dụ phần mô tả hỗ trợ accessibility. */
  renderCaption?: (props: DataTableSlotProps<TData>) => React.ReactNode;
  renderEmpty?: (props: DataTableSlotProps<TData>) => React.ReactNode;
}
