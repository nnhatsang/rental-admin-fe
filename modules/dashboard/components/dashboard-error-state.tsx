'use client';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { IconRefresh, IconShieldLock } from '@tabler/icons-react';

export function DashboardErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <Alert variant="destructive" role="alert">
      <IconRefresh aria-hidden="true" />
      <AlertTitle>Không thể tải Dashboard vận hành</AlertTitle>
      <AlertDescription className="flex flex-wrap items-center gap-3">
        Kiểm tra kết nối hoặc quyền truy cập rồi thử lại.
        <Button type="button" variant="outline" size="sm" onClick={onRetry}>
          <IconRefresh aria-hidden="true" data-icon="inline-start" />
          Thử lại
        </Button>
      </AlertDescription>
    </Alert>
  );
}

export function DashboardPermissionState() {
  return (
    <Alert role="status">
      <IconShieldLock aria-hidden="true" />
      <AlertTitle>Không có quyền xem dashboard vận hành</AlertTitle>
      <AlertDescription>Tài khoản của bạn cần quyền xem đơn thuê để truy cập các số liệu vận hành.</AlertDescription>
    </Alert>
  );
}
