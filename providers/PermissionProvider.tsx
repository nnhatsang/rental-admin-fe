'use client';

import { useAuthStore } from '@/modules/auth/store';
import { canAccessRoute } from '@/utils/consts/route-permission.const';
import { usePathname } from 'next/navigation';
import DashboardNotFound from '@/app/(admin)/[...not-found]/page';

export function PermissionProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const permissions = useAuthStore((s) => s.permissions);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  if (isAuthenticated && !canAccessRoute(pathname, permissions)) {
    return <DashboardNotFound />;
  }

  return <>{children}</>;
}
