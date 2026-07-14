'use client';

import { useAuthStore } from '@/modules/auth/store';
import { usePathname } from 'next/navigation';
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
  const isLoading = useAuthStore((state) => state.isLoading);

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

  // 2. Chặn render trước khi check xong
  if (!isPublic && (!isProfileChecked || isLoading)) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
      </div>
    );
  }

  return <>{children}</>;
}
