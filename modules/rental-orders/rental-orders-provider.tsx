'use client';

import useDialogState from '@/hooks/use-dialog-state';
import { createContext, type ReactNode, useContext, useMemo } from 'react';

export type RentalOrdersDialogType = 'create';

type RentalOrdersContextValue = {
  open: RentalOrdersDialogType | null;
  setOpen: (value: RentalOrdersDialogType | null) => void;
};

const RentalOrdersContext = createContext<RentalOrdersContextValue | null>(null);

export function RentalOrdersProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useDialogState<RentalOrdersDialogType>(null);
  const value = useMemo(() => ({ open, setOpen }), [open, setOpen]);

  return <RentalOrdersContext value={value}>{children}</RentalOrdersContext>;
}

export function useRentalOrders() {
  const context = useContext(RentalOrdersContext);

  if (!context) {
    throw new Error('useRentalOrders must be used within <RentalOrdersProvider>');
  }

  return context;
}
