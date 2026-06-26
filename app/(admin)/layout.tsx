import { AdminHeader } from '@/components/layout/admin-header';
import { AppSidebar } from '@/components/layout/app-sidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { getLayoutPreferences } from '@/components/layout/server/layout-preferences';

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
      <SidebarInset>
        <AdminHeader />
        <div className="h-full p-4 has-data-[content-padding=false]:p-0 md:p-6 md:has-data-[content-padding=false]:p-0">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default AdminLayout;
