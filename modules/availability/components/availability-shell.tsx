'use client';

import type { ReactNode } from 'react';

export function AvailabilityShell({ children }: { children: ReactNode }) {
  return <div className="space-y-4">{children}</div>;
}
