'use client';

import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { type StoreApi, useStore } from 'zustand';
import { useTheme } from 'next-themes';

import {
  CONTENT_LAYOUT_VALUES,
  NAVBAR_STYLE_VALUES,
  SIDEBAR_COLLAPSIBLE_VALUES,
  SIDEBAR_VARIANT_VALUES,
} from '@/lib/preferences/layout';
import { THEME_PRESET_VALUES } from '@/lib/preferences/theme';
import { createPreferencesStore, PreferencesState } from '@/stores/preferences/preferences-store';

const PreferencesStoreContext = createContext<StoreApi<PreferencesState> | null>(null);

function getSafeValue<T extends string>(raw: string | null, allowed: readonly T[]): T | undefined {
  if (!raw) return undefined;
  return allowed.includes(raw as T) ? (raw as T) : undefined;
}

function readDomState(): Partial<PreferencesState> {
  const root = document.documentElement;

  return {
    themePreset: getSafeValue(root.getAttribute('data-theme-preset'), THEME_PRESET_VALUES),
    contentLayout: getSafeValue(root.getAttribute('data-content-layout'), CONTENT_LAYOUT_VALUES),
    navbarStyle: getSafeValue(root.getAttribute('data-navbar-style'), NAVBAR_STYLE_VALUES),
    sidebarVariant: getSafeValue(root.getAttribute('data-sidebar-variant'), SIDEBAR_VARIANT_VALUES),
    sidebarCollapsible: getSafeValue(root.getAttribute('data-sidebar-collapsible'), SIDEBAR_COLLAPSIBLE_VALUES),
  };
}

export const PreferencesStoreProvider = ({
  children,
  themePreset,
  contentLayout,
  navbarStyle,
}: {
  children: React.ReactNode;
  themePreset: PreferencesState['themePreset'];
  contentLayout: PreferencesState['contentLayout'];
  navbarStyle: PreferencesState['navbarStyle'];
}) => {
  const [store] = useState<StoreApi<PreferencesState>>(() =>
    createPreferencesStore({
      themePreset,
      contentLayout,
      navbarStyle,
    }),
  );

  const domSnapshotRef = useRef<Partial<PreferencesState> | null>(null);
  const { theme, setTheme, resolvedTheme } = useTheme();

  useEffect(() => {
    const domState = readDomState();
    domSnapshotRef.current = domState;

    store.setState((prev) => ({
      ...prev,
      ...domState,
      isSynced: true,
    }));
  }, [store]);

  // Đồng bộ theme từ next-themes sang Zustand store & DOM attribute
  useEffect(() => {
    if (theme) {
      store.setState((prev) => ({
        ...prev,
        themeMode: theme as PreferencesState['themeMode'],
        resolvedThemeMode: (resolvedTheme ?? 'light') as PreferencesState['resolvedThemeMode'],
      }));

      // Đồng bộ attribute data-theme-mode cho CSS selectors và colorScheme
      document.documentElement.setAttribute('data-theme-mode', theme);
      document.documentElement.style.colorScheme = resolvedTheme ?? 'light';
    }
  }, [theme, resolvedTheme, store]);

  // Đồng bộ thay đổi từ Zustand store sang next-themes
  useEffect(() => {
    const unsubscribeStore = store.subscribe((s, p) => {
      if (s.themeMode !== p.themeMode) {
        setTheme(s.themeMode);
      }
    });

    return () => {
      unsubscribeStore();
    };
  }, [store, setTheme]);

  return <PreferencesStoreContext.Provider value={store}>{children}</PreferencesStoreContext.Provider>;
};

export const usePreferencesStore = <T,>(selector: (state: PreferencesState) => T): T => {
  const store = useContext(PreferencesStoreContext);
  if (!store) throw new Error('Missing PreferencesStoreProvider');
  return useStore(store, selector);
};
