import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { dashboardSummaryMetricConfig } from '../../display-config';
import type { DashboardSummary, DashboardSummaryMetricKey } from '../../model';

const metricKeys: DashboardSummaryMetricKey[] = [
  'totalOrders',
  'attentionOrders',
  'pickupDue',
  'returnDue',
  'overdueReturns',
  'refundDueOrders',
];

function SummaryMetric({ metricKey, summary }: { metricKey: DashboardSummaryMetricKey; summary: DashboardSummary }) {
  const config = dashboardSummaryMetricConfig[metricKey];
  const Icon = config.icon;

  return (
    <Card className="border-accent/60 shadow-none">
      <CardHeader className="flex flex-row items-start justify-between gap-3 pb-2">
        <div className="grid min-w-0 gap-1">
          <CardTitle className="text-sm font-medium">{config.label}</CardTitle>
          <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">{config.description}</p>
        </div>
        <span className={cn('flex size-9 shrink-0 items-center justify-center rounded-lg', config.className)}>
          <Icon className="size-4" aria-hidden="true" />
        </span>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-semibold tabular-nums tracking-tight">{summary[metricKey].toLocaleString('vi-VN')}</p>
      </CardContent>
    </Card>
  );
}

export function DashboardSummaryCards({ summary }: { summary: DashboardSummary }) {
  return (
    <section aria-labelledby="dashboard-summary-heading" className="grid gap-3">
      <div>
        <h2 id="dashboard-summary-heading" className="text-base font-semibold">
          Tình hình trong kỳ
        </h2>
        <p className="text-sm text-muted-foreground">Các chỉ số giúp ưu tiên việc vận hành trong khoảng thời gian đang xem.</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {metricKeys.map((metricKey) => (
          <SummaryMetric key={metricKey} metricKey={metricKey} summary={summary} />
        ))}
      </div>
      {summary.cancelledOrders > 0 ? (
        <p className="text-xs text-muted-foreground">
          Có {summary.cancelledOrders.toLocaleString('vi-VN')} đơn đã hủy trong kỳ; các đơn này không được cộng vào KPI vận hành thông thường.
        </p>
      ) : null}
    </section>
  );
}
