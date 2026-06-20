'use client';

import * as React from 'react';
import { usePermission } from '@/hooks/use-permission';
import { PermissionCode } from '@/utils/consts/rbac.const';
import { cn } from '@/lib/utils';

export interface ProtectedActionProps {
  permission: PermissionCode | PermissionCode[];
  any?: boolean; // Nếu true, chỉ cần 1 trong các quyền. Nếu false, yêu cầu tất cả (mặc định: false)
  actionType?: 'hide' | 'disable'; // Cách xử lý khi không có quyền: ẩn đi hoặc vô hiệu hoá (mặc định: 'hide')
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export function ProtectedAction({
  permission,
  any = false,
  actionType = 'hide',
  fallback = null,
  children,
}: ProtectedActionProps) {
  const { canAny, canAll } = usePermission();
  const perms = Array.isArray(permission) ? permission : [permission];
  const hasAccess = any ? canAny(perms) : canAll(perms);

  if (!hasAccess) {
    if (actionType === 'disable' && React.isValidElement(children)) {
      const childElement = children as React.ReactElement<{ className?: string; disabled?: boolean }>;
      return React.cloneElement(childElement, {
        disabled: true,
        className: cn(childElement.props.className, 'opacity-50 pointer-events-none cursor-not-allowed'),
      });
    }
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
