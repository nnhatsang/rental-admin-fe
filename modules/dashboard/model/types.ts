import type { DefaultParamsRequest, IPaginationResponse } from '@/types/api';

export type DashboardAttentionType =
  | 'PAYMENT_CONFIRMATION'
  | 'PICKUP_DUE'
  | 'RETURN_DUE'
  | 'OVERDUE_RETURN'
  | 'REFUND_PENDING'
  | 'DISPUTE';

export type DashboardAttentionPriority = 'HIGH' | 'MEDIUM' | 'LOW';
export type DashboardScheduleType = 'PICKUP' | 'RETURN';
export type DashboardTrendGroupBy = 'DAY' | 'WEEK' | 'MONTH';

export type DashboardDateRangeQuery = {
  fromDate: string;
  toDate: string;
  timezone: string;
  includeCancelled: boolean;
};

export type DashboardAttentionQuery = DashboardDateRangeQuery &
  Pick<DefaultParamsRequest, 'page' | 'perPage'> & {
    type?: DashboardAttentionType;
  };

export type DashboardTrendsQuery = DashboardDateRangeQuery & {
  groupBy: DashboardTrendGroupBy;
};

export type DashboardSummary = {
  totalOrders: number;
  cancelledOrders: number;
  attentionOrders: number;
  pickupDue: number;
  returnDue: number;
  overdueReturns: number;
  pendingPayments: number;
  refundDueOrders: number;
  pendingRefundTransactions: number;
};

export type DashboardFinancials = {
  rentalRevenue: number;
  deliveryRevenue: number;
  collectedTotal: number;
  depositHeldTotal: number;
  amountDueBeforeHandover: number;
  refundDueTotal: number;
  pendingRefundTotal: number;
  damageCompensationTotal: number;
  repairCostTotal: number | null;
};

export type DashboardAvailability = {
  totalAssets: number;
  scheduledAssets: number;
  freeAssets: number;
  unavailableAssets: number;
  maintenanceAssets: number;
  lostAssets: number;
  damagedAssets: number;
};

export type DashboardTopProduct = {
  productId: string;
  productName: string;
  sku: string;
  rentedQuantity: number;
  rentalOrderCount: number;
  rentalDeviceDays: number;
  rentalRevenue: number;
};

export type DashboardTopAsset = {
  assetUnitId: string;
  serialNumber: string;
  productId: string;
  productName: string;
  rentalCount: number;
  rentalDeviceDays: number;
};

export type DashboardAttentionItem = {
  type: DashboardAttentionType;
  priority: DashboardAttentionPriority;
  orderId: string;
  orderCode: string;
  orderStatus: string;
  handoverStatus: string;
  returnStatus: string;
  settlementStatus: string;
  customerName: string;
  customerPhone: string | null;
  productSummary: string;
  startDate: string;
  endDate: string;
  amount: number | null;
  message: string;
};

export type DashboardScheduleItem = {
  type: DashboardScheduleType;
  orderId: string;
  orderCode: string;
  orderStatus: string;
  customerName: string;
  productSummary: string;
  scheduledAt: string;
};

export type DashboardPeriod = {
  fromDate: string;
  toDate: string;
  timezone: string;
  dateBasis: string;
};

export type DashboardOperationsOverview = {
  generatedAt: string;
  period: DashboardPeriod;
  summary: DashboardSummary;
  financials: DashboardFinancials;
  availability: DashboardAvailability;
  topProducts: DashboardTopProduct[];
  topAssets: DashboardTopAsset[];
  attentionPreview: DashboardAttentionItem[];
  schedulePreview: DashboardScheduleItem[];
};

export type DashboardTrendItem = {
  bucketStart: string;
  orderCount: number;
  rentalRevenue: number;
  deliveryRevenue: number;
  collectedTotal: number;
  damageCompensationTotal: number;
};

export type DashboardTrends = {
  period: DashboardPeriod;
  groupBy: DashboardTrendGroupBy;
  items: DashboardTrendItem[];
};

export type DashboardAttentionResponse = IPaginationResponse<DashboardAttentionItem>;

export type DashboardSummaryMetricKey =
  | 'totalOrders'
  | 'attentionOrders'
  | 'pickupDue'
  | 'returnDue'
  | 'overdueReturns'
  | 'refundDueOrders';

export type DashboardAvailabilityMetricKey =
  | 'totalAssets'
  | 'scheduledAssets'
  | 'freeAssets'
  | 'unavailableAssets'
  | 'maintenanceAssets'
  | 'lostAssets'
  | 'damagedAssets';
