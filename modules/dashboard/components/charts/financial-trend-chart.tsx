'use client';

import { useMemo } from 'react';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from '@/components/ui/empty';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDashboardBucketLabel, formatDashboardCurrency } from '../../display-utils';
import { dashboardFinancialMetricConfig, dashboardTrendConfig } from '../../display-config';
import type { DashboardFinancials, DashboardTrendGroupBy, DashboardTrends } from '../../model';

const chartConfig = {
  rentalRevenue: {
    label: dashboardTrendConfig.rentalRevenue.label,
    color: dashboardFinancialMetricConfig.rentalRevenue.color,
  },
  deliveryRevenue: {
    label: dashboardTrendConfig.deliveryRevenue.label,
    color: dashboardFinancialMetricConfig.deliveryRevenue.color,
  },
  collectedTotal: {
    label: dashboardTrendConfig.collectedTotal.label,
    color: dashboardFinancialMetricConfig.collectedTotal.color,
  },
} satisfies ChartConfig;

function FinancialMetric({ label, value, description }: { label: string; value: string; description: string }) {
  return (
    <div className="grid gap-1 rounded-lg bg-muted/20 p-3">
      <span className="text-xs text-muted-foreground">{label}</span>
      <strong className="text-sm tabular-nums">{value}</strong>
      <span className="text-xs leading-relaxed text-muted-foreground">{description}</span>
    </div>
  );
}

function FinancialTrendChart({ trends, isLoading, isError }: { trends?: DashboardTrends; isLoading: boolean; isError: boolean }) {
  const data = useMemo(
    () =>
      trends?.items.map((item) => ({
        ...item,
        label: formatDashboardBucketLabel(item.bucketStart, trends.groupBy),
      })) ?? [],
    [trends],
  );

  if (isLoading) return <Skeleton className="h-72 w-full" />;

  if (isError) {
    return <p role="alert" className="flex h-72 items-center justify-center text-sm text-destructive">Không thể tải xu hướng tài chính.</p>;
  }

  if (!data.length) {
    return (
      <Empty className="h-72 border-0 p-0">
        <EmptyHeader>
          <EmptyTitle>Chưa có dữ liệu xu hướng</EmptyTitle>
          <EmptyDescription>Chọn khoảng thời gian khác hoặc tạo thêm đơn thuê để xem biểu đồ.</EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <ChartContainer config={chartConfig} className="h-72 w-full min-w-0">
      <AreaChart accessibilityLayer data={data} margin={{ left: 4, right: 8, top: 8 }}>
        <CartesianGrid vertical={false} strokeOpacity={0.45} />
        <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} minTickGap={28} />
        <YAxis
          tickLine={false}
          axisLine={false}
          width={68}
          tickMargin={8}
          tickFormatter={(value) => `${Math.round(Number(value) / 1000)}k`}
        />
        <ChartTooltip
          cursor={false}
          content={
            <ChartTooltipContent
              indicator="line"
              labelFormatter={(value) => String(value)}
              formatter={(value, name) => (
                <div className="flex flex-1 items-center justify-between gap-4 leading-none">
                  <span className="text-muted-foreground">{chartConfig[String(name) as keyof typeof chartConfig]?.label ?? String(name)}</span>
                  <span className="font-mono font-medium tabular-nums text-foreground">{formatDashboardCurrency(Number(value))}</span>
                </div>
              )}
            />
          }
        />
        <ChartLegend content={<ChartLegendContent className="pt-4" />} />
        <Area
          dataKey="rentalRevenue"
          type="monotone"
          fill="var(--color-rentalRevenue)"
          fillOpacity={0.12}
          stroke="var(--color-rentalRevenue)"
          strokeWidth={2}
          dot={false}
        />
        <Area
          dataKey="deliveryRevenue"
          type="monotone"
          fill="var(--color-deliveryRevenue)"
          fillOpacity={0.08}
          stroke="var(--color-deliveryRevenue)"
          strokeWidth={1.5}
          dot={false}
        />
        <Area
          dataKey="collectedTotal"
          type="monotone"
          fill="var(--color-collectedTotal)"
          fillOpacity={0.05}
          stroke="var(--color-collectedTotal)"
          strokeWidth={1.5}
          dot={false}
        />
      </AreaChart>
    </ChartContainer>
  );
}

