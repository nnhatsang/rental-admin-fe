'use client';

import { IconDevices, IconUserCircle } from '@tabler/icons-react';
import { usePathname, useRouter } from 'next/navigation';

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

const tabs = [
  { id: 'profile', label: 'Thông tin cá nhân', icon: IconUserCircle, href: '/account' },
  { id: 'sessions', label: 'Phiên đăng nhập', icon: IconDevices, href: '/account/sessions' },
] as const;

type AccountTabId = (typeof tabs)[number]['id'];

const getActiveTab = (pathname: string): AccountTabId => {
  return pathname.startsWith('/account/sessions') ? 'sessions' : 'profile';
};

export function AccountTabs() {
  const pathname = usePathname();
  const router = useRouter();
  const isMobile = useIsMobile();
  const activeTab = getActiveTab(pathname);

  const handleTabChange = (value: string) => {
    const nextTab = tabs.find((tab) => tab.id === value);
    if (!nextTab || nextTab.id === activeTab) return;

    router.push(nextTab.href);
  };

  return (
    <Tabs
      value={activeTab}
      onValueChange={handleTabChange}
      orientation={isMobile ? 'horizontal' : 'vertical'}
      aria-label="Khu vực tài khoản"
      className="flex min-w-0 flex-col gap-4 md:w-48 md:shrink-0"
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
    </Tabs>
  );
}
