'use client';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { AuthProvider } from './AuthProvider';
import { QueryProvider } from './QueryProvider';
import { PREFERENCE_DEFAULTS } from '@/lib/preferences/preferences-config';
import { PreferencesStoreProvider } from './preferences-provider';
import { ThemeProvider } from './theme-provider';

export const Providers: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const { theme_preset, content_layout, navbar_style, sidebar_variant, sidebar_collapsible } = PREFERENCE_DEFAULTS;
  return (
    <QueryProvider>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
        <PreferencesStoreProvider
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
      </ThemeProvider>
    </QueryProvider>
  );
};