export function DashboardFinancialSection({
  financials,
  trends,
  groupBy,
  isLoading,
  isError,
}: {
  financials: DashboardFinancials;
  trends?: DashboardTrends;
  groupBy: DashboardTrendGroupBy;
  isLoading: boolean;
  isError: boolean;
}) {
  return (
    <Card className="border-accent/60 shadow-none">
      <CardHeader>
        <CardTitle>Tài chính vận hành</CardTitle>
        <CardDescription>
          Số liệu lấy từ snapshot đơn thuê trong kỳ; “Đã thu” không phải doanh thu và tiền cọc không được gộp vào doanh thu.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-5">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <FinancialMetric
            label={dashboardFinancialMetricConfig.rentalRevenue.label}
            value={formatDashboardCurrency(financials.rentalRevenue)}
            description={dashboardFinancialMetricConfig.rentalRevenue.description}
          />
          <FinancialMetric
            label={dashboardFinancialMetricConfig.deliveryRevenue.label}
            value={formatDashboardCurrency(financials.deliveryRevenue)}
            description={dashboardFinancialMetricConfig.deliveryRevenue.description}
          />
          <FinancialMetric
            label={dashboardFinancialMetricConfig.collectedTotal.label}
            value={formatDashboardCurrency(financials.collectedTotal)}
            description={dashboardFinancialMetricConfig.collectedTotal.description}
          />
          <FinancialMetric
            label={dashboardFinancialMetricConfig.depositHeldTotal.label}
            value={formatDashboardCurrency(financials.depositHeldTotal)}
            description={dashboardFinancialMetricConfig.depositHeldTotal.description}
          />
        </div>

        <div className="grid gap-3 border-t border-accent/60 pt-4 sm:grid-cols-2 lg:grid-cols-5">
          <FinancialMetric
            label={dashboardFinancialMetricConfig.amountDueBeforeHandover.label}
            value={formatDashboardCurrency(financials.amountDueBeforeHandover)}
            description={dashboardFinancialMetricConfig.amountDueBeforeHandover.description}
          />
          <FinancialMetric
            label={dashboardFinancialMetricConfig.refundDueTotal.label}
            value={formatDashboardCurrency(financials.refundDueTotal)}
            description={dashboardFinancialMetricConfig.refundDueTotal.description}
          />
          <FinancialMetric
            label={dashboardFinancialMetricConfig.pendingRefundTotal.label}
            value={formatDashboardCurrency(financials.pendingRefundTotal)}
            description={dashboardFinancialMetricConfig.pendingRefundTotal.description}
          />
          <FinancialMetric
            label={dashboardFinancialMetricConfig.damageCompensationTotal.label}
            value={formatDashboardCurrency(financials.damageCompensationTotal)}
            description={dashboardFinancialMetricConfig.damageCompensationTotal.description}
          />
          <FinancialMetric
            label={dashboardFinancialMetricConfig.repairCostTotal.label}
            value={formatDashboardCurrency(financials.repairCostTotal)}
            description={dashboardFinancialMetricConfig.repairCostTotal.description}
          />
        </div>

        <div className="grid gap-2 border-t border-accent/60 pt-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-semibold">Xu hướng tiền theo kỳ thuê</h3>
              <p className="text-xs text-muted-foreground">Nhóm theo {groupBy === 'DAY' ? 'ngày' : groupBy === 'WEEK' ? 'tuần' : 'tháng'}.</p>
            </div>
            <span className="text-xs text-muted-foreground">Đơn vị: VNĐ</span>
          </div>
          <FinancialTrendChart trends={trends} isLoading={isLoading} isError={isError} />
        </div>
      </CardContent>
    </Card>
  );
}
