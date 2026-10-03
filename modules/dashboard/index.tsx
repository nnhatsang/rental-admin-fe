'use client';

import { DashboardAvailabilitySummary } from './components/availability/availability-summary';
import { DashboardAttentionList } from './components/attention/attention-list';
import { DashboardFinancialSection } from './components/charts/financial-trend-chart';
import { DashboardTopAnalytics } from './components/charts/top-analytics';
import { DashboardErrorState, DashboardPermissionState } from './components/dashboard-error-state';
import { DashboardHeader } from './components/dashboard-header';
import { DashboardLoading } from './components/dashboard-loading';
import { DashboardSchedulePreview } from './components/schedule/schedule-preview';
import { DashboardSummaryCards } from './components/summary/dashboard-summary-cards';
import { useDashboardLogic } from './hooks/dashboard-logic';

export default function Dashboard() {
  const dashboard = useDashboardLogic();
  const overview = dashboard.overview.data;
  const attentionItems = dashboard.attention.data?.items ?? overview?.attentionPreview ?? [];

  if (!dashboard.hasAccess) {
    return (
      <div className="@container/main flex min-w-0 flex-col gap-5">
        <DashboardPermissionState />
      </div>
    );
  }

  return (
    <div className="@container/main flex min-w-0 flex-col gap-5 md:gap-6">
      <DashboardHeader
        dateRange={dashboard.dateRange}
        onDateRangeChange={dashboard.updateDateRange}
        onPresetChange={dashboard.applyPreset}
        includeCancelled={dashboard.includeCancelled}
        onIncludeCancelledChange={dashboard.setIncludeCancelled}
        groupBy={dashboard.groupBy}
        onGroupByChange={dashboard.setGroupBy}
        isFetching={dashboard.isFetching}
        onRefresh={() => void dashboard.refetchAll()}
      />

      {dashboard.overview.isError ? (
        <DashboardErrorState onRetry={() => void dashboard.refetchAll()} />
      ) : dashboard.overview.isLoading || !overview ? (
        <DashboardLoading />
      ) : (
        <div className="grid min-w-0 gap-6">
          <DashboardSummaryCards summary={overview.summary} />
          <DashboardAvailabilitySummary availability={overview.availability} />
          <DashboardFinancialSection
            financials={overview.financials}
            trends={dashboard.trends.data}
            groupBy={dashboard.groupBy}
            isLoading={dashboard.trends.isLoading}
            isError={dashboard.trends.isError}
          />
          <DashboardTopAnalytics products={overview.topProducts} assets={overview.topAssets} />
          <div className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1.25fr)_minmax(340px,0.75fr)]">
            <DashboardAttentionList
              items={attentionItems}
              isLoading={dashboard.attention.isLoading}
              isError={dashboard.attention.isError}
            />
            <DashboardSchedulePreview items={overview.schedulePreview} />
          </div>
        </div>
      )}
    </div>
  );
}
