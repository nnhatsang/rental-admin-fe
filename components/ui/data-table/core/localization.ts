export interface DataTableLocalization {
  // Selection
  selectAll: string
  selectRow: string
  clearSelection: string
  rowsSelected: (selected: number, total: number) => string

  // Sorting
  sortByColumnAsc: (column: string) => string
  sortByColumnDesc: (column: string) => string
  sortAscending: string
  sortDescending: string
  clearSort: string
  sortedAscending: string
  sortedDescending: string

  // Column actions
  columnActions: string
  hideColumn: string
  showAllColumns: string
  pinToLeft: string
  pinToRight: string
  unpin: string
  reorderColumn: string
  reorderRow: string
  pinRow: string
  unpinRow: string
  resizeColumn: string

  // Grouping / expansion
  groupByColumn: (column: string) => string
  ungroupByColumn: (column: string) => string
  groupedBy: string
  dropToGroupBy: string
  expand: string
  collapse: string
  expandAll: string
  collapseAll: string
  toggleRowExpanded: string

  // Column visibility
  columnVisibility: string
  toggleColumnVisibility: string

  // Filtering
  filterByColumn: (column: string) => string
  clearFilter: string
  filterMode: string
  changeFilterMode: string
  filterPlaceholder: (column: string) => string
  showColumnFilters: string
  hideColumnFilters: string
  min: string
  max: string
  pickDate: string
  pickDateRange: string
  /** Labels for each filter mode, keyed by the `FilterMode` string. */
  filterModes: Record<string, string>

  // Advanced filter panel
  advancedFilters: string
  advancedFiltersMatchLabel: string
  advancedFiltersMatchAll: string
  advancedFiltersMatchAny: string
  advancedFiltersOf: string
  advancedFiltersAddRule: string
  advancedFiltersApply: string
  advancedFiltersClearAll: string
  advancedFiltersColumn: string
  advancedFiltersOperator: string
  advancedFiltersValue: string
  advancedFiltersEmpty: string
  removeFilterRule: string
  /** Operator labels, keyed by `AdvancedFilterOperator`. */
  advancedFilterOperators: Record<string, string>

  // Global search
  search: string
  searchPlaceholder: string
  clearSearch: string
  globalFilterMode: string

  // Density
  toggleDensity: string
  densityComfortable: string
  densityCompact: string
  densitySpacious: string

  // Full screen
  enterFullscreen: string
  exitFullscreen: string

  // Pagination
  rowsPerPage: string
  paginationRange: (start: number, end: number, total: number) => string
  goToFirstPage: string
  goToPreviousPage: string
  goToNextPage: string
  goToLastPage: string
  goToPage: (page: number) => string

  // Editing / actions
  rowActions: string
  edit: string
  save: string
  cancel: string
  delete: string
  create: string
  createNewRow: string
  editRow: string
  required: string
  copy: string
  copied: string
  cellActions: string

  // Export
  export: string
  exportCsv: string
  exportExcel: string

  // Empty / loading
  noRecordsToDisplay: string
  loading: string
}

