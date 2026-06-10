'use client';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { filterSidebarItemsByPermissions, sidebarItems } from '@/navigation/sidebar/sidebar-items';
import { useAuthStore } from '@/stores/auth.store';
import { IconCamera } from '@tabler/icons-react';
import Link from 'next/link';
import { NavMain } from './nav-main';
import { NavUser } from './nav-user';
import { useShallow } from 'zustand/react/shallow';
import { usePreferencesStore } from '@/providers/preferences-provider';

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const permissions = useAuthStore((state) => state.permissions);
  const visibleSidebarItems = filterSidebarItemsByPermissions(sidebarItems, permissions);
  const { sidebarVariant, sidebarCollapsible, isSynced } = usePreferencesStore(
    useShallow((s) => ({
      sidebarVariant: s.sidebarVariant,
      sidebarCollapsible: s.sidebarCollapsible,
      isSynced: s.isSynced,
    })),
  );

  const variant = isSynced ? sidebarVariant : props.variant;
  const collapsible = isSynced ? sidebarCollapsible : props.collapsible;

  return (
    <Sidebar {...props} variant={variant} collapsible={collapsible}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link prefetch={false} href="/">
                <IconCamera />
                <span className="font-semibold text-base">Rental Admin</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={visibleSidebarItems} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
