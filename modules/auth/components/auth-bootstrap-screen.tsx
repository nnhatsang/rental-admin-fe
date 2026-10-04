'use client';

import { IconAlertCircle, IconAlertTriangle, IconLoader2, IconRefresh, IconShieldLock } from '@tabler/icons-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';

export function AuthBootstrapScreen() {
  return (
    <main
      className="grid min-h-dvh place-items-center bg-background"
      role="status"
      aria-live="polite"
      aria-label="Đang kiểm tra phiên đăng nhập"
    >
      <div className="relative flex items-center justify-center">

        <div className="relative flex  animate-pulse items-center justify-center">
          <Image
            src="/Admin.svg"
            alt="Logo"
            width={56}
            height={56}
            priority
            className="size-40 animate-[spin_3s_linear_infinite] object-contain"
          />
        </div>
      </div>
    </main>
  );
}

export function AuthBootstrapError({ onRetry }: { onRetry: () => void }) {
  return (
    <main className="grid min-h-dvh place-items-center bg-background px-4">
      <div className="flex w-full max-w-sm flex-col items-center text-center">
        <div className="relative mb-6">
          <div className="absolute inset-0 scale-150 rounded-full bg-destructive/10 blur-2xl" />

          <div className="relative flex size-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
            <IconAlertTriangle className="size-7" aria-hidden="true" />
          </div>
        </div>

        <h1 className="text-xl font-semibold tracking-tight">Không thể truy cập hệ thống</h1>

        <p className="mt-2 max-w-xs text-sm leading-6 text-muted-foreground">
          Đã xảy ra sự cố khi kết nối đến hệ thống. Vui lòng thử lại sau.
        </p>

        <Button type="button" variant="outline" size="lg" className="mt-6 px-2" onClick={onRetry}>
          <IconRefresh className="size-4" />
          Thử lại
        </Button>
      </div>
    </main>
  );
}
