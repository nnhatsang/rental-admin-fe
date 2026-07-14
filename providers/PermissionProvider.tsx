'use client';

import DashboardNotFound from '@/components/shared/dashboard-not-found';
import { useAuthStore } from '@/modules/auth/store';
import { canAccessSidebarRoute } from '@/utils/consts/sidebar.const';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';

export function PermissionProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const permissions = useAuthStore((s) => s.permissions);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const router = useRouter();

  // if (isAuthenticated && !canAccessSidebarRoute(pathname, permissions)) {
  //   // return <DashboardNotFound />;
  // }

  const canAccess = !isAuthenticated || canAccessSidebarRoute(pathname, permissions);

  useEffect(() => {
    if (!canAccess) {
      router.replace('not-found');
    }
  }, [canAccess, router]);

  if (!canAccess) {
    return null;
  }

  return <>{children}</>;
}
