
'use client';

import { createContext, type ReactNode, useCallback, useContext, useMemo, useState } from 'react';
import type { AvailabilityFilter, IAvailabilityProduct } from './type';

interface IAvailabilityContext {
  selectedProduct: IAvailabilityProduct | null;
  setSelectedProduct: (product: IAvailabilityProduct | null) => void;
  startDate: string;
  endDate: string;
  setRange: (startDate: string, endDate: string) => void;
  isAssetDrawerOpen: boolean;
  setAssetDrawerOpen: (open: boolean) => void;
  assetTab: AvailabilityFilter;
  setAssetTab: (tab: AvailabilityFilter) => void;
}

const AvailabilityContext = createContext<IAvailabilityContext | null>(null);

export function AvailabilityProvider({ children }: { children: ReactNode }) {
  const [selectedProduct, setSelectedProduct] = useState<IAvailabilityProduct | null>(null);
  const [range, setRangeState] = useState({ startDate: '', endDate: '' });
  const [isAssetDrawerOpen, setAssetDrawerOpen] = useState(false);
  const [assetTab, setAssetTab] = useState<AvailabilityFilter>('AVAILABLE');
  const setRange = useCallback((startDate: string, endDate: string) => setRangeState({ startDate, endDate }), []);
  const value = useMemo(
    () => ({
      selectedProduct,
      setSelectedProduct,
      startDate: range.startDate,
      endDate: range.endDate,
      setRange,
      isAssetDrawerOpen,
      setAssetDrawerOpen,
      assetTab,
      setAssetTab,
    }),
    [selectedProduct, range.startDate, range.endDate, setRange, isAssetDrawerOpen, assetTab],
  );
  return <AvailabilityContext value={value}>{children}</AvailabilityContext>;
}

export function useAvailability() {
  const context = useContext(AvailabilityContext);
  if (!context) throw new Error('useAvailability must be used within <AvailabilityProvider>');
  return context;
}
