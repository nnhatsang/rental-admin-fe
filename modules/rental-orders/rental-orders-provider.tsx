'use client';

import useDialogState from '@/hooks/use-dialog-state';
import { createContext, type Dispatch, type ReactNode, type SetStateAction, useContext, useMemo, useState } from 'react';
import type { RentalOrderListItem } from './model';

export type RentalOrderDialogType = 'create' | 'update' | 'detail' | 'payment' | 'refund' | 'handover' | 'return' | 'inspection' | 'settle' | 'cancel' | 'close-cancellation';
export type RentalOrderRowReference = Pick<RentalOrderListItem, 'id' | 'code'>;

type RentalOrdersContextValue = {
  open: RentalOrderDialogType | null;
  setOpen: (value: RentalOrderDialogType | null) => void;
  currentRow: RentalOrderRowReference | null;
  setCurrentRow: Dispatch<SetStateAction<RentalOrderRowReference | null>>;
};

const RentalOrdersContext = createContext<RentalOrdersContextValue | null>(null);

export function RentalOrdersProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useDialogState<RentalOrderDialogType>(null);
  const [currentRow, setCurrentRow] = useState<RentalOrderRowReference | null>(null);
  const value = useMemo(() => ({ open, setOpen, currentRow, setCurrentRow }), [open, setOpen, currentRow]);
  return <RentalOrdersContext value={value}>{children}</RentalOrdersContext>;
}

export function useRentalOrders() {
  const context = useContext(RentalOrdersContext);
  if (!context) throw new Error('useRentalOrders must be used within <RentalOrdersProvider>');
  return context;
}
