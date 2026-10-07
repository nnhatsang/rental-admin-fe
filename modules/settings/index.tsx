'use client';

import { IconCalendarEvent, IconClock, IconSettings, IconShieldLock } from '@tabler/icons-react';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Card, CardAction, CardContent, CardHeader } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuthStore } from '@/modules/auth/store';
import { BusinessHoursForm } from '@/modules/store-business-hours/components/business-hours-form';
import { StoreClosuresPanel } from '@/modules/store-closures/components/store-closures-panel';
import { SystemSettingsForm } from '@/modules/system-settings/components/system-settings-form';
import { cn } from '@/lib/utils';
import { PermissionCode } from '@/utils/consts/rbac.const';
import { Separator } from '@/components/ui/separator';

const tabs = [
  { id: 'rental', label: 'Quy tắc cho thuê', icon: IconSettings },
  { id: 'hours', label: 'Giờ hoạt động', icon: IconClock },
  { id: 'closures', label: 'Ngày đóng cửa', icon: IconCalendarEvent },
];

export default function Settings() {
  const permissions = useAuthStore((state) => state.permissions);
  const isMobile = useIsMobile();
  const canRead = permissions.includes(PermissionCode.SettingsRead);
  const canEdit = permissions.includes(PermissionCode.SettingsUpdate);

  if (!canRead) {
    return (
      <Alert variant="destructive">
        <IconShieldLock aria-hidden="true" />
        <AlertTitle>Bạn không có quyền xem cài đặt</AlertTitle>
        <AlertDescription>Liên hệ quản trị viên để được cấp quyền settings.read.</AlertDescription>
      </Alert>
    );
  }

  return (
    <main className="@container/main flex min-w-0 flex-col gap-5">
      <Card className="flex min-w-0 flex-col gap-2">
        <CardHeader>
          <div className="grid min-w-0 max-w-full auto-rows-min gap-1.5">
            <h1 className="text-xl leading-none font-semibold">Cài đặt hệ thống</h1>
            <p className="max-w-2xl text-sm leading-snug text-muted-foreground">
              Quản lý quy tắc thuê, giờ hoạt động và lịch đóng cửa của cửa hàng.
            </p>
          </div>
          <Separator className="mt-2 h-px w-full bg-border/50" />

          <CardAction>
            <Badge variant={canEdit ? 'secondary' : 'outline'}>
              <IconShieldLock data-icon="inline-start" />
              {canEdit ? 'Có quyền chỉnh sửa' : 'Chỉ xem'}
            </Badge>
          </CardAction>
        </CardHeader>

        <CardContent className="p-6 pt-0">
          <Tabs
            defaultValue="rental"
            orientation={isMobile ? 'horizontal' : 'vertical'}
            className="flex min-w-0 flex-col gap-4 md:flex-row"
          >
            <TabsList
              variant="line"
              className={cn(
                'no-scrollbar flex h-auto w-fit max-w-full shrink-0 items-stretch justify-start gap-1 overflow-x-auto',
                'md:w-48 md:max-w-none md:flex-col md:items-stretch md:gap-1 md:overflow-visible md:border-r md:border-b-0 md:pb-0 md:pr-4',
              )}
            >
              {tabs.map((tab) => {
                const Icon = tab.icon;

                return (
                  <TabsTrigger
                    key={tab.id}
                    value={tab.id}
                    className={cn(
                      'relative h-10 flex-none justify-start gap-2 rounded-md px-3 text-muted-foreground hover:bg-muted/60 hover:text-foreground data-active:bg-muted/60 data-active:text-foreground',
                      'md:w-full md:shrink-0 md:justify-start md:rounded-md md:py-2',
                      'md:after:inset-x-auto md:after:inset-y-1.5 md:after:right-[-17px] md:after:bottom-auto md:after:h-auto md:after:w-0.5 md:after:rounded-full md:after:bg-primary md:after:scale-y-0 md:after:transition-transform md:data-active:after:scale-y-100',
                    )}
                  >
                    <Icon aria-hidden="true" />
                    <span>{tab.label}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>

            <div className="min-w-0 flex-1 mt-2">
              <TabsContent value="rental" className="mt-0 min-w-0 focus-visible:outline-none">
                <SystemSettingsForm canEdit={canEdit} />
              </TabsContent>
              <TabsContent value="hours" className="mt-0 min-w-0 focus-visible:outline-none">
                <BusinessHoursForm canEdit={canEdit} />
              </TabsContent>
              <TabsContent value="closures" className="mt-0 min-w-0 focus-visible:outline-none">
                <StoreClosuresPanel canEdit={canEdit} />
              </TabsContent>
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </main>
  );
}
