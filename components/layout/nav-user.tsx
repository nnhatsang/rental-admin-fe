'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from '@/components/ui/sidebar';
import { cn, getInitials } from '@/lib/utils';
import { useAuthStore } from '@/modules/auth/store';
import { ERROR_MESSAGES } from '@/utils/consts/message-error.const';
import { SUCCESS_MESSAGES } from '@/utils/consts/messages-success.const';
import { IconLogout, IconMessage2, IconUserCircle } from '@tabler/icons-react';
import type { ComponentProps } from 'react';
import { toast } from 'sonner';

type NavUserVariant = 'sidebar' | 'header';
type DropdownSide = ComponentProps<typeof DropdownMenuContent>['side'];
type DropdownAlign = ComponentProps<typeof DropdownMenuContent>['align'];

type NavUserProps = {
  variant?: NavUserVariant;
  side?: DropdownSide;
  align?: DropdownAlign;
  showEmail?: boolean;
  className?: string;
};

export function NavUser({ variant = 'sidebar', side, align = 'end', showEmail, className }: NavUserProps) {
  const { isMobile } = useSidebar();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  if (!user) return null;

  const isSidebar = variant === 'sidebar';
  const shouldShowEmail = showEmail ?? isSidebar;
  const dropdownSide = side ?? (isSidebar ? (isMobile ? 'bottom' : 'right') : 'bottom');
  const handleLogout = () => {
    try {
      logout();
      toast.success(SUCCESS_MESSAGES.AUTH.LOGOUT);
    } catch {
      toast.error(ERROR_MESSAGES.AUTH.LOGOUT);
    }
  };
  const userInfo = (
    <>
      <Avatar className={cn('h-8 w-8 rounded-lg', isSidebar && 'grayscale')}>
        <AvatarImage src={user.avatar || undefined} alt={user.fullName} />
        <AvatarFallback className="rounded-lg">{getInitials(user.fullName)}</AvatarFallback>
      </Avatar>
      <div className={cn('grid flex-1 text-left text-sm leading-tight', !shouldShowEmail && 'hidden sm:grid')}>
        <span className="truncate font-medium">{user.fullName}</span>
        {shouldShowEmail && <span className="truncate text-muted-foreground text-xs">{user.email}</span>}
      </div>
    </>
  );

  const menu = (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {isSidebar ? (
          <SidebarMenuButton
            size="lg"
            className={cn(
              'data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground',
              className,
            )}
          >
            {userInfo}
          </SidebarMenuButton>
        ) : (
          <Button type="button" variant="ghost" className={cn('h-9 gap-2 px-2 data-[state=open]:bg-accent', className)}>
            {userInfo}
          </Button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className={cn(isSidebar ? 'w-(--radix-dropdown-menu-trigger-width)' : 'w-64', 'min-w-56 rounded-lg')}
        side={dropdownSide}
        align={align}
        sideOffset={4}
      >
        <DropdownMenuLabel className="p-0 font-normal">
          <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
            <Avatar className="h-8 w-8 rounded-lg">
              <AvatarImage src={user.avatar || undefined} alt={user.fullName} />
              <AvatarFallback className="rounded-lg">{getInitials(user.fullName)}</AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">{user.fullName}</span>
              <span className="truncate text-muted-foreground text-xs">{user.email}</span>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <IconUserCircle /> Tài khoản
          </DropdownMenuItem>

          <DropdownMenuItem>
            <IconMessage2 /> Thông báo
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          <IconLogout /> Đăng xuất
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  if (!isSidebar) {
    return menu;
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>{menu}</SidebarMenuItem>
    </SidebarMenu>
  );
}
