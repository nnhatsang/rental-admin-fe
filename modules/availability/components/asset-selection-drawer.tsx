'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Spinner } from '@/components/ui/spinner';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatDate } from '@/lib/utils';
import { IconAlertTriangle, IconCircleCheck, IconRefresh, IconSearch } from '@tabler/icons-react';
import { ArrowLeft } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useAvailability } from '../availability-provider';
import { useGetAvailabilityAssets } from '../hooks/use-get-availability-assets';
import type { AssetAvailabilityReason, AvailabilityFilter, IAvailabilityAsset } from '../type';

const reasonLabel: Record<AssetAvailabilityReason, string> = {
  BOOKED: 'Đã có lịch thuê',
  INACTIVE: 'Đang tạm ngừng',
  MAINTENANCE: 'Đang bảo trì',
  RETIRED: 'Ngừng sử dụng',
  LOST: 'Thất lạc',
};

const getAssetStatusLabel = (asset: IAvailabilityAsset) => {
  if (asset.availability === 'AVAILABLE') return 'Còn trống';
  return asset.reasonCode ? reasonLabel[asset.reasonCode] : 'Không khả dụng';
};
export function AssetSelectionDrawer() {
  const { selectedProduct, startDate, endDate, isAssetDrawerOpen, setAssetDrawerOpen, assetTab, setAssetTab } =
    useAvailability();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const params = useMemo(
    () => ({
      productId: selectedProduct?.productId ?? '',
      startDate,
      endDate,
      search: search || undefined,
      availability: assetTab,
      page,
      perPage: 20,
    }),
    [assetTab, endDate, page, search, selectedProduct?.productId, startDate],
  );
  const canQuery = isAssetDrawerOpen && !!selectedProduct && !!startDate && !!endDate;
  const query = useGetAvailabilityAssets(params, canQuery);

  const setTab = (tab: AvailabilityFilter) => {
    setPage(1);
    setAssetTab(tab);
  };

  return (
    <Sheet open={isAssetDrawerOpen} onOpenChange={setAssetDrawerOpen}>
      <SheetContent showCloseButton={false} className="w-80 p-0 max-md:w-full flex flex-col">
        <SheetHeader className="border-b px-5 py-4">
          <div className="flex items-start gap-4">
            <Button
              variant="link"
              size="icon"
              className="size-10 shrink-0 rounded-full"
              onClick={() => setAssetDrawerOpen(false)}
            >
              <ArrowLeft className="size-5" />
            </Button>

            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-4">
                <SheetTitle className="truncate text-lg">{selectedProduct?.name ?? 'Danh sách serial'}</SheetTitle>

                <Badge variant="secondary" className="shrink-0">
                  Còn trống: <span className="ml-1 font-semibold">{query.data?.availableQuantity ?? 0}</span>
                </Badge>
              </div>

              <p className="mt-1 text-sm text-muted-foreground">
                {startDate && endDate
                  ? `${formatDate(startDate)} - ${formatDate(endDate)}`
                  : 'Chọn khoảng thời gian để xem danh sách serial.'}
              </p>
            </div>
          </div>
        </SheetHeader>
        <div className="flex min-h-0 flex-1 flex-col gap-4 px-5 py-4">
          <div className="flex flex-col gap-2 sm:flex-row">
            <Tabs value={assetTab} onValueChange={(value) => setTab(value as AvailabilityFilter)} className="flex-1">
              <TabsList className="grid h-10 w-full grid-cols-2">
                <TabsTrigger value="AVAILABLE">
                  <IconCircleCheck className="size-4 text-emerald-600" />
                  Còn trống
                </TabsTrigger>

                <TabsTrigger value="UNAVAILABLE">
                  <IconAlertTriangle className="size-4 text-amber-600" />
                  Không khả dụng
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <Button variant="outline" disabled={!canQuery || query.isFetching} onClick={() => void query.refetch()}>
              <IconRefresh className="size-4" />
            </Button>
          </div>

          <div className="relative">
            <IconSearch className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Tìm theo serial..."
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
            />
          </div>

          <div className="min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
            {query.isLoading && (
              <div className="flex justify-center py-12">
                <Spinner />
              </div>
            )}

            {query.data?.items.map((asset) => {
              const available = asset.availability === 'AVAILABLE';
              return (
                <div key={asset.assetUnitId} className="w-full rounded-xl border bg-background p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-medium">{asset.serialNumber}</p>{' '}
                      <p className="text-xs text-muted-foreground">
                        {asset.status} · {asset.condition}
                      </p>
                    </div>
                    <Badge variant={available ? 'secondary' : 'outline'}>{getAssetStatusLabel(asset)}</Badge>
                  </div>
                  {asset.conflictBlockedEndDate && (
                    <p className="mt-3 text-xs text-muted-foreground">
                      Bị khóa đến {formatDate(asset.conflictBlockedEndDate)}
                    </p>
                  )}
                </div>
              );
            })}

            {query.data && !query.data.items.length && (
              <div className="rounded-xl border border-dashed py-12 text-center text-sm text-muted-foreground">
                Không tìm thấy thiết bị phù hợp.
              </div>
            )}
          </div>
        </div>

        <SheetFooter className="border-t px-5 py-4">
          <div className="flex w-full items-center justify-between gap-3">
            <Button variant="outline" disabled={page <= 1} onClick={() => setPage((value) => value - 1)}>
              Trước
            </Button>

            <span className="text-sm text-muted-foreground">
              Trang {query.data?.pagination.page ?? 1}/{query.data?.pagination.totalPage ?? 1}
            </span>

            <Button
              variant="outline"
              disabled={!query.data || page >= query.data.pagination.totalPage}
              onClick={() => setPage((value) => value + 1)}
            >
              Sau
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
