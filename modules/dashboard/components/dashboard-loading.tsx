import { Skeleton } from '@/components/ui/skeleton';

export function DashboardLoading() {
  return (
    <div role="status" aria-label="Đang tải dashboard" className="grid gap-5">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }, (_, index) => <Skeleton key={index} className="h-32" />)}
      </div>
      <Skeleton className="h-[620px]" />
      <div className="grid gap-3 xl:grid-cols-2">
        <Skeleton className="h-80" />
        <Skeleton className="h-80" />
      </div>
    </div>
  );
}
