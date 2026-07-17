'use client';

import useDialogState from '@/hooks/use-dialog-state';
import {
  createContext,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
  useContext,
  useMemo,
  useState,
} from 'react';
import type { IProductOut } from './type';

export type ProductsDialogType = 'view' | 'add' | 'edit' | 'delete' | 'delete-multi' | 'status';

type ProductsContextValue = {
  open: ProductsDialogType | null;
  setOpen: (value: ProductsDialogType | null) => void;
  currentRow: IProductOut | null;
  setCurrentRow: Dispatch<SetStateAction<IProductOut | null>>;
};

const ProductsContext = createContext<ProductsContextValue | null>(null);

export function ProductsProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useDialogState<ProductsDialogType>(null);
  const [currentRow, setCurrentRow] = useState<IProductOut | null>(null);
  const value = useMemo(() => ({ open, setOpen, currentRow, setCurrentRow }), [open, setOpen, currentRow]);

  return <ProductsContext value={value}>{children}</ProductsContext>;
}

export function useProducts() {
  const context = useContext(ProductsContext);

  if (!context) {
    throw new Error('useProducts must be used within <ProductsProvider>');
  }

  return context;
}
