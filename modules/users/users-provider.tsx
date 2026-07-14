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
import type { IUserOut } from './type';
import useDialogState from '@/hooks/use-dialog-state';

export type UsersDialogType = 'view' | 'add' | 'edit' | 'delete' | 'reset-password' | 'delete-multi';

type UsersContextValue = {
  open: UsersDialogType | null;
  setOpen: (str: UsersDialogType | null) => void;
  currentRow: IUserOut | null;
  setCurrentRow: Dispatch<SetStateAction<IUserOut | null>>;
};

const UsersContext = createContext<UsersContextValue | null>(null);

export function UsersProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useDialogState<UsersDialogType>(null);
  const [currentRow, setCurrentRow] = useState<IUserOut | null>(null);
  const value = useMemo(
    () => ({ open, setOpen, currentRow, setCurrentRow }),
    [open, setOpen, currentRow, setCurrentRow],
  );
  return <UsersContext value={value}>{children}</UsersContext>;
}

export function useUsers() {
  const context = useContext(UsersContext);

  if (!context) {
    throw new Error('useUsers must be used within <UsersProvider>');
  }

  return context;
}
