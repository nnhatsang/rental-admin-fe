import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { dashboardAvailabilityMetricConfig } from '../../display-config';
import type { DashboardAvailability, DashboardAvailabilityMetricKey } from '../../model';

const metricKeys: DashboardAvailabilityMetricKey[] = [
  'totalAssets',
  'scheduledAssets',
  'freeAssets',
  'unavailableAssets',
  'maintenanceAssets',
  'lostAssets',
  'damagedAssets',
];

export function DashboardAvailabilitySummary({ availability }: { availability: DashboardAvailability }) {
  return (
    <Card className="border-accent/60 shadow-none">
      <CardHeader>
        <CardTitle>Tình trạng thiết bị</CardTitle>
        <CardDescription>Đọc riêng lịch thuê và tình trạng vật lý để không nhầm “trống theo lịch” với “sẵn sàng để giao”.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {metricKeys.map((metricKey) => {
          const config = dashboardAvailabilityMetricConfig[metricKey];
          const Icon = config.icon;
          return (
            <div key={metricKey} className="flex min-w-0 items-start gap-3 rounded-lg bg-muted/20 p-3">
              <span className={cn('flex size-8 shrink-0 items-center justify-center rounded-md', config.className)}>
                <Icon className="size-4" aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-sm font-medium">{config.label}</span>
                  <strong className="text-lg tabular-nums">{availability[metricKey].toLocaleString('vi-VN')}</strong>
                </div>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{config.description}</p>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
