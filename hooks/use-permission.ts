'use client';

import { useAuthStore } from '@/modules/auth/store';
import { PermissionCode } from '@/utils/consts/rbac.const';

export function usePermission() {
  const permissions = useAuthStore((s) => s.permissions);

  const can = (permission: PermissionCode) => {
    return permissions.includes(permission);
  };

  const canAny = (perms: PermissionCode[]) => {
    return perms.some((p) => permissions.includes(p));
  };

  const canAll = (perms: PermissionCode[]) => {
    return perms.every((p) => permissions.includes(p));
  };

  return { can, canAny, canAll };
}
