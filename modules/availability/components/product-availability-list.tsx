import { Button } from '@/components/ui/button';
import type { IAvailabilityProduct, IAvailabilityProductsData } from '../type';
import { AvailabilityEmpty } from './availability-empty';
import { AvailabilitySkeleton } from './availability-skeleton';
import { ProductAvailabilityCard } from './product-availability-card';

export function ProductAvailabilityList({
  data,
  isLoading,
  page,
  setPage,
  onAdd,
  onViewAssets,
}: {
  data?: IAvailabilityProductsData;
  isLoading: boolean;
  page: number;
  setPage: (page: number) => void;
  onAdd: (product: IAvailabilityProduct) => void;
  onViewAssets: (product: IAvailabilityProduct) => void;
}) {
  if (isLoading) return <AvailabilitySkeleton />;
  if (!data?.items.length)
    return (
      <AvailabilityEmpty
        title="Không có sản phẩm phù hợp"
        description="Hãy đổi khoảng thời gian hoặc bộ lọc để kiểm tra lại."
      />
    );
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
        {data.items.map((product) => (
          <ProductAvailabilityCard
            key={product.productId}
            product={product}
            onAdd={() => onAdd(product)}
            onViewAssets={() => onViewAssets(product)}
          />
        ))}
      </div>
      <div className="flex items-center justify-center gap-3">
        <Button variant="outline" disabled={page <= 1} onClick={() => setPage(page - 1)}>
          Trang trước
        </Button>
        <span className="text-sm text-muted-foreground">
          Trang {data.pagination.page}/{data.pagination.totalPage}
        </span>
        <Button variant="outline" disabled={page >= data.pagination.totalPage} onClick={() => setPage(page + 1)}>
          Trang sau
        </Button>
      </div>
    </div>
  );
}
