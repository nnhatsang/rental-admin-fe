'use client';

import useDialogState from '@/hooks/use-dialog-state';
import { createContext, type Dispatch, type ReactNode, type SetStateAction, useContext, useMemo, useState } from 'react';
import { ICustomerOut } from './type';

export type CustomersDialogType = 'view' | 'add' | 'edit' | 'delete' | 'status' | 'delete-multi';

type CustomersContextValue = {
  open: CustomersDialogType | null;
  setOpen: (value: CustomersDialogType | null) => void;
  currentRow: ICustomerOut | null;
  setCurrentRow: Dispatch<SetStateAction<ICustomerOut | null>>;
};
const CustomersContext = createContext<CustomersContextValue | null>(null);

export function CustomersProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useDialogState<CustomersDialogType>(null);
  const [currentRow, setCurrentRow] = useState<ICustomerOut | null>(null);
  const value = useMemo(
    () => ({ open, setOpen, currentRow, setCurrentRow }),
    [open, setOpen, currentRow, setCurrentRow],
  );
  return <CustomersContext value={value}>{children}</CustomersContext>;
}

export function useCustomers() {
  const context = useContext(CustomersContext);
  if (!context) {
    throw new Error('useCustomers must be used within a CustomersProvider');
  }
  return context;
}
