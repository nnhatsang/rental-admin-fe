import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import type { IAvailabilityProduct } from '../type';

export function ProductAvailabilityCard({
  product,
  onAdd,
  onViewAssets,
}: {
  product: IAvailabilityProduct;
  onAdd: () => void;
  onViewAssets: () => void;
}) {
  const state = product.availabilityState;
  const badgeVariant = state === 'UNAVAILABLE' ? 'destructive' : state === 'LOW_STOCK' ? 'outline' : 'secondary';
  const percent = product.inventory.total ? (product.inventory.available / product.inventory.total) * 100 : 0;

  return (
    <Card className="gap-4">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <CardTitle className="truncate">{product.name}</CardTitle>
            <p className="text-sm text-muted-foreground">{product.sku}</p>
          </div>
          <Badge variant={badgeVariant}>
            {state === 'UNAVAILABLE' ? 'Hết hàng' : state === 'LOW_STOCK' ? 'Sắp hết' : 'Còn hàng'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex justify-between text-sm">
          <span>Tổng máy cho thuê</span>
          <strong>
            Còn {product.inventory.available}/{product.inventory.total}
          </strong>
        </div>
        <Progress value={percent} />
        {!!product.inventory.reserved && <p className="text-xs text-muted-foreground">{product.inventory.reserved} máy đã được giữ.</p>}
      </CardContent>
      <CardFooter className="grid grid-cols-2 gap-2">
        <Button variant="outline" onClick={onViewAssets}>
          Xem serial
        </Button>
        <Button onClick={onAdd} disabled={!product.inventory.available}>
          Thêm
        </Button>
      </CardFooter>
    </Card>
  );
}
