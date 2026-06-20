'use client';

import { Button } from '@/components/ui/button';
import { IconDeviceImac, IconMoon, IconSun } from '@tabler/icons-react';
import { usePreferencesStore } from '@/providers/preferences-provider';
const THEME_CYCLE = ['light', 'dark', 'system'] as const;

export function ThemeSwitcher() {
  const themeMode = usePreferencesStore((s) => s.themeMode);
  const setThemeMode = usePreferencesStore((s) => s.setThemeMode);

  const cycleTheme = () => {
    const currentIndex = THEME_CYCLE.indexOf(themeMode);
    const nextTheme = THEME_CYCLE[(currentIndex + 1) % THEME_CYCLE.length];

    setThemeMode(nextTheme);
    // document.cookie = `theme_mode=${nextTheme}; path=/; max-age=${60 * 60 * 24 * 365}`;
  };

  return (
    <Button size="icon" onClick={cycleTheme} aria-label={`Current theme: ${themeMode}. Click to cycle themes`}>
      {/* SYSTEM */}
      <IconDeviceImac className="hidden [html[data-theme-mode=system]_&]:block" />

      {/* DARK (resolved) */}
      <IconSun className="hidden dark:block [html[data-theme-mode=system]_&]:hidden" />

      {/* LIGHT (resolved) */}
      <IconMoon className="block dark:hidden [html[data-theme-mode=system]_&]:hidden" />
    </Button>
  );
}
