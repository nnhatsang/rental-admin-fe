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
import type { IAssetUnitOut } from './type';

export type AssetUnitsDialogType = 'view' | 'add' | 'edit' | 'delete' | 'delete-multi' | 'status';

type AssetUnitsContextValue = {
  open: AssetUnitsDialogType | null;
  setOpen: (value: AssetUnitsDialogType | null) => void;
  currentRow: IAssetUnitOut | null;
  setCurrentRow: Dispatch<SetStateAction<IAssetUnitOut | null>>;
};

const AssetUnitsContext = createContext<AssetUnitsContextValue | null>(null);

export function AssetUnitsProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useDialogState<AssetUnitsDialogType>(null);
  const [currentRow, setCurrentRow] = useState<IAssetUnitOut | null>(null);
  const value = useMemo(() => ({ open, setOpen, currentRow, setCurrentRow }), [open, setOpen, currentRow]);

  return <AssetUnitsContext value={value}>{children}</AssetUnitsContext>;
}

export function useAssetUnits() {
  const context = useContext(AssetUnitsContext);

  if (!context) {
    throw new Error('useAssetUnits must be used within <AssetUnitsProvider>');
  }

  return context;
}
