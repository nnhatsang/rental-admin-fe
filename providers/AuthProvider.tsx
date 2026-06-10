'use client';

import { useAuthStore } from '@/stores/auth.store';
import { canAccessRoute } from '@/utils/consts/route-permission.const';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

const PUBLIC_ROUTES = ['/auth', '/auth/login', '/auth/forgot-password', '/auth/reset-password'];

const isPublicRoute = (pathname: string) => {
  return PUBLIC_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`));
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const fetchProfile = useAuthStore((state) => state.fetchProfile);
  const permissions = useAuthStore((state) => state.permissions);
  const isLoading = useAuthStore((state) => state.isLoading);
  const [isProfileChecked, setIsProfileChecked] = useState(false);

  const isPublic = useMemo(() => isPublicRoute(pathname), [pathname]);

  useEffect(() => {
    let isMounted = true;

    const syncProfile = async () => {
      if (isPublic) {
        setIsProfileChecked(true);
        return;
      }

      setIsProfileChecked(false);
      await fetchProfile();

      if (!isMounted) {
        return;
      }

      setIsProfileChecked(true);
    };

    syncProfile();

    return () => {
      isMounted = false;
    };
  }, [fetchProfile, isPublic, pathname, router]);

  useEffect(() => {
    if (isPublic || !isProfileChecked) return;

    if (!canAccessRoute(pathname, permissions)) {
      router.replace('/');
    }
  }, [isProfileChecked, isPublic, pathname, permissions, router]);

  if (!isPublic && (!isProfileChecked || isLoading)) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
      </div>
    );
  }

  return <>{children}</>;
}
