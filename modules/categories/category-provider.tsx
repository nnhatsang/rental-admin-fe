'use client';

import useDialogState from '@/hooks/use-dialog-state';
import { createContext, type Dispatch, type ReactNode, type SetStateAction, useContext, useMemo, useState } from 'react';
import type { ICategoryOut } from './type';

export type CategoriesDialogType = 'view' | 'add' | 'edit' | 'delete' | 'status' | 'delete-multi';

type CategoriesContextValue = {
  open: CategoriesDialogType | null;
  setOpen: (value: CategoriesDialogType | null) => void;
  currentRow: ICategoryOut | null;
  setCurrentRow: Dispatch<SetStateAction<ICategoryOut | null>>;
};

const CategoriesContext = createContext<CategoriesContextValue | null>(null);

export function CategoriesProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useDialogState<CategoriesDialogType>(null);
  const [currentRow, setCurrentRow] = useState<ICategoryOut | null>(null);
  const value = useMemo(() => ({ open, setOpen, currentRow, setCurrentRow }), [open, setOpen, currentRow]);

  return <CategoriesContext value={value}>{children}</CategoriesContext>;
}

export function useCategories() {
  const context = useContext(CategoriesContext);
  if (!context) throw new Error('useCategories must be used within a CategoriesProvider');
  return context;
}
