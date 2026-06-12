'use client';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { AuthProvider } from './AuthProvider';
import { QueryProvider } from './QueryProvider';
// import { ThemeProvider } from './theme-provider';
import { PREFERENCE_DEFAULTS } from '@/lib/preferences/preferences-config';
import { PreferencesStoreProvider } from './preferences-provider';

export const Providers: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const { theme_mode, theme_preset, content_layout, navbar_style, sidebar_variant, sidebar_collapsible } =
    PREFERENCE_DEFAULTS;
  return (
    <QueryProvider>
      <PreferencesStoreProvider
        themeMode={theme_mode}
        themePreset={theme_preset}
        contentLayout={content_layout}
        navbarStyle={navbar_style}
        // font={font}
      >
        <Toaster richColors position="bottom-right" />
        <TooltipProvider>
          <AuthProvider>{children}</AuthProvider>
        </TooltipProvider>
      </PreferencesStoreProvider>
    </QueryProvider>
  );
};
