'use client';

import {
  createContext,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
  useContext,
  useMemo,
  useState,
} from 'react';
import { IRoleOut } from './type';
import useDialogState from '@/hooks/use-dialog-state';

export type RolesDialogType = 'view' | 'add' | 'edit' | 'delete' | 'delete-multi' | 'assgin';
type RolesContextValuse = {
  open: RolesDialogType | null;
  setOpen: (str: RolesDialogType | null) => void;
  currentRow: IRoleOut | null;
  setCurrentRow: Dispatch<SetStateAction<IRoleOut | null>>;
};
const RolesContext = createContext<RolesContextValuse | null>(null);

export function RolesProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useDialogState<RolesDialogType>(null);
  const [currentRow, setCurrentRow] = useState<IRoleOut | null>(null);
  const value = useMemo(
    () => ({ open, setOpen, currentRow, setCurrentRow }),
    [open, setOpen, currentRow, setCurrentRow],
  );
  return <RolesContext value={value}>{children}</RolesContext>;
}

export function useRoles() {
  const context = useContext(RolesContext);
  if (!context) {
    throw new Error('useContext must be used within <RolesProvider>');
  }

  return context;
}
