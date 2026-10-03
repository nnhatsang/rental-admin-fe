'use client';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from '@/components/ui/empty';
import { IconCamera, IconTrophy } from '@tabler/icons-react';
import { formatDashboardCurrency, formatDashboardNumber } from '../../display-utils';
import type { DashboardTopAsset, DashboardTopProduct } from '../../model';

const productChartConfig = {
  rentalDeviceDays: { label: 'Ngày-thiết bị', color: 'var(--chart-2)' },
} satisfies ChartConfig;

function shortenLabel(value: string, maxLength = 18) {
  return value.length > maxLength ? `${value.slice(0, maxLength - 1)}…` : value;
}

function TopProductsChart({ products }: { products: DashboardTopProduct[] }) {
  if (!products.length) {
    return (
      <Empty className="min-h-60 border-0 p-0">
        <EmptyHeader>
          <EmptyTitle>Chưa có sản phẩm được thuê</EmptyTitle>
          <EmptyDescription>Chưa có dữ liệu sản phẩm trong khoảng thời gian này.</EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <div className="grid gap-4">
      <ChartContainer config={productChartConfig} className="h-64 w-full min-w-0">
        <BarChart accessibilityLayer data={products} layout="vertical" margin={{ left: 4, right: 12 }}>
          <CartesianGrid horizontal={false} strokeOpacity={0.45} />
          <XAxis type="number" dataKey="rentalDeviceDays" hide />
          <YAxis
            type="category"
            dataKey="productName"
            tickLine={false}
            axisLine={false}
            width={105}
            tickFormatter={(value) => shortenLabel(String(value))}
          />
          <ChartTooltip
            cursor={false}
            content={
              <ChartTooltipContent
                formatter={(value) => (
                  <div className="flex flex-1 items-center justify-between gap-4">
                    <span className="text-muted-foreground">Ngày-thiết bị</span>
                    <span className="font-mono font-medium tabular-nums text-foreground">{formatDashboardNumber(Number(value))}</span>
                  </div>
                )}
              />
            }
          />
          <Bar dataKey="rentalDeviceDays" fill="var(--color-rentalDeviceDays)" radius={4} barSize={24} />
        </BarChart>
      </ChartContainer>
      <div className="divide-y divide-accent/60 border-t border-accent/60 text-xs">
        {products.map((product) => (
          <div key={product.productId} className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 py-2 first:pt-3 last:pb-0">
            <span className="min-w-0 truncate font-medium">{product.productName}</span>
            <span className="text-muted-foreground">
              {formatDashboardNumber(product.rentedQuantity)} máy · {formatDashboardNumber(product.rentalDeviceDays)} ngày-thiết bị · {formatDashboardCurrency(product.rentalRevenue)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function TopAssetsList({ assets }: { assets: DashboardTopAsset[] }) {
  if (!assets.length) {
    return (
      <Empty className="min-h-60 border-0 p-0">
        <EmptyHeader>
          <EmptyTitle>Chưa có máy được bàn giao</EmptyTitle>
          <EmptyDescription>Chỉ allocation đã bàn giao hoặc đã trả mới được xếp hạng.</EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <div className="divide-y divide-accent/60">
      {assets.map((asset, index) => (
        <div key={asset.assetUnitId} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
          <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold tabular-nums">
            {index + 1}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <IconCamera className="size-4 shrink-0 text-chart-2" aria-hidden="true" />
              <span className="truncate text-sm font-medium">{asset.serialNumber}</span>
            </div>
            <p className="truncate text-xs text-muted-foreground">{asset.productName}</p>
          </div>
          <div className="shrink-0 text-right">
            <p className="text-sm font-semibold tabular-nums">{formatDashboardNumber(asset.rentalCount)} lượt</p>
            <p className="text-xs text-muted-foreground">{formatDashboardNumber(asset.rentalDeviceDays)} ngày-thiết bị</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export function DashboardTopAnalytics({ products, assets }: { products: DashboardTopProduct[]; assets: DashboardTopAsset[] }) {
  return (
    <section aria-labelledby="dashboard-top-heading" className="grid gap-3">
      <div>
        <h2 id="dashboard-top-heading" className="text-base font-semibold">
          Hiệu suất thiết bị
        </h2>
        <p className="text-sm text-muted-foreground">Những sản phẩm và máy được thuê nhiều nhất trong kỳ.</p>
      </div>
      <div className="grid min-w-0 gap-3 xl:grid-cols-2">
        <Card className="min-w-0 border-accent/60 shadow-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconTrophy className="size-4 text-chart-5" aria-hidden="true" />
              Sản phẩm thuê nhiều
            </CardTitle>
            <CardDescription>Xếp hạng theo tổng ngày-thiết bị, kèm số lượng và doanh thu tiền thuê.</CardDescription>
          </CardHeader>
          <CardContent>
            <TopProductsChart products={products} />
          </CardContent>
        </Card>
        <Card className="min-w-0 border-accent/60 shadow-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconCamera className="size-4 text-chart-2" aria-hidden="true" />
              Máy được thuê nhiều
            </CardTitle>
            <CardDescription>Chỉ tính allocation đã bàn giao hoặc đã trả, không tính giữ lịch.</CardDescription>
          </CardHeader>
          <CardContent>
            <TopAssetsList assets={assets} />
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
