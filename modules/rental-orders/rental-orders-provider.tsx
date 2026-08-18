'use client';

import useDialogState from '@/hooks/use-dialog-state';
import { createContext, type Dispatch, type ReactNode, type SetStateAction, useContext, useMemo, useState } from 'react';
import type { IRentalOrderListItemOut } from './type';

export type RentalOrdersDialogType =
  | 'create'
  | 'view'
  | 'edit'
  | 'payment'
  | 'handover'
  | 'complete'
  | 'refund'
  | 'cancel'
  | 'delete';


type RentalOrdersContextValue = {
  open: RentalOrdersDialogType | null;
  setOpen: (value: RentalOrdersDialogType | null) => void;
  currentRow: IRentalOrderListItemOut | null;
  setCurrentRow: Dispatch<SetStateAction<IRentalOrderListItemOut | null>>;
};

const RentalOrdersContext = createContext<RentalOrdersContextValue | null>(null);

export function RentalOrdersProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useDialogState<RentalOrdersDialogType>(null);
  const [currentRow, setCurrentRow] = useState<IRentalOrderListItemOut | null>(null);
  const value = useMemo(
    () => ({ open, setOpen, currentRow, setCurrentRow }),
    [open, setOpen, currentRow, setCurrentRow],
  );

  return <RentalOrdersContext value={value}>{children}</RentalOrdersContext>;
}

export function useRentalOrders() {
  const context = useContext(RentalOrdersContext);

  if (!context) {
    throw new Error('useRentalOrders must be used within <RentalOrdersProvider>');
  }

  return context;
}
