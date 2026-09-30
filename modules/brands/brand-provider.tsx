'use client';

import useDialogState from '@/hooks/use-dialog-state';
import { createContext, type Dispatch, type ReactNode, type SetStateAction, useContext, useMemo, useState } from 'react';
import type { IBrandOut } from './type';

export type BrandsDialogType = 'view' | 'add' | 'edit' | 'delete' | 'status' | 'delete-multi';

type BrandsContextValue = {
  open: BrandsDialogType | null;
  setOpen: (value: BrandsDialogType | null) => void;
  currentRow: IBrandOut | null;
  setCurrentRow: Dispatch<SetStateAction<IBrandOut | null>>;
};

const BrandsContext = createContext<BrandsContextValue | null>(null);

export function BrandsProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useDialogState<BrandsDialogType>(null);
  const [currentRow, setCurrentRow] = useState<IBrandOut | null>(null);
  const value = useMemo(() => ({ open, setOpen, currentRow, setCurrentRow }), [open, setOpen, currentRow]);

  return <BrandsContext value={value}>{children}</BrandsContext>;
}

export function useBrands() {
  const context = useContext(BrandsContext);
  if (!context) throw new Error('useBrands must be used within a BrandsProvider');
  return context;
}
