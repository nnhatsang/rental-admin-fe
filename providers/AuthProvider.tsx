'use client';

import { useAuthStore } from '@/modules/auth/store';
import { canAccessRoute } from '@/utils/consts/route-permission.const';
import { notFound, usePathname } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { useSocket } from '@/hooks/use-socket';

const PUBLIC_ROUTES = ['/auth', '/auth/login', '/auth/forgot-password', '/auth/reset-password'];

const isPublicRoute = (pathname: string) => {
  return PUBLIC_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`));
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  useSocket();
  const pathname = usePathname();
  const fetchProfile = useAuthStore((state) => state.fetchProfile);
  const permissions = useAuthStore((state) => state.permissions);
  const isLoading = useAuthStore((state) => state.isLoading);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const [isProfileChecked, setIsProfileChecked] = useState(false);
  const isPublic = useMemo(() => isPublicRoute(pathname), [pathname]);

  // 1. Đồng bộ profile khi vào trang private
  useEffect(() => {
    const init = async () => {
      if (!isPublic) {
        try {
          await fetchProfile();
        } catch (err) {
          console.error('Lỗi đồng bộ profile khi khởi tạo:', err);
        }
      }
      setIsProfileChecked(true);
    };
    init();
  }, [isPublic, fetchProfile]);

  // 2. Bảo vệ route và phân quyền truy cập
  useEffect(() => {
    if (!isPublic && isProfileChecked && isAuthenticated) {
      if (!canAccessRoute(pathname, permissions)) {
        notFound();
      }
    }
  }, [isPublic, pathname, permissions, isAuthenticated, isProfileChecked]);

  // Loading spinner chặn hiển thị trang bảo mật cho đến khi check xong
  if (!isPublic && (!isProfileChecked || isLoading)) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
      </div>
    );
  }

  return <>{children}</>;
}