export const defaultLocalization: DataTableLocalization = {
  selectAll: "Chọn tất cả",
  selectRow: "Chọn dòng",
  clearSelection: "Bỏ chọn",
  rowsSelected: (selected, total) => `Đã chọn ${selected}/${total} dòng`,

  sortByColumnAsc: (column) => `Sắp xếp ${column} tăng dần`,
  sortByColumnDesc: (column) => `Sắp xếp ${column} giảm dần`,
  sortAscending: "Sắp xếp tăng dần",
  sortDescending: "Sắp xếp giảm dần",
  clearSort: "Xóa sắp xếp",
  sortedAscending: "Đang sắp xếp tăng dần",
  sortedDescending: "Đang sắp xếp giảm dần",

  columnActions: "Thao tác cột",
  hideColumn: "Ẩn cột",
  showAllColumns: "Hiện tất cả cột",
  pinToLeft: "Ghim sang trái",
  pinToRight: "Ghim sang phải",
  unpin: "Bỏ ghim",
  reorderColumn: "Sắp xếp lại cột",
  reorderRow: "Sắp xếp lại dòng",
  pinRow: "Ghim dòng",
  unpinRow: "Bỏ ghim dòng",
  resizeColumn: "Đổi kích thước cột",

  groupByColumn: (column) => `Nhóm theo ${column}`,
  ungroupByColumn: (column) => `Bỏ nhóm theo ${column}`,
  groupedBy: "Đang nhóm theo",
  dropToGroupBy: "Kéo cột vào đây để nhóm dữ liệu",
  expand: "Mở rộng",
  collapse: "Thu gọn",
  expandAll: "Mở rộng tất cả",
  collapseAll: "Thu gọn tất cả",
  toggleRowExpanded: "Mở/thu gọn dòng",

  columnVisibility: "Hiển thị cột",
  toggleColumnVisibility: "Bật/tắt hiển thị cột",

  filterByColumn: (column) => `Lọc theo ${column}`,
  clearFilter: "Xóa bộ lọc",
  filterMode: "Kiểu lọc",
  changeFilterMode: "Đổi kiểu lọc",
  filterPlaceholder: (column) => `Lọc ${column}...`,
  showColumnFilters: "Hiện bộ lọc",
  hideColumnFilters: "Ẩn bộ lọc",
  min: "Nhỏ nhất",
  max: "Lớn nhất",
  pickDate: "Chọn ngày",
  pickDateRange: "Chọn khoảng ngày",
  filterModes: {
    fuzzy: "Tìm gần đúng",
    contains: "Chứa",
    startsWith: "Bắt đầu bằng",
    endsWith: "Kết thúc bằng",
    equals: "Bằng",
    notEquals: "Khác",
    empty: "Trống",
    notEmpty: "Không trống",
    between: "Trong khoảng (không gồm biên)",
    betweenInclusive: "Trong khoảng (gồm biên)",
    greaterThan: "Lớn hơn",
    greaterThanOrEqualTo: "Lớn hơn hoặc bằng",
    lessThan: "Nhỏ hơn",
    lessThanOrEqualTo: "Nhỏ hơn hoặc bằng",
    before: "Trước",
    after: "Sau",
    betweenDates: "Trong khoảng",
    equalsString: "Bằng",
    arrIncludesSome: "Bao gồm",
    equalsBool: "Bằng",
  },

  advancedFilters: "Bộ lọc nâng cao",
  advancedFiltersMatchLabel: "Khớp",
  advancedFiltersMatchAll: "Tất cả",
  advancedFiltersMatchAny: "Bất kỳ",
  advancedFiltersOf: "trong các điều kiện sau",
  advancedFiltersAddRule: "Thêm điều kiện",
  advancedFiltersApply: "Áp dụng",
  advancedFiltersClearAll: "Xóa tất cả",
  advancedFiltersColumn: "Cột",
  advancedFiltersOperator: "Toán tử",
  advancedFiltersValue: "Giá trị",
  advancedFiltersEmpty: "Chưa có điều kiện lọc. Thêm một điều kiện để bắt đầu.",
  removeFilterRule: "Xóa điều kiện",
  advancedFilterOperators: {
    contains: "chứa",
    notContains: "không chứa",
    startsWith: "bắt đầu bằng",
    endsWith: "kết thúc bằng",
    equals: "bằng",
    notEquals: "khác",
    isEmpty: "trống",
    isNotEmpty: "không trống",
    greaterThan: "lớn hơn",
    greaterThanOrEqual: "lớn hơn hoặc bằng",
    lessThan: "nhỏ hơn",
    lessThanOrEqual: "nhỏ hơn hoặc bằng",
    between: "nằm trong khoảng",
  },

  search: "Tìm kiếm",
  searchPlaceholder: "Tìm kiếm...",
  clearSearch: "Xóa tìm kiếm",
  globalFilterMode: "Kiểu tìm kiếm",

  toggleDensity: "Đổi mật độ hiển thị",
  densityComfortable: "Vừa phải",
  densityCompact: "Gọn",
  densitySpacious: "Rộng",

  enterFullscreen: "Mở toàn màn hình",
  exitFullscreen: "Thoát toàn màn hình",

  rowsPerPage: "Số dòng mỗi trang",
  paginationRange: (start, end, total) => `${start}-${end} trên ${total}`,
  goToFirstPage: "Đến trang đầu",
  goToPreviousPage: "Đến trang trước",
  goToNextPage: "Đến trang sau",
  goToLastPage: "Đến trang cuối",
  goToPage: (page) => `Đến trang ${page}`,

  rowActions: "Thao tác dòng",
  edit: "Chỉnh sửa",
  save: "Lưu",
  cancel: "Hủy",
  delete: "Xóa",
  create: "Tạo",
  createNewRow: "Tạo dòng mới",
  editRow: "Chỉnh sửa dòng",
  required: "Bắt buộc",
  copy: "Sao chép",
  copied: "Đã sao chép",
  cellActions: "Thao tác ô",

  export: "Xuất dữ liệu",
  exportCsv: "Xuất CSV",
  exportExcel: "Xuất Excel",

  noRecordsToDisplay: "Không có dữ liệu để hiển thị",
  loading: "Đang tải...",
}
