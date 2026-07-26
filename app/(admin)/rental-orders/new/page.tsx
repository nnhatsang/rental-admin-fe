import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

export default function Page() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Tao don thue</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Flow tao don thue se tu check availability trong module don thue, khong lay draft tu man Availability.
        </p>
        <Button asChild>
          <Link href="/availability/products">Xem trang thai may</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
