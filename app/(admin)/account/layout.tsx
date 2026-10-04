import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { AccountTabs } from '@/modules/account/components/account-tabs';

export default function AccountLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <main className="@container/main flex min-w-0 flex-col gap-5">
      <Card className="flex min-w-0 flex-col gap-2">
        <CardHeader>
          <div className="grid min-w-0 max-w-full auto-rows-min gap-1.5">
            <CardTitle className="text-xl leading-none">Tài khoản cá nhân</CardTitle>
            <CardDescription className="max-w-2xl leading-snug">
              Chỉnh sửa thông tin tài khoản, xem danh sách phiên đăng nhập.
            </CardDescription>
          </div>
          <Separator className="mt-2 h-px w-full bg-border/50" />
        </CardHeader>
        <CardContent className="flex min-w-0 flex-col gap-5 p-6 pt-0 md:flex-row">
          <AccountTabs />
          <div className="min-w-0 flex-1">{children}</div>
        </CardContent>
      </Card>
    </main>
  );
}
