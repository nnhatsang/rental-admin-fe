'use client';

import { useAuthStore } from '@/modules/auth/store';
import { AuthBootstrapError, AuthBootstrapScreen } from '@/modules/auth/components/auth-bootstrap-screen';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';

const PUBLIC_ROUTES = ['/auth', '/auth/login', '/auth/forgot-password', '/auth/reset-password'];

const isPublicRoute = (pathname: string) => {
  return PUBLIC_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`));
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const fetchProfile = useAuthStore((state) => state.fetchProfile);

  const isPublic = isPublicRoute(pathname);
  const scope = isPublic ? 'public' : 'private';
  const [checkedScope, setCheckedScope] = useState<'public' | 'private' | null>(null);
  const [bootstrapState, setBootstrapState] = useState<'checking' | 'ready' | 'error'>('checking');
  const [retryCount, setRetryCount] = useState(0);
  const profileRequestRef = useRef<Promise<void> | null>(null);

  const fetchProfileOnce = useCallback(() => {
    if (!profileRequestRef.current) {
      profileRequestRef.current = fetchProfile().finally(() => {
        profileRequestRef.current = null;
      });
    }

    return profileRequestRef.current;
  }, [fetchProfile]);

  useEffect(() => {
    if (scope === 'public') {
      setCheckedScope('public');
      setBootstrapState('ready');
      return;
    }

    let cancelled = false;
    setBootstrapState('checking');

    fetchProfileOnce()
      .then(() => {
        if (cancelled) return;

        setCheckedScope('private');
        setBootstrapState('ready');
      })
      .catch((error) => {
        if (cancelled) return;

        console.error('Lỗi đồng bộ profile khi khởi tạo:', error);
        setCheckedScope('private');
        setBootstrapState('error');
      });

    return () => {
      cancelled = true;
    };
  }, [fetchProfileOnce, retryCount, scope]);

  const retryBootstrap = () => {
    setBootstrapState('checking');
    setRetryCount((count) => count + 1);
  };

  if (!isPublic) {
    if (checkedScope !== scope || bootstrapState === 'checking') {
      return <AuthBootstrapScreen />;
    }

    if (bootstrapState === 'error') {
      return <AuthBootstrapError onRetry={retryBootstrap} />;
    }
  }

  return <>{children}</>;
}
