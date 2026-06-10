'use client';
import { Toaster } from '@/components/ui/sonner';
import { QueryProvider } from './QueryProvider';
import { ThemeProvider } from './theme-provider';
import { TooltipProvider } from '@/components/ui/tooltip';
import { useAuthStore } from '@/stores/auth.store';
import { redirect } from 'next/navigation';
import { PATHNAME } from '@/utils/consts/pathname.const';

export const Providers: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const { isAuthenticated } = useAuthStore();

  if (isAuthenticated) {
    redirect(PATHNAME.HOME);
  }

  return (
    <QueryProvider>
      <ThemeProvider attribute="class" defaultTheme="light">
        <Toaster richColors position="bottom-right" />
        <TooltipProvider>{children}</TooltipProvider>
      </ThemeProvider>
    </QueryProvider>
  );
};
