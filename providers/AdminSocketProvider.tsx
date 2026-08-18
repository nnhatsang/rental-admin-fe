'use client';

import { useSocket } from '@/hooks/use-socket';

export function AdminSocketProvider() {
  useSocket();

  return null;
}
