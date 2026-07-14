import { AdminHeader } from '@/components/layout/admin-header';
import { AppSidebar } from '@/components/layout/app-sidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { getLayoutPreferences } from '@/components/layout/server/layout-preferences';
import { Metadata } from 'next';
import { TITLE_PAGE } from '@/utils/consts/title-page.const';
import { cn } from '@/lib/utils';
import { PermissionProvider } from '@/providers/PermissionProvider';

const AdminLayout: React.FC<Readonly<{ children: React.ReactNode }>> = async ({ children }) => {
  const { defaultOpen, variant, collapsible } = await getLayoutPreferences();

  return (
    <SidebarProvider
      defaultOpen={defaultOpen}
      style={
        {
          '--sidebar-width': 'calc(var(--spacing) * 68)',
        } as React.CSSProperties
      }
    >
      <AppSidebar variant={variant} collapsible={collapsible} />
      <SidebarInset
        className={cn(
          '[html[data-content-layout=centered]_&>*]:mx-auto',
          '[html[data-content-layout=centered]_&>*]:w-full',
          '[html[data-content-layout=centered]_&>*]:max-w-screen-2xl',
          // 'peer-data-[variant=inset]:border',
          '[--dashboard-header-height:--spacing(12)]',
        )}
      >
        <AdminHeader />
        <div className="h-full min-w-0 p-4 has-data-[content-padding=false]:p-0 md:p-6 md:has-data-[content-padding=false]:p-0">
          <PermissionProvider>
            {children}
            </PermissionProvider>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default AdminLayout;

export const metadata: Metadata = {
  title: TITLE_PAGE.DASHBOARD,
};
